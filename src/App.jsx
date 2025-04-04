import {
    ChakraProvider,
    Box,
    Container,
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
    AlertIcon,
    extendTheme
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './Landing';
import { lazy, Suspense, createContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './Navbar';
import Terms from './Terms';
import Privacy from './Privacy';
import Login from './Login';
import SignUp from './SignUp';
import Forgot from './Forgot';
import Reset from './Reset';
import Profile from './Profile';
import { BottomNavigationBar } from './BottomNavigationBar';

const Admin = lazy(() => import('./Admin'));
const Feedback = lazy(() => import('./Feedback'));
const Docs = lazy(() => import('./Docs'));

export const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : 'https://boiler.pro';
export const UserContext = createContext(null);

const theme = extendTheme({
    colors: {
        primary: {
            500: '#3498DB'
        },
        secondary: {
            500: '#2980B9',
            600: '#2471A3'
        },
        accent: {
            500: '#F1C40F',
            600: '#E67E22'
        }
    },
    fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif'
    }
});

function App() {
    const [user, setUser] = useState();
    const [topic, setTopic] = useState('');
    const [goal, setGoal] = useState('');
    const [platform, setPlatform] = useState('');
    const [tone, setTone] = useState('');
    const [generatedContent, setGeneratedContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_URL}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    setUser(data);
                });
        }
    }, []);

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
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <ChakraProvider theme={theme}>
                <Suspense
                    fallback={
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100vh"
                        >
                            Loading...
                        </Box>
                    }
                >
                    <UserContext.Provider value={{ user, setUser }}>
                        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                            <Box pb="50px" minH="100vh" bg="gray.50">
                                <Navbar />
                                <Container maxW="container.xl" py={8}>
                                    <VStack spacing={8}>
                                        <Routes>
                                            <Route path="/" element={<Landing />} />
                                            <Route path="/research" element={<Landing />} />

                                            <Route path="/privacy" element={<Privacy />} />
                                            <Route path="/terms" element={<Terms />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/signup" element={<SignUp />} />
                                            <Route path="/forgot" element={<Forgot />} />
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/feedback" element={<Feedback />} />
                                            <Route
                                                path="/reset-password/:token"
                                                element={<Reset />}
                                            />
                                            <Route path="/admin" element={<Admin />} />
                                            <Route path="/docs/*" element={<Docs />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                        {/* Content Generation Section */}
                                        <Box
                                            p={5}
                                            shadow="md"
                                            borderWidth="1px"
                                            borderRadius="md"
                                            bg="white"
                                        >
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
                                                        <option value="engagement">
                                                            Engagement
                                                        </option>
                                                        <option value="promotion">Promotion</option>
                                                        <option value="awareness">Awareness</option>
                                                        <option value="inspiration">
                                                            Inspiration
                                                        </option>
                                                    </Select>
                                                </FormControl>
                                                <FormControl id="platform">
                                                    <FormLabel>Platform</FormLabel>
                                                    <Select
                                                        value={platform}
                                                        onChange={(e) =>
                                                            setPlatform(e.target.value)
                                                        }
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
                                                        <option value="informative">
                                                            Informative
                                                        </option>
                                                        <option value="inspiring">Inspiring</option>
                                                        <option value="humorous">Humorous</option>
                                                        <option value="serious">Serious</option>
                                                    </Select>
                                                </FormControl>
                                                <Button
                                                    colorScheme="primary"
                                                    onClick={handleGenerateContent}
                                                    isLoading={loading}
                                                >
                                                    Generate Content
                                                </Button>
                                            </VStack>
                                        </Box>

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
                                                                <Text
                                                                    fontSize="sm"
                                                                    color="gray.600"
                                                                >
                                                                    Hashtags: {content.hashtags}
                                                                </Text>
                                                            )}
                                                        </GridItem>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        )}
                                    </VStack>
                                </Container>
                                <BottomNavigationBar />
                            </Box>
                        </Router>
                    </UserContext.Provider>
                </Suspense>
            </ChakraProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
