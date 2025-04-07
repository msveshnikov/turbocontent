import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    useToast,
    Container
} from '@chakra-ui/react';
import { API_URL } from './App';

const Reset = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();
    const { token } = useParams();

    useEffect(() => {
        if (!token) {
            setIsValidToken(false);
            toast({
                title: 'Invalid reset link',
                description: 'The password reset link is invalid or has expired.',
                status: 'error',
                duration: 2000,
                isClosable: true
            });
            navigate('/login');
        }
    }, [token, toast, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                status: 'error',
                duration: 2000,
                isClosable: true
            });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'An error occurred');
            }
            toast({
                title: 'Password reset successful',
                description: 'You can now login with your new password',
                status: 'success',
                duration: 2000,
                isClosable: true
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: 'Password reset failed',
                description: error.message || 'An error occurred',
                status: 'error',
                duration: 2000,
                isClosable: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.sm" py={8}>
            <Box borderRadius="md" p={1}>
                <Box borderRadius="md" p={8} boxShadow="lg">
                    <VStack spacing={6} align="stretch">
                        <Heading as="h1" size="xl" textAlign="center" bgClip="text">
                            Reset Password
                        </Heading>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>New Password</FormLabel>
                                    <Input
                                        variant="filled"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                        placeholder="Enter new password"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <Input
                                        variant="filled"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        minLength={6}
                                        placeholder="Confirm new password"
                                    />
                                </FormControl>
                                <Button
                                    type="submit"
                                    width="full"
                                    isLoading={isLoading}
                                    isDisabled={!isValidToken}
                                    size="lg"
                                >
                                    Reset Password
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                </Box>
            </Box>
        </Container>
    );
};

export default Reset;
