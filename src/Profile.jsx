import { useState, useContext, useEffect, Fragment } from 'react';
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
    Collapse,
    InputGroup,
    InputLeftElement,
    Icon,
    Spinner,
    Center,
    useColorModeValue
} from '@chakra-ui/react';
import { API_URL, UserContext } from './App';
import { DeleteIcon, ViewIcon, Search2Icon, ExternalLinkIcon } from '@chakra-ui/icons';
import { markdownToJSX } from './Content';

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [contentList, setContentList] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [expandedContentId, setExpandedContentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredContentList, setFilteredContentList] = useState([]);

    const cardBg = useColorModeValue('white', 'gray.700');
    const tableHeaderBg = useColorModeValue('gray.50', 'gray.600');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    // Fetch user profile data if not already loaded (e.g., on page refresh)
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setIsLoading(true);
                try {
                    const response = await fetch(`${API_URL}/api/profile`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUser(data);
                    } else {
                        // Handle error, maybe redirect to login
                        console.error('Failed to fetch profile');
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user, setUser]);

    // Fetch generated content
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
                    // Sort content by creation date, newest first
                    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setContentList(data);
                    setFilteredContentList(data); // Initialize filtered list
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
                    description: 'An unexpected error occurred.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            } finally {
                setContentLoading(false);
            }
        };

        if (user) {
            // Only fetch content if user is loaded
            fetchContent();
        }
    }, [toast, user]); // Depend on user to ensure token is available

    // Filter content based on search query
    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = contentList.filter((content) => {
            return (
                content.topic?.toLowerCase().includes(lowerCaseQuery) ||
                content.platform?.toLowerCase().includes(lowerCaseQuery) ||
                content.goal?.toLowerCase().includes(lowerCaseQuery) ||
                content.tone?.toLowerCase().includes(lowerCaseQuery) ||
                content.contentOptions?.some((opt) =>
                    opt.text?.toLowerCase().includes(lowerCaseQuery)
                )
            );
        });
        setFilteredContentList(filtered);
    }, [searchQuery, contentList]);

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
                    lastName: user?.lastName
                    // Add other updatable fields here if needed in the future
                    // preferences: user?.preferences,
                })
            });
            const updatedUser = await response.json();
            if (response.ok) {
                setUser(updatedUser); // Update user context with potentially updated data from server
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
                    description: updatedUser.error || 'Error updating profile',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            }
        } catch (error) {
            console.error('Profile update error:', error);
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
        if (
            window.confirm(
                'Are you sure you want to delete this generated content? This action cannot be undone.'
            )
        ) {
            // Optimistically remove from UI first
            const originalContentList = [...contentList];
            setContentList((prevList) => prevList.filter((content) => content._id !== contentId));

            try {
                const response = await fetch(`${API_URL}/api/profile/content/${contentId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    toast({
                        title: 'Content deleted',
                        status: 'success',
                        duration: 3000,
                        isClosable: true
                    });
                    // Content already removed optimistically
                } else {
                    // Revert UI changes if deletion failed
                    setContentList(originalContentList);
                    const errorData = await response.json();
                    toast({
                        title: 'Error deleting content',
                        description: errorData.message || 'Failed to delete content on the server.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true
                    });
                }
            } catch (error) {
                // Revert UI changes if network error occurred
                setContentList(originalContentList);
                console.error('Error deleting content:', error);
                toast({
                    title: 'Error deleting content',
                    description: 'An unexpected error occurred.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            }
        }
    };

    const toggleContentExpansion = (contentId) => {
        setExpandedContentId(expandedContentId === contentId ? null : contentId);
    };

    if (!user && isLoading) {
        return (
            <Center h="80vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (!user && !isLoading) {
        // Could redirect to login or show a message
        return (
            <Container maxW="container.lg" py={8}>
                <Text>Please log in to view your profile.</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Profile Information Card */}
                <Card bg={cardBg} shadow="md">
                    <CardBody>
                        <Heading size="lg" mb={6}>
                            My Profile
                        </Heading>
                        <VStack spacing={6} align="stretch">
                            {/* Subscription Section */}
                            <Box borderBottomWidth="1px" pb={6} borderColor={borderColor}>
                                <Stack
                                    direction={{ base: 'column', md: 'row' }}
                                    justify="space-between"
                                    align="center"
                                    spacing={4}
                                >
                                    <Heading size="md">Subscription</Heading>
                                    <Badge
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
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
                                <Box mt={4}>
                                    {!(
                                        user?.subscriptionStatus === 'active' ||
                                        user?.subscriptionStatus === 'trialing'
                                    ) ? (
                                        <Link
                                            // href={process.env.VITE_STRIPE_PREMIUM_LINK || '#'}
                                            isExternal
                                            _hover={{ textDecoration: 'none' }}
                                        >
                                            <Button
                                                colorScheme="orange"
                                                w={{ base: 'full', md: 'auto' }}
                                            >
                                                Upgrade to Premium
                                                <Icon as={ExternalLinkIcon} ml={2} />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link
                                            // href={
                                            //     process.env.VITE_STRIPE_PORTAL_LINK && user?.email
                                            //         ? `${process.env.VITE_STRIPE_PORTAL_LINK}?prefilled_email=${encodeURIComponent(user.email)}`
                                            //         : '#'
                                            // }
                                            isExternal
                                            _hover={{ textDecoration: 'none' }}
                                        >
                                            <Button
                                                colorScheme="purple"
                                                w={{ base: 'full', md: 'auto' }}
                                            >
                                                Manage Subscription
                                                <Icon as={ExternalLinkIcon} ml={2} />
                                            </Button>
                                        </Link>
                                    )}
                                </Box>
                            </Box>

                            {/* Basic Information Form */}
                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md">Basic Information</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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
                                        <FormControl id="email" gridColumn={{ md: '1 / span 2' }}>
                                            <FormLabel>Email</FormLabel>
                                            <Input
                                                value={user?.email || ''}
                                                isReadOnly
                                                _disabled={{ opacity: 0.7, cursor: 'not-allowed' }}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                    <Box pt={2}>
                                        <Button
                                            type="submit"
                                            colorScheme="blue"
                                            isLoading={isLoading}
                                            w={{ base: 'full', md: 'auto' }}
                                        >
                                            Save Changes
                                        </Button>
                                    </Box>
                                </VStack>
                            </form>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Generated Content Card */}

                <VStack spacing={4} width="100%" align="stretch">
                    <Heading size="lg" mb={2}>
                        Generated Content History
                    </Heading>

                    <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                            <Search2Icon />
                        </InputLeftElement>

                        <Input
                            type="text"
                            placeholder="Search history by topic, platform, goal, tone, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>

                    {contentLoading ? (
                        <Center py={10}>
                            <Spinner size="lg" />
                            <Text ml={4}>Loading generated content...</Text>
                        </Center>
                    ) : filteredContentList.length === 0 ? (
                        <Center py={10}>
                            <Text color="gray.500">
                                {contentList.length === 0
                                    ? "You haven't generated any content yet."
                                    : 'No content matches your search.'}
                            </Text>
                        </Center>
                    ) : (
                        <Table variant="simple" size="md">
                            <Thead bg={tableHeaderBg}>
                                <Tr>
                                    <Th>Topic</Th>
                                    {/* <Th>Platform</Th> */}
                                    {/* <Th>Goal</Th>
                                                <Th>Tone</Th> */}
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredContentList.map((content) => (
                                    <Fragment key={content._id}>
                                        <Tr key={content._id}>
                                            <Td maxW="200px" whiteSpace="normal">
                                                {content.topic || '-'}
                                            </Td>
                                            {/* <Td>
                                                        <Badge
                                                            colorScheme={getPlatformColorScheme(
                                                                content.platform
                                                            )}
                                                        >
                                                            {content.platform || '-'}
                                                        </Badge>
                                                    </Td> */}
                                            {/* <Td>{content.goal || '-'}</Td>
                                                        <Td>{content.tone || '-'}</Td> */}

                                            <Td>
                                                <Stack direction="row" spacing={2}>
                                                    <IconButton
                                                        icon={<ViewIcon />}
                                                        aria-label="View Content Details"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            toggleContentExpansion(content._id)
                                                        }
                                                        isActive={expandedContentId === content._id}
                                                    />
                                                    <IconButton
                                                        icon={<DeleteIcon />}
                                                        aria-label="Delete Content"
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleDeleteContent(content._id)
                                                        }
                                                    />
                                                </Stack>
                                            </Td>
                                        </Tr>
                                        {/* Collapsible Row for Details */}
                                        <Tr key={`${content._id}-details`} p={0} m={0}>
                                            <Td colSpan={6} p={0} m={0} border="none">
                                                <Collapse
                                                    in={expandedContentId === content._id}
                                                    animateOpacity
                                                    style={{ width: '100%' }}
                                                >
                                                    <VStack align="start" spacing={4}>
                                                        {
                                                            <Box
                                                                overflowX="auto"
                                                                bg="white"
                                                                p={4}
                                                                shadow="md"
                                                                borderWidth="1px"
                                                                borderRadius="md"
                                                            >
                                                                <Text
                                                                    fontSize="md"
                                                                    whiteSpace="pre-line"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: markdownToJSX(
                                                                            content.content
                                                                        )
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        <Text fontSize="xs" color="gray.500">
                                                            Generated on:{' '}
                                                            {content.createdAt
                                                                ? new Date(
                                                                      content.createdAt
                                                                  ).toLocaleString()
                                                                : 'N/A'}
                                                        </Text>
                                                    </VStack>
                                                </Collapse>
                                            </Td>
                                        </Tr>
                                    </Fragment>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </VStack>
            </VStack>
        </Container>
    );
};

// Helper function to get color scheme based on platform
// const getPlatformColorScheme = (platform) => {
//     const lowerPlatform = platform?.toLowerCase();
//     switch (lowerPlatform) {
//         case 'instagram':
//             return 'pink';
//         case 'facebook':
//             return 'facebook';
//         case 'twitter':
//             return 'twitter';
//         case 'linkedin':
//             return 'linkedin';
//         case 'pinterest':
//             return 'red';
//         case 'youtube':
//             return 'red';
//         case 'tiktok':
//             return 'blackAlpha';
//         case 'snapchat':
//             return 'yellow';
//         case 'twitch':
//             return 'purple';
//         case 'reddit':
//             return 'orange';
//         case 'discord':
//             return 'purple';
//         default:
//             return 'gray';
//     }
// };

export default Profile;
