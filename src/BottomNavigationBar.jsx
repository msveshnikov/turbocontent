import { Box, Icon, Text, useMediaQuery } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiHome, FiBookOpen, FiUser } from 'react-icons/fi';
import { useContext } from 'react';
import { UserContext } from './App';

export const BottomNavigationBar = () => {
    const [isLargerThanMD] = useMediaQuery('(min-width: 768px)');
    const { user } = useContext(UserContext);

    if (isLargerThanMD) {
        return null;
    }

    return (
        <Box
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            height="50px"
            bg="white"
            borderTopWidth="1px"
            display="flex"
            justifyContent="space-around"
            alignItems="center"
            zIndex={1000}
            fontSize="sm"
            sx={{
                '@supports (backdrop-filter: blur(10px))': {
                    backdropFilter: 'blur(10px)',
                    bg: 'rgba(255, 255, 255, 0.9)'
                }
            }}
        >
            <Box as={Link} to="/" p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon as={FiHome} boxSize={5} />
                <Text fontSize="xs">Home</Text>
            </Box>
            <Box
                as={Link}
                to="/content"
                p={2}
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <Icon as={FiBookOpen} boxSize={5} />
                <Text fontSize="xs">Content</Text>
            </Box>
            <Box
                as={Link}
                to={user ? '/profile' : '/login'}
                p={2}
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <Icon as={FiUser} boxSize={5} />
                <Text fontSize="xs">{user ? 'Profile' : 'Login'}</Text>
            </Box>
        </Box>
    );
};
