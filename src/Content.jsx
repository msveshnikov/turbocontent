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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    Box,
    Icon,
    Grid,
    GridItem
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
    const [activeTab, setActiveTab] = useState(0);
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
    }, [topic, goal, platform, tone]);

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
        setGeneratedContent('');
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
            setEditedContent(data.content); // Initialize edited content
            setActiveTab(1); // Switch to preview tab
        } catch (error) {
            console.error('Error generating content:', error);
            // Error state is already set if it came from !response.ok
            if (!error) {
                setError('Failed to generate content. Please check your connection and try again.');
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
            setEditedContent(generatedContent); // Ensure editor starts with current content
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
        <>
            <Heading size="lg" mb={6} textAlign="center">
                Social Media Content Generator
            </Heading>

            <Tabs
                isFitted
                variant="enclosed-colored"
                index={activeTab}
                onChange={(index) => setActiveTab(index)}
                colorScheme="primary" // Use theme color
            >
                <TabList mb={4}>
                    <Tab _focus={{ boxShadow: 'none' }}>1. Define Content</Tab>
                    <Tab isDisabled={!generatedContent} _focus={{ boxShadow: 'none' }}>
                        2. Preview & Refine
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel pt={4} p={{ base: 2, md: 8 }}>
                        {error && (
                            <Alert status="error" mb={4} borderRadius="md" variant="subtle">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                            <GridItem colSpan={{ md: 1 }}>
                                <VStack spacing={5} align="stretch">
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
                                            <option value="promotion">
                                                Promote Product/Service
                                            </option>
                                            <option value="awareness">Build Brand Awareness</option>
                                            <option value="inspiration">Inspire or Motivate</option>
                                            <option value="lead_generation">
                                                Generate Leads (Sign-ups, Downloads)
                                            </option>
                                            <option value="sales">Drive Sales</option>
                                            <option value="website_traffic">
                                                Increase Website Traffic
                                            </option>
                                            <option value="community_growth">
                                                Grow Community/Followers
                                            </option>
                                            <option value="customer_service">
                                                Provide Support/Answer FAQs
                                            </option>
                                            <option value="education">Educate Audience</option>
                                            <option value="entertainment">
                                                Entertain Audience
                                            </option>
                                        </Select>
                                    </FormControl>

                                    <FormControl
                                        id="platform"
                                        isRequired
                                        isInvalid={error && !platform}
                                    >
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
                                                    isDisabled={
                                                        keywords.length >= 5 || !newKeyword.trim()
                                                    }
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
                                                            colorScheme="gray" // Consider using primary theme color
                                                        >
                                                            <TagLabel>{keyword.text}</TagLabel>
                                                            <TagCloseButton
                                                                onClick={() =>
                                                                    handleRemoveKeyword(keyword.id)
                                                                }
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
                                    >
                                        Generate Content
                                    </Button>
                                </VStack>
                            </GridItem>
                            <GridItem colSpan={{ md: 1 }}>
                                {generatedContent && (
                                    <Box>
                                        <Flex mb={4} align="center" wrap="wrap" gap={2}>
                                            <HStack>
                                                {SelectedPlatformIcon && (
                                                    <Icon
                                                        as={SelectedPlatformIcon}
                                                        w={5}
                                                        h={5}
                                                        mr={1}
                                                    />
                                                )}
                                                <Heading size="md">
                                                    {isEditing
                                                        ? 'Edit Content'
                                                        : 'Generated Content'}
                                                </Heading>
                                            </HStack>
                                            <Spacer />
                                            <HStack spacing={2}>
                                                {/* Edit / Save Button */}
                                                <Tooltip
                                                    label={
                                                        isEditing ? 'Save Changes' : 'Edit Content'
                                                    }
                                                >
                                                    <IconButton
                                                        icon={
                                                            isEditing ? <CheckIcon /> : <EditIcon />
                                                        }
                                                        aria-label={
                                                            isEditing
                                                                ? 'Save Edits'
                                                                : 'Edit Content'
                                                        }
                                                        size="sm"
                                                        colorScheme={isEditing ? 'green' : 'gray'}
                                                        onClick={
                                                            isEditing
                                                                ? handleSaveEdit
                                                                : handleEditToggle
                                                        }
                                                    />
                                                </Tooltip>
                                                {/* Copy Button */}
                                                <Tooltip label="Copy to clipboard">
                                                    <IconButton
                                                        icon={
                                                            isCopied ? <CheckIcon /> : <CopyIcon />
                                                        }
                                                        aria-label="Copy to clipboard"
                                                        size="sm"
                                                        colorScheme={isCopied ? 'green' : 'blue'}
                                                        onClick={handleCopyToClipboard}
                                                        isDisabled={isEditing} // Disable copy while editing
                                                    />
                                                </Tooltip>
                                                {/* Publish Button (Placeholder) */}
                                                <Tooltip
                                                    label={`Publish to ${
                                                        platform || 'Social Media'
                                                    } (Coming Soon)`}
                                                >
                                                    <IconButton
                                                        icon={<ExternalLinkIcon />} // Using ExternalLinkIcon as placeholder
                                                        aria-label="Publish Content"
                                                        size="sm"
                                                        colorScheme="purple" // Differentiate publish button
                                                        onClick={handlePublish}
                                                        isDisabled={isEditing} // Disable publish while editing
                                                    />
                                                </Tooltip>
                                            </HStack>
                                        </Flex>

                                        {isEditing ? (
                                            <FormControl>
                                                <Textarea
                                                    value={editedContent}
                                                    onChange={handleContentChange}
                                                    rows={15} // Increased rows for better editing
                                                    borderRadius="md"
                                                    borderWidth="1px"
                                                    borderColor="gray.300"
                                                    focusBorderColor="primary.500"
                                                    size="sm" // Smaller font size in textarea
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
                                                minH="200px" // Ensure minimum height for preview
                                                bg="gray.50" // Slight background color
                                                overflowY="auto" // Allow scrolling if content is long
                                                whiteSpace="pre-line" // Preserve line breaks from markdown/text
                                            >
                                                <Text
                                                    fontSize="md"
                                                    dangerouslySetInnerHTML={{
                                                        __html: markdownToJSX(generatedContent)
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                )}
                                {!generatedContent && !loading && (
                                    <Alert status="info" variant="subtle" borderRadius="md">
                                        <AlertIcon />
                                        Fill in the details on the &apos;Define Content&apos; tab
                                        and click &apos;Generate Content&apos; to see the results
                                        here.
                                    </Alert>
                                )}
                                {loading && (
                                    <Flex
                                        justify="center"
                                        align="center"
                                        minH="200px"
                                        bg="whiteAlpha.500"
                                    >
                                        {' '}
                                        {/* Added background to ensure visibility */}
                                        <Spinner size="xl" color="gray.500" thickness="4px" />{' '}
                                        {/* Changed spinner color to gray */}
                                        <Text ml={4}>Generating your content...</Text>
                                    </Flex>
                                )}
                            </GridItem>
                        </Grid>
                    </TabPanel>
                    <TabPanel pt={4} p={{ base: 2, md: 8 }}>
                        {generatedContent && (
                            <Box>
                                <Flex mb={4} align="center" wrap="wrap" gap={2}>
                                    <HStack>
                                        {SelectedPlatformIcon && (
                                            <Icon as={SelectedPlatformIcon} w={5} h={5} mr={1} />
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
                                                isDisabled={isEditing} // Disable publish while editing
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Flex>

                                {isEditing ? (
                                    <FormControl>
                                        <Textarea
                                            value={editedContent}
                                            onChange={handleContentChange}
                                            rows={15} // Increased rows for better editing
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor="gray.300"
                                            focusBorderColor="primary.500"
                                            size="sm" // Smaller font size in textarea
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
                                        minH="200px" // Ensure minimum height for preview
                                        bg="gray.50" // Slight background color
                                        overflowY="auto" // Allow scrolling if content is long
                                        whiteSpace="pre-line" // Preserve line breaks from markdown/text
                                    >
                                        <Text
                                            fontSize="md"
                                            dangerouslySetInnerHTML={{
                                                __html: markdownToJSX(generatedContent)
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                        {!generatedContent && !loading && (
                            <Alert status="info" variant="subtle" borderRadius="md">
                                <AlertIcon />
                                Fill in the details on the &apos;Define Content&apos; tab and click
                                &apos;Generate Content&apos; to see the results here.
                            </Alert>
                        )}
                        {loading && (
                            <Flex justify="center" align="center" minH="200px" bg="whiteAlpha.500">
                                {' '}
                                {/* Added background to ensure visibility */}
                                <Spinner size="xl" color="gray.500" thickness="4px" />{' '}
                                {/* Changed spinner color to gray */}
                                <Text ml={4}>Generating your content...</Text>
                            </Flex>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}

export default Content;
