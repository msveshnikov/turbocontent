import {
    Box,
    Heading,
    Text,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    IconButton,
    Tooltip,
    Flex,
    Spacer,
    Icon
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from './App';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { markdownToJSX } from './Content';
import { useToast } from '@chakra-ui/react';
import {
    FaInstagram,
    FaFacebook,
    FaTwitter,
    FaLinkedin,
    FaPinterest,
    FaTiktok,
    FaYoutube,
    FaSnapchatGhost,
    FaMediumM,
    FaRedditAlien
} from 'react-icons/fa';

const platformIcons = {
    instagram: FaInstagram,
    facebook: FaFacebook,
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    pinterest: FaPinterest,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    snapchat: FaSnapchatGhost,
    medium: FaMediumM,
    reddit: FaRedditAlien
};

function ContentId() {
    const { id } = useParams();
    const [contentData, setContentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/content/${id}`);
                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(`Failed to fetch content: ${response.status} - ${message}`);
                }
                const data = await response.json();
                setContentData(data);
            } catch (error) {
                console.error('Error fetching content:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    const handleCopyToClipboard = async () => {
        if (contentData?.content) {
            try {
                await navigator.clipboard.writeText(contentData.content);
                setIsCopied(true);
                toast({
                    title: 'Content copied to clipboard!',
                    status: 'success',
                    duration: 2000,
                    isClosable: true
                });
                setTimeout(() => setIsCopied(false), 3000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                toast({
                    title: 'Copy failed',
                    description: 'Could not copy content to clipboard.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            }
        }
    };

    if (loading) {
        return (
            <Center height="80vh">
                <Spinner size="xl" color="primary.500" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center height="80vh">
                <Alert status="error" variant="subtle">
                    <AlertIcon />
                    {error}
                </Alert>
            </Center>
        );
    }

    if (!contentData) {
        return (
            <Center height="80vh">
                <Alert status="warning" variant="subtle">
                    <AlertIcon />
                    Content not found.
                </Alert>
            </Center>
        );
    }

    const PlatformIcon = platformIcons[contentData.platform];

    return (
        <Box p={5} maxW="container.md" mx="auto">
            <Flex mb={4} align="center" wrap="wrap" gap={2}>
                <Flex align="center">
                    {PlatformIcon && <Icon as={PlatformIcon} boxSize={6} mr={2} />}
                    <Heading size="lg">{contentData.topic}</Heading>
                </Flex>
                <Spacer />
                <Tooltip label="Copy to clipboard">
                    <IconButton
                        icon={isCopied ? <CheckIcon /> : <CopyIcon />}
                        aria-label="Copy to clipboard"
                        size="sm"
                        colorScheme={isCopied ? 'green' : 'blue'}
                        onClick={handleCopyToClipboard}
                    />
                </Tooltip>
            </Flex>

            <Box
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor="gray.200"
                minH="200px"
                bg="gray.50"
                overflowY="auto"
                whiteSpace="pre-line"
            >
                <Text
                    fontSize="md"
                    dangerouslySetInnerHTML={{
                        __html: markdownToJSX(contentData.content)
                    }}
                />
            </Box>
            <Box mt={4}>
                <Text fontSize="sm" color="gray.600">
                    <strong>Goal:</strong> {contentData.goal}
                </Text>
                <Text fontSize="sm" color="gray.600">
                    <strong>Tone:</strong> {contentData.tone}
                </Text>
                <Text fontSize="sm" color="gray.600">
                    <strong>Platform:</strong> {contentData.platform}
                </Text>
            </Box>
        </Box>
    );
}

export default ContentId;
