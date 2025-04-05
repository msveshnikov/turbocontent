import { useState, useContext, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    useToast,
    Select,
    Container,
    Card,
    CardBody,
    SimpleGrid,
    Stack,
    Badge,
    Link,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Collapse
} from '@chakra-ui/react';
import { API_URL, UserContext } from './App';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [contentList, setContentList] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [expandedContentId, setExpandedContentId] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            setContentLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/profile/content`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setContentList(data);
                } else {
                    toast({
                        title: 'Error loading content',
                        description: 'Failed to load generated content.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true
                    });
                }
            } catch (error) {
                console.error('Error fetching content:', error);
                toast({
                    title: 'Error loading content',
                    description: 'Failed to load generated content.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            } finally {
                setContentLoading(false);
            }
        };

        fetchContent();
    }, [toast]);

    const handleChange = (section, field, value) => {
        setUser((prev) => ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [field]: value
            }
        }));
    };

    const handleBasicChange = (field, value) => {
        setUser((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(API_URL + '/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    researchPreferences: user?.researchPreferences,
                    presentationSettings: user?.presentationSettings,
                    preferences: user?.preferences
                })
            });
            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Error updating profile',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Error updating profile',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteContent = async (contentId) => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            setContentLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/profile/content/${contentId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    setContentList(contentList.filter((content) => content._id !== contentId));
                    toast({
                        title: 'Content deleted',
                        status: 'success',
                        duration: 3000,
                        isClosable: true
                    });
                } else {
                    toast({
                        title: 'Error deleting content',
                        status: 'error',
                        duration: 3000,
                        isClosable: true
                    });
                }
            } catch (error) {
                console.error('Error deleting content:', error);
                toast({
                    title: 'Error deleting content',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            } finally {
                setContentLoading(false);
            }
        }
    };

    const toggleContentExpansion = (contentId) => {
        setExpandedContentId(expandedContentId === contentId ? null : contentId);
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Card>
                <CardBody>
                    <VStack spacing={8}>
                        <Box w="100%">
                            <Stack direction="row" justify="space-between" align="center" mb={4}>
                                <Text fontSize="xl">Subscription</Text>
                                <Badge
                                    colorScheme={
                                        user?.subscriptionStatus === 'active' ||
                                        user?.subscriptionStatus === 'trialing'
                                            ? 'green'
                                            : 'gray'
                                    }
                                >
                                    {user?.subscriptionStatus === 'active' ||
                                    user?.subscriptionStatus === 'trialing'
                                        ? 'Premium'
                                        : 'Free'}
                                </Badge>
                            </Stack>
                            {!(
                                user?.subscriptionStatus === 'active' ||
                                user?.subscriptionStatus === 'trialing'
                            ) ? (
                                <Link href="https://buy.stripe.com/00gdSPetHeEfgUg9AI" isExternal>
                                    <Button disabled={!user} colorScheme="orange">
                                        Upgrade to Premium ($7.99/mo)
                                    </Button>
                                </Link>
                            ) : (
                                <Link
                                    href={
                                        'https://billing.stripe.com/p/login/9AQ8zd8ZL79E51e000?prefilled_email=' +
                                        user?.email
                                    }
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <Button colorScheme="purple" mt={1} ml={1}>
                                        Customer Portal
                                    </Button>
                                </Link>
                            )}
                        </Box>
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <VStack spacing={6} align="stretch">
                                <Heading size="md">Basic Information</Heading>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel>First Name</FormLabel>
                                        <Input
                                            value={user?.firstName || ''}
                                            onChange={(e) =>
                                                handleBasicChange('firstName', e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Last Name</FormLabel>
                                        <Input
                                            value={user?.lastName || ''}
                                            onChange={(e) =>
                                                handleBasicChange('lastName', e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Email</FormLabel>
                                        <Input value={user?.email || ''} isReadOnly />
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                            <VStack spacing={6} align="stretch" mt={8}>
                                <Heading size="md">Research Preferences</Heading>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel>Field of Research</FormLabel>
                                        <Input
                                            value={user?.researchPreferences?.field || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'researchPreferences',
                                                    'field',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Preferred Data Sources</FormLabel>
                                        <Input
                                            value={user?.researchPreferences?.dataSources || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'researchPreferences',
                                                    'dataSources',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Level of AI Assistance</FormLabel>
                                        <Select
                                            value={user?.researchPreferences?.aiAssistance || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'researchPreferences',
                                                    'aiAssistance',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Select level</option>
                                            <option value="minimal">Minimal</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="full">Full</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                            <VStack spacing={6} align="stretch" mt={8}>
                                <Heading size="md">Presentation Settings</Heading>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel>Default Slide Layout</FormLabel>
                                        <Select
                                            value={user?.presentationSettings?.slideLayout || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'presentationSettings',
                                                    'slideLayout',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Select layout</option>
                                            <option value="Default">Default</option>
                                            <option value="Title Slide">Title Slide</option>
                                            <option value="Bullet List">Bullet List</option>
                                            <option value="Image Focused">Image Focused</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Theme</FormLabel>
                                        <Select
                                            value={user?.presentationSettings?.theme || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'presentationSettings',
                                                    'theme',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Select theme</option>
                                            <option value="Light">Light</option>
                                            <option value="Dark">Dark</option>
                                            <option value="Auto">Auto</option>
                                            <option value="Primary Blue">Primary Blue</option>
                                            <option value="Secondary Blue">Secondary Blue</option>
                                            <option value="Vibrant Accent">Vibrant Accent</option>
                                            <option value="Olive Green">Olive Green</option>
                                            <option value="Sunset">Sunset</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>

                            <Box mt={8}>
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    isLoading={isLoading}
                                    width="100%"
                                >
                                    Save
                                </Button>
                            </Box>
                        </form>

                        <VStack spacing={4} width="100%" mt={8} align="stretch">
                            <Heading size="md">Generated Content</Heading>
                            {contentLoading ? (
                                <Text>Loading generated content...</Text>
                            ) : contentList.length === 0 ? (
                                <Text>No content generated yet.</Text>
                            ) : (
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Topic</Th>
                                            <Th>Platform</Th>
                                            <Th>Created</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {contentList.map((content) => (
                                            <Tr key={content._id}>
                                                <Td>{content.topic}</Td>
                                                <Td>{content.platform}</Td>
                                                <Td>
                                                    {formatDistanceToNow(
                                                        new Date(content.createdAt),
                                                        {
                                                            addSuffix: true
                                                        }
                                                    )}
                                                </Td>
                                                <Td>
                                                    <Stack direction="row" spacing={2}>
                                                        <IconButton
                                                            icon={<ViewIcon />}
                                                            aria-label="View Content"
                                                            size="sm"
                                                            onClick={() =>
                                                                toggleContentExpansion(content._id)
                                                            }
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            aria-label="Delete Content"
                                                            size="sm"
                                                            colorScheme="red"
                                                            onClick={() =>
                                                                handleDeleteContent(content._id)
                                                            }
                                                        />
                                                    </Stack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            )}
                        </VStack>
                        {contentList.map((content) => (
                            <Collapse
                                key={content._id}
                                in={expandedContentId === content._id}
                                animateOpacity
                            >
                                <Card mt={4} boxShadow="sm">
                                    <CardBody>
                                        <VStack align="start" spacing={4}>
                                            <Heading size="sm">Content Options</Heading>
                                            {content.contentOptions.map((option, index) => (
                                                <Box
                                                    key={index}
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                    borderRadius="md"
                                                    p={4}
                                                    mb={2}
                                                    width="100%"
                                                >
                                                    <Text fontWeight="bold">
                                                        Option {index + 1}
                                                    </Text>
                                                    <Text mt={2}>Text: {option.text}</Text>
                                                    <Text mt={2}>Hashtags: {option.hashtags}</Text>
                                                    <Text mt={2}>Alt Text: {option.altText}</Text>
                                                </Box>
                                            ))}
                                            <Text fontSize="sm" color="gray.500">
                                                Created:{' '}
                                                {new Date(content.createdAt).toLocaleString()}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </Collapse>
                        ))}
                    </VStack>
                </CardBody>
            </Card>
        </Container>
    );
};

export default Profile;
