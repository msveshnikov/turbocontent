import {
    Box,
    Container,
    Heading,
    Text,
    Link,
    VStack,
    UnorderedList,
    ListItem,
    Switch,
    FormControl,
    FormLabel,
    Stack,
    Divider
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { API_URL } from './App';

const Privacy = () => {
    const [lastUpdated, setLastUpdated] = useState('');
    const [consentSettings, setConsentSettings] = useState({
        necessary: true,
        analytics: true,
        aiProcessing: true,
        researchData: true,
        presentationCustomization: true,
        socialFeatures: false,
        marketingCommunications: true
    });

    useEffect(() => {
        const fetchLastUpdate = async () => {
            try {
                const response = await fetch(`${API_URL}/api/privacy/last-updated`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.lastUpdated) {
                    setLastUpdated(new Date(data.lastUpdated).toLocaleDateString());
                } else {
                    setLastUpdated(new Date().toLocaleDateString());
                }
            } catch (error) {
                console.error('Error fetching last update date:', error);
                setLastUpdated(new Date().toLocaleDateString());
            }
        };
        fetchLastUpdate();
    }, []);

    const handleConsentChange = async (setting) => {
        const newSettings = { ...consentSettings, [setting]: !consentSettings[setting] };
        setConsentSettings(newSettings);
        try {
            const response = await fetch(`${API_URL}/api/privacy/consent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting, value: newSettings[setting] })
            });
            if (!response.ok) {
                console.error('Failed to update privacy settings. Status:', response.status);
            }
        } catch (error) {
            console.error('Error updating privacy settings:', error);
        }
    };

    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={6} align="stretch">
                <Heading as="h1" size="2xl" textAlign="center">
                    Privacy Policy for Turbocontent
                </Heading>
                <Text textAlign="center">Last Updated: {lastUpdated}</Text>
                <Divider />

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        1. Introduction
                    </Heading>
                    <Text mb={4}>
                        Welcome to Turbocontent! We are committed to protecting your privacy and
                        ensuring you have a positive experience on our website and using our
                        services. This Privacy Policy explains our practices regarding the
                        collection, use, and disclosure of your information when you use
                        Turbocontent.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        2. Information We Collect
                    </Heading>
                    <Text mb={3}>
                        We collect several types of information to provide and improve our services,
                        including:
                    </Text>
                    <UnorderedList spacing={2} mb={4}>
                        <ListItem>
                            Personal Data: This includes information you provide directly to us,
                            such as your name, email address, username, and password when you
                            register for an account, subscribe to our newsletter, or contact us for
                            support.
                        </ListItem>
                        <ListItem>
                            Content Generation Inputs: When you use Turbocontent to generate social
                            media content, we collect the topics, goals, platform selections, tone
                            preferences, and any other inputs you provide to create content.
                        </ListItem>
                        <ListItem>
                            Usage Data: We automatically collect information on how you interact
                            with Turbocontent. This may include your IP address, browser type,
                            device information, pages visited, time spent on pages, and actions
                            taken within the application.
                        </ListItem>
                        <ListItem>
                            Cookies and Tracking Technologies: We use cookies and similar tracking
                            technologies to track activity on our service and hold certain
                            information. Cookies are files with small amount of data which may
                            include an anonymous unique identifier.
                        </ListItem>
                    </UnorderedList>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        3. Use of Information
                    </Heading>
                    <Text mb={3}>
                        We use the collected information for various purposes, including:
                    </Text>
                    <UnorderedList spacing={2} mb={4}>
                        <ListItem>
                            To provide and maintain our Service, including to enable content
                            generation and customization features.
                        </ListItem>
                        <ListItem>
                            To personalize your experience and deliver content and feature offerings
                            relevant to your interests.
                        </ListItem>
                        <ListItem>
                            To improve our Service and develop new features and functionality.
                        </ListItem>
                        <ListItem>
                            To monitor the usage of our Service and ensure its stability and
                            security.
                        </ListItem>
                        <ListItem>
                            To communicate with you, including responding to your inquiries,
                            providing customer support, and sending you updates and promotional
                            materials (based on your marketing preferences).
                        </ListItem>
                        <ListItem>
                            For research and analytical purposes to understand user behavior and
                            trends.
                        </ListItem>
                        <ListItem>
                            To detect, prevent, and address technical issues, security breaches, or
                            fraud.
                        </ListItem>
                        <ListItem>To comply with legal obligations.</ListItem>
                    </UnorderedList>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        4. AI Processing and Data Usage
                    </Heading>
                    <Text mb={3}>
                        Turbocontent utilizes AI to enhance your content creation experience. AI
                        processing is involved in:
                    </Text>
                    <UnorderedList spacing={2} mb={4}>
                        <ListItem>Generating social media content based on your inputs.</ListItem>
                        <ListItem>
                            Analyzing user preferences to improve content suggestions.
                        </ListItem>
                        <ListItem>Personalizing the user interface and content delivery.</ListItem>
                        <ListItem>
                            Aggregating and anonymizing data for research and development to improve
                            our AI models and services.
                        </ListItem>
                    </UnorderedList>
                    <Text>
                        We are committed to responsible AI practices and continuously work to ensure
                        fairness, transparency, and accountability in our AI operations.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        5. Data Retention and Deletion
                    </Heading>
                    <Text mb={4}>
                        We retain your personal data only for as long as necessary to fulfill the
                        purposes for which it was collected, including compliance with legal,
                        accounting, or reporting requirements. When deciding how long to keep
                        personal data, we consider the amount, nature, and sensitivity of the
                        personal data, the potential risk of harm from unauthorized use or
                        disclosure of your personal data, the purposes for which we process your
                        personal data and whether we can achieve those purposes through other means,
                        and the applicable legal requirements.
                    </Text>
                    <Text mb={4}>
                        Upon your request, we will take reasonable steps to delete or anonymize your
                        data from our systems, unless we are legally required to retain it. Please
                        note that there might be latency in deleting information from our servers
                        and backup storage.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        6. Data Security
                    </Heading>
                    <Text mb={4}>
                        We are committed to ensuring the security of your information. We implement
                        robust security measures designed to protect your personal data from
                        unauthorized access, use, alteration, or disclosure. These measures include
                        encryption, firewalls, secure server facilities, and rigorous access control
                        policies.
                    </Text>
                    <Text mb={4}>
                        Despite our best efforts, no method of transmission over the internet or
                        method of electronic storage is completely secure. Therefore, while we
                        strive to use commercially acceptable means to protect your personal data,
                        we cannot guarantee its absolute security.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        7. Third-Party Disclosure
                    </Heading>
                    <Text mb={4}>
                        We may employ third-party companies and individuals to facilitate our
                        Service (&quot;Service Providers&quot;), to provide the Service on our
                        behalf, to perform Service-related services or to assist us in analyzing how
                        our Service is used. These third parties have access to your Personal Data
                        only to perform these tasks on our behalf and are obligated not to disclose
                        or use it for any other purpose.
                    </Text>
                    <Text mb={4}>
                        We may disclose your personal information if required to do so by law or in
                        response to valid requests by public authorities (e.g., a court or a
                        government agency).
                    </Text>
                    <Text mb={4}>
                        We do not sell, trade, or otherwise transfer your personal information to
                        outside parties for marketing purposes.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        8. Your Rights
                    </Heading>
                    <Text mb={4}>You have certain rights regarding your personal data:</Text>
                    <UnorderedList spacing={2} mb={4}>
                        <ListItem>
                            Right to Access: You have the right to request access to your personal
                            data held by us.
                        </ListItem>
                        <ListItem>
                            Right to Rectification: You have the right to ask us to correct personal
                            data you think is inaccurate. You also have the right to ask us to
                            complete information you think is incomplete.
                        </ListItem>
                        <ListItem>
                            Right to Erasure: You have the right to request that we erase your
                            personal data under certain conditions.
                        </ListItem>
                        <ListItem>
                            Right to Restrict Processing: You have the right to request that we
                            restrict the processing of your personal data under certain conditions.
                        </ListItem>
                        <ListItem>
                            Right to Object to Processing: You have the right to object to the
                            processing of your personal data under certain conditions.
                        </ListItem>
                        <ListItem>
                            Right to Data Portability: You have the right to request that we
                            transfer the data that we have collected to another organization, or
                            directly to you, under certain conditions.
                        </ListItem>
                    </UnorderedList>
                    <Text mb={4}>
                        To exercise any of these rights, or if you have any questions or concerns
                        about our privacy practices, please contact us at{' '}
                        <Link href="mailto:privacy@turbocontent.art" color="blue.500">
                            privacy@turbocontent.art
                        </Link>
                        .
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        9. Policy Modifications
                    </Heading>
                    <Text mb={4}>
                        We reserve the right to modify this Privacy Policy at any time to reflect
                        changes in our practices or legal requirements. We will notify you of any
                        significant changes by posting the new Privacy Policy on this page and
                        updating the &quot;Last Updated&quot; date. We encourage you to review this
                        Privacy Policy periodically for any updates.
                    </Text>
                    <Text mb={4}>
                        Your continued use of Turbocontent after any modifications to the Privacy
                        Policy constitutes your acknowledgment of the updated policy and agreement
                        to abide and be bound by the modified Privacy Policy.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        10. Your Privacy Choices
                    </Heading>
                    <Text mb={4}>
                        We provide you with choices regarding the collection and use of your
                        information. You can manage your preferences for certain types of data
                        processing below:
                    </Text>
                    <Stack spacing={4} mb={4}>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="necessary" mb="0" flex="1">
                                Essential Services (Always Active)
                            </FormLabel>
                            <Switch
                                id="necessary"
                                isChecked={consentSettings.necessary}
                                isDisabled
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="analytics" mb="0" flex="1">
                                Website Analytics
                            </FormLabel>
                            <Switch
                                id="analytics"
                                isChecked={consentSettings.analytics}
                                onChange={() => handleConsentChange('analytics')}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="aiProcessing" mb="0" flex="1">
                                AI Processing for Content Generation
                            </FormLabel>
                            <Switch
                                id="aiProcessing"
                                isChecked={consentSettings.aiProcessing}
                                onChange={() => handleConsentChange('aiProcessing')}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="researchData" mb="0" flex="1">
                                Research Data Collection for Service Improvement
                            </FormLabel>
                            <Switch
                                id="researchData"
                                isChecked={consentSettings.researchData}
                                onChange={() => handleConsentChange('researchData')}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="presentationCustomization" mb="0" flex="1">
                                Personalization and Presentation Customization
                            </FormLabel>
                            <Switch
                                id="presentationCustomization"
                                isChecked={consentSettings.presentationCustomization}
                                onChange={() => handleConsentChange('presentationCustomization')}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="socialFeatures" mb="0" flex="1">
                                Social Features and Interactions
                            </FormLabel>
                            <Switch
                                id="socialFeatures"
                                isChecked={consentSettings.socialFeatures}
                                onChange={() => handleConsentChange('socialFeatures')}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="marketingCommunications" mb="0" flex="1">
                                Marketing Communications
                            </FormLabel>
                            <Switch
                                id="marketingCommunications"
                                isChecked={consentSettings.marketingCommunications}
                                onChange={() => handleConsentChange('marketingCommunications')}
                            />
                        </FormControl>
                    </Stack>
                    <Text fontSize="sm" color="gray.600">
                        Please note that disabling certain settings may affect your experience and
                        the functionality of Turbocontent.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={3}>
                        11. Contact Us
                    </Heading>
                    <Text mb={4}>
                        If you have any questions, concerns, or requests regarding this Privacy
                        Policy or our privacy practices, please do not hesitate to contact us:
                    </Text>
                    <Text mb={4}>
                        By email:
                        <Link href="mailto:privacy@turbocontent.art" color="blue.500">
                            privacy@turbocontent.art
                        </Link>
                    </Text>
                </Box>
            </VStack>
        </Container>
    );
};

export default Privacy;
