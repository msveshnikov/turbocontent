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
    Text
} from '@chakra-ui/react';
import { useState } from 'react';
import { API_URL } from './App';
import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

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

    const handleGenerateContent = async () => {
        setLoading(true);
        setError('');
        setGeneratedContent('');

        try {
            const response = await fetch(`${API_URL}/api/generate-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ topic, goal, platform, tone })
            });

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                setError(message);
                throw new Error(message);
            }

            const data = await response.json();
            setGeneratedContent(data.content);
        } catch (error) {
            console.error('Error generating content:', error);
            if (!error) {
                setError('Failed to generate content. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
            <Heading size="md" mb={4}>
                Generate Social Media Content
            </Heading>
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            <VStack spacing={4} align="stretch">
                <FormControl id="topic" isRequired>
                    <FormLabel>Topic</FormLabel>
                    <Input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Sustainable Living"
                    />
                </FormControl>
                <FormControl id="goal" isRequired>
                    <FormLabel>Goal</FormLabel>
                    <Select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Select goal"
                    >
                        <option value="engagement">Engagement</option>
                        <option value="promotion">Promotion</option>
                        <option value="awareness">Awareness</option>
                        <option value="inspiration">Inspiration</option>
                        <option value="lead_generation">Lead Generation</option>
                        <option value="sales">Sales</option>
                        <option value="website_traffic">Website Traffic</option>
                        <option value="community_growth">Community Growth</option>
                        <option value="customer_service">Customer Service</option>
                        <option value="education">Education</option>
                        <option value="entertainment">Entertainment</option>
                    </Select>
                </FormControl>
                <FormControl id="platform" isRequired>
                    <FormLabel>Platform</FormLabel>
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
                    <FormLabel>Tone</FormLabel>
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
                <Button
                    colorScheme="primary"
                    onClick={handleGenerateContent}
                    isLoading={loading}
                    loadingText="Generating Content"
                >
                    Generate Content
                    {loading && <Spinner ml={2} size="sm" />}
                </Button>
            </VStack>

            {generatedContent && (
                <Box mt={8}>
                    <Heading size="md" mb={4}>
                        Generated Content
                    </Heading>
                    <Box bg="white" p={4} shadow="md" borderWidth="1px" borderRadius="md">
                        <Text
                            fontSize="md"
                            whiteSpace="pre-line"
                            dangerouslySetInnerHTML={{ __html: markdownToJSX(generatedContent) }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default Content;
