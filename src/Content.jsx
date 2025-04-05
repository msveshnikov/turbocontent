import {
    Box,
    VStack,
    Heading,
    Text,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    Grid,
    GridItem,
    Image,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { useState } from 'react';

function Content() {
    const [topic, setTopic] = useState('');
    const [goal, setGoal] = useState('');
    const [platform, setPlatform] = useState('');
    const [tone, setTone] = useState('');
    const [generatedContent, setGeneratedContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateContent = async () => {
        setLoading(true);
        setError('');
        setGeneratedContent([]);

        // Placeholder for API call - replace with actual API endpoint and data
        setTimeout(() => {
            setLoading(false);
            if (topic && goal && platform && tone) {
                setGeneratedContent([
                    {
                        text: `Generated witty post about ${topic} for ${platform} with goal ${goal}.`,
                        image: 'https://via.placeholder.com/300',
                        hashtags: '#witty #socialmedia #example'
                    },
                    {
                        text: `Another informative option about ${topic} for ${platform} with goal ${goal}.`,
                        image: 'https://via.placeholder.com/300/0000FF/FFFFFF?Text=Informative',
                        hashtags: '#informative #content #sample'
                    }
                ]);
            } else {
                setError('Please fill in all fields.');
            }
        }, 1500);
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
                <FormControl id="topic">
                    <FormLabel>Topic</FormLabel>
                    <Input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Sustainable Living"
                    />
                </FormControl>
                <FormControl id="goal">
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
                    </Select>
                </FormControl>
                <FormControl id="platform">
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
                    </Select>
                </FormControl>
                <FormControl id="tone">
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
                    </Select>
                </FormControl>
                <Button colorScheme="primary" onClick={handleGenerateContent} isLoading={loading}>
                    Generate Content
                </Button>
            </VStack>

            {/* Generated Content Display */}
            {generatedContent.length > 0 && (
                <Box mt={8}>
                    <Heading size="md" mb={4}>
                        Generated Content Options
                    </Heading>
                    <Grid
                        templateColumns={{
                            sm: '1fr',
                            md: 'repeat(auto-fit, minmax(300px, 1fr))'
                        }}
                        gap={6}
                    >
                        {generatedContent.map((content, index) => (
                            <GridItem
                                key={index}
                                bg="white"
                                p={4}
                                shadow="md"
                                borderWidth="1px"
                                borderRadius="md"
                            >
                                <Image
                                    src={content.image}
                                    alt={`Generated Image ${index + 1}`}
                                    mb={4}
                                    borderRadius="md"
                                />
                                <Text fontWeight="bold" mb={2}>
                                    Option {index + 1}
                                </Text>
                                <Text mb={2}>{content.text}</Text>
                                {content.hashtags && (
                                    <Text fontSize="sm" color="gray.600">
                                        Hashtags: {content.hashtags}
                                    </Text>
                                )}
                            </GridItem>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default Content;
