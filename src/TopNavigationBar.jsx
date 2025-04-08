import { useContext } from 'react';
import { Box, Flex, Stack, Link, Button, useColorModeValue, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { UserContext } from './App';

export default function TopNavigationBar() {
    const { user, setUser } = useContext(UserContext);
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <Box
            as="nav"
            bg={bgColor}
            borderBottomWidth="1px"
            borderColor={borderColor}
            px={14}
            py={2}
            boxShadow="sm"
            position="sticky"
            top="0"
            zIndex="999"
        >
            <Flex align="center" justify="space-between" h={16}>
                <Link as={RouterLink} to="/" fontWeight="bold" fontSize="lg" color={textColor}>
                    Turbocontent
                </Link>
                <HStack spacing={8} align="center">
                    <DesktopNav textColor={textColor} />
                    <Flex align="center">
                        {user ? (
                            <HStack spacing={4}>
                                <Link as={RouterLink} to="/profile" color={textColor}>
                                    Profile
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    colorScheme="primary"
                                >
                                    Logout
                                </Button>
                            </HStack>
                        ) : (
                            <HStack spacing={4}>
                                <Button
                                    as={RouterLink}
                                    to="/login"
                                    variant="ghost"
                                    colorScheme="primary"
                                >
                                    Login
                                </Button>
                                <Button as={RouterLink} to="/signup" variant="primary">
                                    Sign Up
                                </Button>
                            </HStack>
                        )}
                    </Flex>
                </HStack>
            </Flex>
        </Box>
    );
}

const NAV_ITEMS = [
    {
        label: 'Content',
        href: '/content'
    },
    {
        label: 'Docs',
        href: '/docs'
    },
    {
        label: 'Feedback',
        href: '/feedback'
    },
    {
        label: 'Admin',
        href: '/admin',
        isAdmin: true
    }
];

const DesktopNav = ({ textColor }) => {
    const { user } = useContext(UserContext);
    let filteredNavItems = NAV_ITEMS;
    if (!user?.isAdmin) {
        filteredNavItems = NAV_ITEMS.filter((item) => !item.isAdmin);
    }

    return (
        <Stack direction="row" spacing={6}>
            {filteredNavItems.map((item) => (
                <Link
                    key={item.label}
                    as={RouterLink}
                    to={item.href}
                    fontWeight={500}
                    color={textColor}
                    _hover={{
                        textDecoration: 'none'
                        // color: useColorModeValue('primary.500', 'primary.200')
                    }}
                >
                    {item.label}
                </Link>
            ))}
        </Stack>
    );
};
