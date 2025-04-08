import {
    ChakraProvider,
    Box,
    Container,
    VStack,
    extendTheme,
    Spinner,
    Center,
    useMediaQuery
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './Landing';
import { lazy, Suspense, createContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './TopNavigationBar';
import Terms from './Terms';
import Privacy from './Privacy';
import Login from './Login';
import SignUp from './SignUp';
import Forgot from './Forgot';
import Reset from './Reset';
import { BottomNavigationBar } from './BottomNavigationBar';

const Admin = lazy(() => import('./Admin'));
const Feedback = lazy(() => import('./Feedback'));
const Docs = lazy(() => import('./Docs'));
const Content = lazy(() => import('./Content'));
const ContentId = lazy(() => import('./ContentId'));
const Profile = lazy(() => import('./Profile'));

export const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : 'https://turbocontent.art';
export const UserContext = createContext(null);

const theme = extendTheme({
    colors: {
        primary: {
            50: '#E0F7FA',
            100: '#B2EBF2',
            200: '#80DEEA',
            300: '#4DD0E1',
            400: '#26C6DA',
            500: '#00BCD4',
            600: '#00ACC1',
            700: '#0097A7',
            800: '#00838F',
            900: '#006064'
        },
        secondary: {
            50: '#F3E5F5',
            100: '#E1BEE7',
            200: '#CE93D8',
            300: '#BA68C8',
            400: '#AB47BC',
            500: '#9C27B0',
            600: '#8E24AA',
            700: '#7B1FA2',
            800: '#6A1B9A',
            900: '#4A148C'
        },
        accent: {
            50: '#FFFDE7',
            100: '#FFF9C4',
            200: '#FFF59D',
            300: '#FFF176',
            400: '#FFEE58',
            500: '#FFEB3B',
            600: '#FDD835',
            700: '#FBC02D',
            800: '#F9A825',
            900: '#F57F17'
        },
        neutral: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
        },
        success: {
            50: '#E8F5E9',
            100: '#C8E6C9',
            200: '#A5D6A7',
            300: '#81C784',
            400: '#66BB6A',
            500: '#4CAF50',
            600: '#43A047',
            700: '#388E3C',
            800: '#2E7D32',
            900: '#1B5E20'
        },
        error: {
            50: '#FFEBEE',
            100: '#FFCDD2',
            200: '#EF9A9A',
            300: '#E57373',
            400: '#EF5350',
            500: '#F44336',
            600: '#E53935',
            700: '#D32F2F',
            800: '#C62828',
            900: '#B71C1C'
        },
        warning: {
            50: '#FFFDE7',
            100: '#FFF9C4',
            200: '#FFF59D',
            300: '#FFF176',
            400: '#FFEE58',
            500: '#FFEB3B',
            600: '#FDD835',
            700: '#FBC02D',
            800: '#F9A825',
            900: '#F57F17'
        },
        info: {
            50: '#E3F2FD',
            100: '#BBDEFB',
            200: '#90CAF9',
            300: '#64B5F6',
            400: '#42A5F5',
            500: '#2196F3',
            600: '#1E88E5',
            700: '#1976D2',
            800: '#1565C0',
            900: '#0D47A1'
        }
    },
    fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif',
        mono: `Menlo, monospace`
    },
    components: {
        Button: {
            variants: {
                primary: {
                    bg: 'primary.500',
                    color: 'white',
                    _hover: {
                        bg: 'primary.600',
                        _disabled: {
                            bg: 'primary.300'
                        }
                    },
                    _active: {
                        bg: 'primary.700'
                    },
                    _loading: {
                        bg: 'primary.500',
                        color: 'white',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        _hover: {
                            bg: 'primary.500'
                        }
                    },
                    _disabled: {
                        bg: 'primary.300',
                        opacity: 0.6,
                        cursor: 'not-allowed'
                    }
                },
                secondary: {
                    bg: 'secondary.500',
                    color: 'white',
                    _hover: {
                        bg: 'secondary.600',
                        _disabled: {
                            bg: 'secondary.300'
                        }
                    },
                    _active: {
                        bg: 'secondary.700'
                    },
                    _loading: {
                        bg: 'secondary.500',
                        color: 'white',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        _hover: {
                            bg: 'secondary.500'
                        }
                    },
                    _disabled: {
                        bg: 'secondary.300',
                        opacity: 0.6,
                        cursor: 'not-allowed'
                    }
                },
                accent: {
                    bg: 'accent.500',
                    color: 'neutral.800',
                    _hover: {
                        bg: 'accent.600',
                        _disabled: {
                            bg: 'accent.300'
                        }
                    },
                    _active: {
                        bg: 'accent.700'
                    },
                    _loading: {
                        bg: 'accent.500',
                        color: 'neutral.800',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        _hover: {
                            bg: 'accent.500'
                        }
                    },
                    _disabled: {
                        bg: 'accent.300',
                        opacity: 0.6,
                        cursor: 'not-allowed'
                    }
                }
            },
            defaultProps: {
                variant: 'primary'
            }
        }
    },
    styles: {
        global: {
            body: {
                bg: 'neutral.50',
                color: 'neutral.800'
            }
        }
    }
});

function App() {
    const [user, setUser] = useState();
    const [isLargerThanMD] = useMediaQuery('(min-width: 768px)');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_URL}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(async (res) => {
                    if (!res.ok) {
                        localStorage.removeItem('token');
                        const errorData = await res.json().catch(() => ({}));
                        console.error('Profile fetch error:', errorData.message || res.statusText);
                        return null;
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data) {
                        setUser(data);
                    } else {
                        setUser(null);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching profile:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                });
        } else {
            setUser(null);
        }
    }, []);

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <ChakraProvider theme={theme}>
                <Suspense
                    fallback={
                        <Center height="100vh">
                            <Spinner
                                thickness="4px"
                                speed="0.65s"
                                emptyColor="gray.200"
                                color="primary.500"
                                size="xl"
                            />
                        </Center>
                    }
                >
                    <UserContext.Provider value={{ user, setUser }}>
                        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                            <Box pb={{ base: '70px', md: '0' }} minH="100vh" bg="neutral.100">
                                {isLargerThanMD ? <Navbar /> : null}
                                <Container maxW="container.xl" py={8}>
                                    <VStack spacing={8} align="stretch">
                                        <Routes>
                                            <Route path="/" element={<Landing />} />
                                            <Route
                                                path="/research"
                                                element={<Navigate to="/" replace />}
                                            />
                                            <Route path="/privacy" element={<Privacy />} />
                                            <Route path="/terms" element={<Terms />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/signup" element={<SignUp />} />
                                            <Route path="/forgot" element={<Forgot />} />
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/feedback" element={<Feedback />} />
                                            <Route path="/content" element={<Content />} />
                                            <Route path="/content/:id" element={<ContentId />} />
                                            <Route
                                                path="/reset-password/:token"
                                                element={<Reset />}
                                            />
                                            <Route path="/admin" element={<Admin />} />
                                            <Route path="/docs/*" element={<Docs />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </VStack>
                                </Container>
                                {!isLargerThanMD ? <BottomNavigationBar /> : null}
                            </Box>
                        </Router>
                    </UserContext.Provider>
                </Suspense>
            </ChakraProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
