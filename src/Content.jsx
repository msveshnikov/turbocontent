import {
    VStack,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    Alert,
    AlertIcon,
    Spinner,
    Text,
    Textarea,
    Flex,
    Spacer,
    IconButton,
    Tooltip,
    useToast,
    HStack,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    Box,
    Icon,
    Grid,
    GridItem,
    Container
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { API_URL } from './App';
import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { CopyIcon, CheckIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
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
} from 'react-icons/fa'; // Import social media icons

// Map platform values to icons
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

export const markdownToJSX = (mdContent) => {
    if (!mdContent) return '';
    try {
        const result = unified()
            .use(markdown)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(rehypeSanitize)
            .use(rehypeStringify)
            .processSync(mdContent);
        return result.value;
    } catch (error) {
        console.error('Error processing markdown:', error);
        // Fallback to plain text rendering if markdown processing fails
        return mdContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

function Content() {
    const [topic, setTopic] = useState('');
    const [goal, setGoal] = useState('');
    const [platform, setPlatform] = useState('');
    const [tone, setTone] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const toast = useToast();
    const [customInstructions, setCustomInstructions] = useState('');
    const [wordCount, setWordCount] = useState(500);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState('');

    const contentPreviewRef = useRef(null); // Ref for the preview container div

    useEffect(() => {
        // Reset error when inputs change
        setError('');
    }, [topic, goal, platform, tone, wordCount, customInstructions, keywords]);

    const handleGenerateContent = async () => {
        if (!topic || !goal || !platform || !tone) {
            setError('Please fill in all required fields.');
            return;
        }
        if (wordCount < 50 || wordCount > 5000) {
            setError('Word count must be between 50 and 5000.');
            return;
        }

        setLoading(true);
        setError('');
        // Keep existing content until new content is generated
        setIsCopied(false);
        setIsEditing(false); // Ensure editing mode is off when generating new content

        const contentOptions = {
            wordCount: parseInt(wordCount, 10) || 500,
            customInstructions: customInstructions,
            keywords: keywords.map((keyword) => keyword.text)
        };

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to generate content.');
                toast({
                    title: 'Authentication Error',
                    description: 'Please log in again.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
                setLoading(false);
                return; // Optional: Redirect to login page
            }

            const response = await fetch(`${API_URL}/api/generate-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ topic, goal, platform, tone, contentOptions })
            });

            if (!response.ok) {
                let message = `An error occurred: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    message = errorData.message || message;
                } catch {
                    // Ignore if response is not JSON
                }
                setError(message);
                throw new Error(message);
            }

            const data = await response.json();
            setGeneratedContent(data.content);
            setEditedContent(data.content); // Initialize edited content with new content
        } catch (err) {
            console.error('Error generating content:', err);
            // Error state is already set if it came from !response.ok
            if (!error && err instanceof Error) {
                setError(
                    `Failed to generate content: ${err.message}. Please check your connection and try again.`
                );
            } else if (!error) {
                setError('Failed to generate content. An unknown error occurred.');
            }
            toast({
                title: 'Generation Failed',
                description: error || 'An unexpected error occurred.',
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        // Use editedContent if editing, otherwise generatedContent
        const textToCopy = isEditing ? editedContent : generatedContent;
        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                setIsCopied(true);
                toast({
                    title: 'Content copied to clipboard!',
                    status: 'success',
                    duration: 2000,
                    isClosable: true
                });
                setTimeout(() => setIsCopied(false), 3000); // Reset icon after 3 seconds
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

    const handleEditToggle = () => {
        if (!isEditing) {
            // Ensure editor starts with the *current* generated content,
            // even if it was previously edited and saved.
            setEditedContent(generatedContent);
        }
        setIsEditing(!isEditing);
    };

    const handleContentChange = (e) => {
        setEditedContent(e.target.value);
    };

    const handleSaveEdit = () => {
        setGeneratedContent(editedContent); // Update the 'source' content
        setIsEditing(false);
        toast({
            title: 'Content updated!',
            status: 'success',
            duration: 2000,
            isClosable: true
        });
    };

    const handleAddKeyword = () => {
        const trimmedKeyword = newKeyword.trim();
        if (trimmedKeyword && keywords.length < 5) {
            // Prevent duplicate keywords
            if (
                !keywords.some(
                    (keyword) => keyword.text.toLowerCase() === trimmedKeyword.toLowerCase()
                )
            ) {
                setKeywords([...keywords, { id: Date.now(), text: trimmedKeyword }]);
                setNewKeyword('');
            } else {
                toast({
                    title: 'Duplicate Keyword',
                    description: 'This keyword has already been added.',
                    status: 'warning',
                    duration: 2000,
                    isClosable: true
                });
            }
        } else if (keywords.length >= 5) {
            toast({
                title: 'Maximum keywords reached',
                description: 'You can add up to 5 keywords.',
                status: 'warning',
                duration: 2000,
                isClosable: true
            });
        } else if (!trimmedKeyword) {
            toast({
                title: 'Invalid Keyword',
                description: 'Keyword cannot be empty.',
                status: 'warning',
                duration: 2000,
                isClosable: true
            });
        }
    };

    const handleRemoveKeyword = (idToRemove) => {
        setKeywords(keywords.filter((keyword) => keyword.id !== idToRemove));
    };

    const handlePublish = () => {
        // Placeholder for future publish functionality
        toast({
            title: 'Publish Feature Coming Soon!',
            description: `Direct publishing to ${platform} is under development. For now, please copy the content.`,
            status: 'info',
            duration: 5000,
            isClosable: true
        });
        // In a real implementation, this would trigger platform-specific authentication and API calls.
        // Example: openPublishModal(platform, generatedContent);
    };

    const SelectedPlatformIcon = platformIcons[platform];

    return (
        <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
            <Heading size="lg" mb={8} textAlign="center">
                Social Media Content Generator
            </Heading>

            {error && (
                <Alert status="error" mb={6} borderRadius="md" variant="subtle">
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            <Grid
                templateColumns={{ base: '1fr', lg: '45% 1fr' }} // Adjusted column ratio for desktop
                gap={{ base: 6, lg: 10 }} // Increased gap for desktop
                alignItems="start" // Align items to the top
            >
                {/* Column 1: Form Inputs */}
                <GridItem
                    colSpan={1}
                    p={{ base: 4, md: 6 }}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor="gray.200"
                    boxShadow="sm"
                    bg="white"
                >
                    <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                        <Heading size="md" mb={2}>
                            Define Content
                        </Heading>
                        {/* Form Controls using Tooltips for guidance */}
                        <FormControl id="topic" isRequired isInvalid={error && !topic}>
                            <Tooltip label="Enter the main topic, theme, or a specific URL for context. E.g., 'Benefits of remote work' or 'https://example.com/article'.">
                                <FormLabel>Topic or URL</FormLabel>
                            </Tooltip>
                            <Input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Sustainable Fashion Trends"
                                focusBorderColor="primary.500"
                            />
                        </FormControl>

                        <FormControl id="goal" isRequired isInvalid={error && !goal}>
                            <Tooltip label="What is the main objective of this content? This helps tailor the call-to-action and focus.">
                                <FormLabel>Primary Goal</FormLabel>
                            </Tooltip>
                            <Select
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="Select a goal"
                                focusBorderColor="primary.500"
                            >
                                <option value="engagement">
                                    Increase Engagement (Likes, Comments)
                                </option>
                                <option value="promotion">Promote Product/Service</option>
                                <option value="awareness">Build Brand Awareness</option>
                                <option value="inspiration">Inspire or Motivate</option>
                                <option value="lead_generation">
                                    Generate Leads (Sign-ups, Downloads)
                                </option>
                                <option value="sales">Drive Sales</option>
                                <option value="website_traffic">Increase Website Traffic</option>
                                <option value="community_growth">Grow Community/Followers</option>
                                <option value="customer_service">
                                    Provide Support/Answer FAQs
                                </option>
                                <option value="education">Educate Audience</option>
                                <option value="entertainment">Entertain Audience</option>
                            </Select>
                        </FormControl>

                        <FormControl id="platform" isRequired isInvalid={error && !platform}>
                            <Tooltip label="Select the target social media platform. Content style and length will be adjusted accordingly.">
                                <FormLabel>Platform</FormLabel>
                            </Tooltip>
                            <Select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                placeholder="Select platform"
                                focusBorderColor="primary.500"
                            >
                                {/* Sorted Alphabetically */}
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="medium">Medium</option>
                                <option value="pinterest">Pinterest</option>
                                <option value="reddit">Reddit</option>
                                <option value="snapchat">Snapchat</option>
                                <option value="tiktok">TikTok</option>
                                <option value="twitter">Twitter</option>
                                <option value="youtube">YouTube</option>
                            </Select>
                        </FormControl>

                        <FormControl id="tone" isRequired isInvalid={error && !tone}>
                            <Tooltip label="Choose the desired tone of voice. This sets the overall feeling of the content.">
                                <FormLabel>Tone</FormLabel>
                            </Tooltip>
                            <Select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                placeholder="Select tone"
                                focusBorderColor="primary.500"
                            >
                                <option value="casual">Casual</option>
                                <option value="conversational">Conversational</option>
                                <option value="enthusiastic">Enthusiastic</option>
                                <option value="humorous">Humorous</option>
                                <option value="informative">Informative</option>
                                <option value="inspiring">Inspiring</option>
                                <option value="persuasive">Persuasive</option>
                                <option value="professional">Professional</option>
                                <option value="serious">Serious</option>
                                <option value="witty">Witty</option>
                            </Select>
                        </FormControl>

                        {/* Optional Fields */}
                        <FormControl id="wordCount">
                            <Tooltip label="Suggest an approximate word count (50-5000). This is a guideline, actual length may vary based on content and platform.">
                                <FormLabel>Word Count (Approx. 50-5000)</FormLabel>
                            </Tooltip>
                            <Input
                                type="number"
                                value={wordCount}
                                onChange={(e) => setWordCount(Number(e.target.value))}
                                placeholder="e.g., 150"
                                min={50}
                                max={5000}
                                step={50} // Add step for easier adjustment
                                focusBorderColor="primary.500"
                            />
                        </FormControl>

                        <FormControl id="keywords">
                            <Tooltip label="Add up to 5 relevant keywords to guide the AI. Press Enter or click Add after typing each keyword.">
                                <FormLabel>Keywords (Optional, up to 5)</FormLabel>
                            </Tooltip>
                            <Flex direction="column">
                                <HStack mb={2}>
                                    <Input
                                        type="text"
                                        placeholder="Enter keyword"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Prevent form submission on Enter
                                                handleAddKeyword();
                                            }
                                        }}
                                        isDisabled={keywords.length >= 5}
                                        focusBorderColor="primary.500"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleAddKeyword}
                                        isDisabled={keywords.length >= 5 || !newKeyword.trim()}
                                        colorScheme="primary"
                                        variant="outline"
                                    >
                                        Add
                                    </Button>
                                </HStack>
                                <Wrap spacing={2}>
                                    {keywords.map((keyword) => (
                                        <WrapItem key={keyword.id}>
                                            <Tag
                                                borderRadius="full"
                                                variant="solid"
                                                colorScheme="primary" // Use primary theme color for tags
                                                size="md"
                                            >
                                                <TagLabel>{keyword.text}</TagLabel>
                                                <TagCloseButton
                                                    onClick={() => handleRemoveKeyword(keyword.id)}
                                                />
                                            </Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </Flex>
                        </FormControl>

                        <FormControl id="customInstructions">
                            <Tooltip label="Provide any extra instructions, like 'Include a question at the end', 'Mention our upcoming event', 'Avoid jargon'.">
                                <FormLabel>Custom Instructions (Optional)</FormLabel>
                            </Tooltip>
                            <Textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="e.g., Focus on benefits for small businesses"
                                rows={3}
                                focusBorderColor="primary.500"
                            />
                        </FormControl>

                        <Button
                            colorScheme="primary"
                            onClick={handleGenerateContent}
                            isLoading={loading}
                            loadingText="Generating..."
                            width="100%"
                            size="lg"
                            mt={4} // Add margin top for spacing
                            isDisabled={loading}
                            boxShadow="md" // Add subtle shadow
                        >
                            Generate Content
                        </Button>
                    </VStack>
                </GridItem>

                {/* Column 2: Preview/Edit Area */}
                <GridItem colSpan={1} position="sticky" top={{ lg: 8 }}>
                    {' '}
                    {/* Make preview sticky on desktop */}
                    <Box
                        p={{ base: 4, md: 6 }}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor="gray.200"
                        boxShadow="sm"
                        bg="white"
                        minH={{ base: 'auto', lg: '500px' }} // Ensure min height on desktop
                        display="flex"
                        flexDirection="column"
                    >
                        {loading && (
                            <Flex justify="center" align="center" flexGrow={1} minH="200px">
                                <Spinner size="xl" color="primary.500" thickness="4px" />
                                <Text ml={4} fontSize="lg" color="gray.600">
                                    Generating your content...
                                </Text>
                            </Flex>
                        )}

                        {!loading && !generatedContent && (
                            <Flex
                                justify="center"
                                align="center"
                                flexGrow={1}
                                minH="200px"
                                textAlign="center"
                                direction="column"
                                p={6}
                            >
                                <Icon as={ExternalLinkIcon} w={10} h={10} color="gray.400" mb={4} />
                                <Heading size="md" color="gray.600" mb={2}>
                                    Content Preview
                                </Heading>
                                <Text color="gray.500">
                                    Fill in the details on the left and click &apos;Generate
                                    Content&apos; to see your results here.
                                </Text>
                            </Flex>
                        )}

                        {!loading && generatedContent && (
                            <>
                                <Flex mb={4} align="center" wrap="wrap" gap={2}>
                                    <HStack>
                                        {SelectedPlatformIcon && (
                                            <Icon
                                                as={SelectedPlatformIcon}
                                                w={5}
                                                h={5}
                                                mr={1}
                                                color="gray.600"
                                            />
                                        )}
                                        <Heading size="md">
                                            {isEditing ? 'Edit Content' : 'Generated Content'}
                                        </Heading>
                                    </HStack>
                                    <Spacer />
                                    <HStack spacing={2}>
                                        {/* Edit / Save Button */}
                                        <Tooltip
                                            label={isEditing ? 'Save Changes' : 'Edit Content'}
                                        >
                                            <IconButton
                                                icon={isEditing ? <CheckIcon /> : <EditIcon />}
                                                aria-label={
                                                    isEditing ? 'Save Edits' : 'Edit Content'
                                                }
                                                size="sm"
                                                colorScheme={isEditing ? 'green' : 'gray'}
                                                onClick={
                                                    isEditing ? handleSaveEdit : handleEditToggle
                                                }
                                            />
                                        </Tooltip>
                                        {/* Copy Button */}
                                        <Tooltip label="Copy to clipboard">
                                            <IconButton
                                                icon={isCopied ? <CheckIcon /> : <CopyIcon />}
                                                aria-label="Copy to clipboard"
                                                size="sm"
                                                colorScheme={isCopied ? 'green' : 'blue'}
                                                onClick={handleCopyToClipboard}
                                                isDisabled={isEditing} // Disable copy while editing
                                            />
                                        </Tooltip>
                                        {/* Publish Button (Placeholder) */}
                                        <Tooltip
                                            label={`Publish to ${platform || 'Social Media'} (Coming Soon)`}
                                        >
                                            <IconButton
                                                icon={<ExternalLinkIcon />} // Using ExternalLinkIcon as placeholder
                                                aria-label="Publish Content"
                                                size="sm"
                                                colorScheme="purple" // Differentiate publish button
                                                onClick={handlePublish}
                                                isDisabled={isEditing || !platform} // Disable publish while editing or if no platform
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Flex>

                                {isEditing ? (
                                    <FormControl flexGrow={1}>
                                        {' '}
                                        {/* Make textarea fill available space */}
                                        <Textarea
                                            value={editedContent}
                                            onChange={handleContentChange}
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor="gray.300"
                                            focusBorderColor="primary.500"
                                            size="sm" // Smaller font size in textarea
                                            h="100%" // Fill height
                                            minH="350px" // Ensure min height for editing
                                            resize="vertical"
                                        />
                                    </FormControl>
                                ) : (
                                    // Use a Box with ref for potential future enhancements (like scrolling)
                                    <Box
                                        ref={contentPreviewRef}
                                        p={4}
                                        borderWidth="1px"
                                        borderRadius="md"
                                        borderColor="gray.200"
                                        bg="gray.50" // Slight background color for preview
                                        overflowY="auto" // Allow scrolling if content is long
                                        whiteSpace="pre-wrap" // Preserve line breaks and wrap text
                                        flexGrow={1} // Make preview box fill available space
                                        minH="350px" // Ensure min height for preview
                                        maxH="70vh" // Limit max height to prevent excessive scrolling
                                        sx={{
                                            // Custom scrollbar styling (optional)
                                            '&::-webkit-scrollbar': {
                                                width: '8px'
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'gray.100',
                                                borderRadius: '8px'
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: 'gray.400',
                                                borderRadius: '8px'
                                            },
                                            '&::-webkit-scrollbar-thumb:hover': {
                                                background: 'gray.500'
                                            }
                                        }}
                                    >
                                        <Text
                                            fontSize="md"
                                            dangerouslySetInnerHTML={{
                                                __html: markdownToJSX(generatedContent)
                                            }}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </GridItem>
            </Grid>
        </Container>
    );
}

export default Content;
