import {
    Box,
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
    Card,
    CardBody,
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
    WrapItem
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { API_URL } from './App';
import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { CopyIcon, CheckIcon, EditIcon } from '@chakra-ui/icons';

export const markdownToJSX = (mdContent) => {
    const result = unified()
        .use(markdown)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .processSync(mdContent);
    return result.value;
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
    const [wordCount, setWordCount] = useState(50);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState('');

    const contentPreviewRef = useRef(null);

    const handleGenerateContent = async () => {
        if (!topic || !goal || !platform || !tone) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedContent('');
        setIsCopied(false);

        const contentOptions = {
            wordCount: parseInt(wordCount, 10) || 50,
            customInstructions: customInstructions,
            keywords: keywords.map((keyword) => keyword.text)
        };

        try {
            const response = await fetch(`${API_URL}/api/generate-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ topic, goal, platform, tone, contentOptions })
            });

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                setError(message);
                throw new Error(message);
            }

            const data = await response.json();
            setGeneratedContent(data.content);
            setEditedContent(data.content);
            setActiveTab(1);
        } catch (error) {
            console.error('Error generating content:', error);
            if (!error) {
                setError('Failed to generate content. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (contentPreviewRef.current) {
            const textToCopy = contentPreviewRef.current.textContent;
            try {
                await navigator.clipboard.writeText(textToCopy);
                setIsCopied(true);
                toast({
                    title: 'Content copied to clipboard!',
                    status: 'success',
                    duration: 2000,
                    isClosable: true
                });
            } catch (err) {
                console.error('Failed to copy text: ', err);
                toast({
                    title: 'Copy failed',
                    description: 'Could not copy content to clipboard.',
                    status: 'error',
                    duration: 2000,
                    isClosable: true
                });
            } finally {
                setTimeout(() => setIsCopied(false), 3000);
            }
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleContentChange = (e) => {
        setEditedContent(e.target.value);
    };

    const handleSaveEdit = () => {
        setGeneratedContent(editedContent);
        setIsEditing(false);
        toast({
            title: 'Content updated!',
            status: 'success',
            duration: 2000,
            isClosable: true
        });
    };

    const handleAddKeyword = () => {
        if (newKeyword.trim() && keywords.length < 5) {
            setKeywords([...keywords, { id: Date.now(), text: newKeyword.trim() }]);
            setNewKeyword('');
        } else if (keywords.length >= 5) {
            toast({
                title: 'Maximum keywords reached',
                description: 'You can add up to 5 keywords.',
                status: 'warning',
                duration: 2000,
                isClosable: true
            });
        }
    };

    const handleRemoveKeyword = (idToRemove) => {
        setKeywords(keywords.filter((keyword) => keyword.id !== idToRemove));
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
            <Heading size="lg" mb={4} textAlign="center">
                Social Media Content Generator
            </Heading>

            <Tabs
                isFitted
                variant="enclosed"
                index={activeTab}
                onChange={(index) => setActiveTab(index)}
            >
                <TabList mb={4}>
                    <Tab _focus={{ outline: 'none' }}>1. Content Details</Tab>
                    <Tab isDisabled={!generatedContent} _focus={{ outline: 'none' }}>
                        2. Preview & Edit
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel pt={4} p={0}>
                        {error && (
                            <Alert status="error" mb={4} borderRadius="md">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}
                        <VStack spacing={5} align="stretch">
                            <FormControl id="topic" isRequired>
                                <Tooltip label="Enter the main topic you want to create content about. Be specific for better results.">
                                    <FormLabel>Topic</FormLabel>
                                </Tooltip>
                                <Input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Enter topic (e.g., Sustainable Fashion)"
                                />
                            </FormControl>
                            <FormControl id="goal" isRequired>
                                <Tooltip label="Define the primary goal of your social media content. Choose a goal that aligns with your objectives.">
                                    <FormLabel>Goal</FormLabel>
                                </Tooltip>
                                <Select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="Select a goal"
                                >
                                    <option value="engagement">Increase Engagement</option>
                                    <option value="promotion">Product/Service Promotion</option>
                                    <option value="awareness">Brand Awareness</option>
                                    <option value="inspiration">Inspire Audience</option>
                                    <option value="lead_generation">Generate Leads</option>
                                    <option value="sales">Drive Sales</option>
                                    <option value="website_traffic">
                                        Increase Website Traffic
                                    </option>
                                    <option value="community_growth">Grow Community</option>
                                    <option value="customer_service">
                                        Improve Customer Service
                                    </option>
                                    <option value="education">Educate Audience</option>
                                    <option value="entertainment">Entertain Audience</option>
                                </Select>
                            </FormControl>
                            <FormControl id="platform" isRequired>
                                <Tooltip label="Select the target social media platform for your content. This helps tailor the content to platform specifics.">
                                    <FormLabel>Platform</FormLabel>
                                </Tooltip>
                                <Select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    placeholder="Select platform"
                                >
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="pinterest">Pinterest</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="snapchat">Snapchat</option>
                                    <option value="medium">Medium</option>
                                    <option value="reddit">Reddit</option>
                                </Select>
                            </FormControl>
                            <FormControl id="tone" isRequired>
                                <Tooltip label="Choose the tone of voice for your content. The tone sets the emotional and stylistic direction of the generated text.">
                                    <FormLabel>Tone</FormLabel>
                                </Tooltip>
                                <Select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    placeholder="Select tone"
                                >
                                    <option value="witty">Witty</option>
                                    <option value="informative">Informative</option>
                                    <option value="inspiring">Inspiring</option>
                                    <option value="humorous">Humorous</option>
                                    <option value="serious">Serious</option>
                                    <option value="casual">Casual</option>
                                    <option value="professional">Professional</option>
                                    <option value="enthusiastic">Enthusiastic</option>
                                    <option value="persuasive">Persuasive</option>
                                    <option value="conversational">Conversational</option>
                                </Select>
                            </FormControl>

                            <FormControl id="wordCount">
                                <Tooltip label="Specify the approximate word count for the generated content. This helps control the length and detail of the output.">
                                    <FormLabel>Word Count (Approximate)</FormLabel>
                                </Tooltip>
                                <Input
                                    type="number"
                                    value={wordCount}
                                    onChange={(e) => setWordCount(e.target.value)}
                                    placeholder="Enter desired word count"
                                    min="10"
                                    max="500"
                                />
                            </FormControl>

                            <FormControl id="keywords">
                                <Tooltip label="Add up to 5 keywords to guide content generation. Keywords help focus the content on specific themes.">
                                    <FormLabel>Keywords (Up to 5)</FormLabel>
                                </Tooltip>
                                <Flex direction="column">
                                    <HStack mb={2}>
                                        <Input
                                            type="text"
                                            placeholder="Enter keyword and press Add"
                                            value={newKeyword}
                                            onChange={(e) => setNewKeyword(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddKeyword();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddKeyword}
                                            isDisabled={keywords.length >= 5}
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
                                                    colorScheme="gray"
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
                                <Tooltip label="Provide any specific instructions or details you want the content generator to consider.">
                                    <FormLabel>Custom Instructions (Optional)</FormLabel>
                                </Tooltip>
                                <Textarea
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    placeholder="Add any specific instructions for content generation"
                                    rows={3}
                                />
                            </FormControl>

                            <Button
                                colorScheme="primary"
                                onClick={handleGenerateContent}
                                isLoading={loading}
                                loadingText="Generating Content"
                                width="100%"
                            >
                                Generate Content
                                {loading && <Spinner ml={2} size="sm" />}
                            </Button>
                        </VStack>
                    </TabPanel>
                    <TabPanel pt={4} p={0}>
                        {generatedContent && (
                            <Card>
                                <CardBody>
                                    <Flex mb={4} align="center">
                                        <Heading size="md">
                                            {isEditing
                                                ? 'Edit Generated Content'
                                                : 'Generated Content Preview'}
                                        </Heading>
                                        <Spacer />
                                        <HStack>
                                            {!isEditing && (
                                                <Tooltip label="Edit Content">
                                                    <IconButton
                                                        icon={<EditIcon />}
                                                        aria-label="Edit Content"
                                                        size="sm"
                                                        onClick={handleEditToggle}
                                                        mr={2}
                                                    />
                                                </Tooltip>
                                            )}
                                            {isEditing && (
                                                <Tooltip label="Save Edits">
                                                    <IconButton
                                                        icon={<CheckIcon />}
                                                        aria-label="Save Edits"
                                                        size="sm"
                                                        colorScheme="green"
                                                        onClick={handleSaveEdit}
                                                        mr={2}
                                                    />
                                                </Tooltip>
                                            )}
                                            <Tooltip label="Copy to clipboard">
                                                <IconButton
                                                    icon={isCopied ? <CheckIcon /> : <CopyIcon />}
                                                    aria-label="Copy to clipboard"
                                                    size="sm"
                                                    colorScheme={isCopied ? 'green' : 'blue'}
                                                    onClick={handleCopyToClipboard}
                                                />
                                            </Tooltip>
                                        </HStack>
                                    </Flex>

                                    {isEditing ? (
                                        <FormControl>
                                            <Textarea
                                                value={editedContent}
                                                onChange={handleContentChange}
                                                rows={10}
                                                borderRadius="md"
                                                borderWidth="1px"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'primary.500' }}
                                            />
                                        </FormControl>
                                    ) : (
                                        <Box
                                            bg="white"
                                            p={4}
                                            shadow="inner"
                                            borderWidth="1px"
                                            borderRadius="md"
                                            ref={contentPreviewRef}
                                            minHeight="200px"
                                        >
                                            <Text
                                                fontSize="md"
                                                whiteSpace="pre-line"
                                                dangerouslySetInnerHTML={{
                                                    __html: markdownToJSX(generatedContent)
                                                }}
                                            />
                                        </Box>
                                    )}
                                </CardBody>
                            </Card>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default Content;
