/* eslint-disable react/no-unescaped-entities */
import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

const Terms = () => {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const fetchLastUpdate = async () => {
            try {
                // TODO: Implement this endpoint on the server if needed, or hardcode the date.
                // const response = await fetch(`${API_URL}/api/terms/last-updated`);
                // const data = await response.json();
                // setLastUpdated(new Date(data.lastUpdated).toLocaleDateString());
                // Using current date as fallback/placeholder
                setLastUpdated(new Date().toLocaleDateString());
            } catch (error) {
                console.error('Error fetching terms update:', error);
                setLastUpdated(new Date().toLocaleDateString()); // Fallback to current date
            }
        };
        fetchLastUpdate();
    }, []);

    return (
        <Container maxW="container.lg" py={10}>
            <VStack spacing={6} align="stretch">
                <Heading as="h1" size="xl" textAlign="center">
                    Terms of Service
                </Heading>
                <Text textAlign="center">Last Updated: {lastUpdated}</Text>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        1. Acceptance of Terms
                    </Heading>
                    <Text mb={4}>
                        Welcome to Turbocontent! By accessing or using our website and services (the
                        &quot;Service&quot;), you agree to be bound by these Terms of Service
                        (&quot;Terms&quot;). If you disagree with any part of the terms, then you
                        may not access the Service. This agreement constitutes a legally binding
                        contract between you ("User," "you") and Turbocontent ("we," "us," "our").
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        2. Description of Service
                    </Heading>
                    <Text mb={4}>
                        Turbocontent provides users with tools to generate social media content
                        based on user inputs such as topic, goal, target platform, and desired tone.
                        The Service utilizes artificial intelligence (AI) to assist in content
                        creation.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        3. User Accounts
                    </Heading>
                    <Text mb={4}>
                        To access certain features of the Service, you may be required to create an
                        account. You are responsible for maintaining the confidentiality of your
                        account information, including your password, and for all activities that
                        occur under your account. You agree to notify us immediately of any
                        unauthorized use of your account or password or any other breach of
                        security.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        4. Use License
                    </Heading>
                    <Text mb={4}>
                        Subject to your compliance with these Terms, we grant you a limited,
                        non-exclusive, non-transferable, non-sublicensable license to access and use
                        the Service for your personal or internal business purposes. This license
                        does not include any right to resell or commercially exploit the Service or
                        its contents; any collection and use of any product listings, descriptions,
                        or prices; any derivative use of the Service or its contents; any
                        downloading or copying of account information for the benefit of another
                        merchant; or any use of data mining, robots, or similar data gathering and
                        extraction tools.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        5. AI-Generated Content
                    </Heading>
                    <Text mb={4}>
                        The Service uses AI to generate content suggestions. While we strive for
                        accuracy and relevance, the generated content may contain inaccuracies,
                        errors, or biases.
                    </Text>
                    <UnorderedList spacing={2} mb={4} pl={6}>
                        <ListItem>
                            You are solely responsible for reviewing, editing, and verifying any
                            content generated by the Service before publishing or using it.
                        </ListItem>
                        <ListItem>
                            Turbocontent does not guarantee the uniqueness, originality, or
                            suitability of the generated content for any specific purpose.
                        </ListItem>
                        <ListItem>
                            You are responsible for ensuring that the content you generate and use
                            complies with all applicable laws, regulations, and platform policies
                            (e.g., social media platform guidelines).
                        </ListItem>
                        <ListItem>
                            We make no warranties regarding the accuracy, reliability, or
                            completeness of the AI-generated content.
                        </ListItem>
                    </UnorderedList>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        6. User Responsibilities and Conduct
                    </Heading>
                    <Text mb={4}>
                        You agree not to use the Service for any unlawful purpose or in any way that
                        interrupts, damages, impairs, or renders the Service less efficient. You
                        agree not to misuse the Service, including but not limited to:
                    </Text>
                    <UnorderedList spacing={2} mb={4} pl={6}>
                        <ListItem>
                            Generating content that is defamatory, obscene, offensive, hateful, or
                            inflammatory.
                        </ListItem>
                        <ListItem>
                            Generating content that promotes illegal activities or discrimination.
                        </ListItem>
                        <ListItem>
                            Attempting to gain unauthorized access to the Service or its related
                            systems or networks.
                        </ListItem>
                        <ListItem>
                            Infringing upon the intellectual property rights of others.
                        </ListItem>
                    </UnorderedList>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        7. Intellectual Property Rights
                    </Heading>
                    <Text mb={4}>
                        The Service and its original content (excluding content generated by users),
                        features, and functionality are and will remain the exclusive property of
                        Turbocontent and its licensors. Our trademarks and trade dress may not be
                        used in connection with any product or service without the prior written
                        consent of Turbocontent.
                    </Text>
                    <Text mb={4}>
                        You retain ownership of the specific inputs you provide to the Service.
                        Subject to these Terms and any restrictions imposed by underlying AI models,
                        you may use the content generated for you by the Service for your personal
                        or business purposes. However, you are responsible for ensuring your use of
                        the generated content does not infringe on any third-party rights.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        8. Disclaimer of Warranties
                    </Heading>
                    <Text mb={4}>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Turbocontent
                        makes no representations or warranties of any kind, express or implied, as
                        to the operation of the Service, or the information, content, or materials
                        included therein. You expressly agree that your use of the Service is at
                        your sole risk.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        9. Limitation of Liability
                    </Heading>
                    <Text mb={4}>
                        In no event shall Turbocontent, nor its directors, employees, partners,
                        agents, suppliers, or affiliates, be liable for any indirect, incidental,
                        special, consequential or punitive damages, including without limitation,
                        loss of profits, data, use, goodwill, or other intangible losses, resulting
                        from (i) your access to or use of or inability to access or use the Service;
                        (ii) any conduct or content of any third party on the Service; (iii) any
                        content obtained from the Service; and (iv) unauthorized access, use or
                        alteration of your transmissions or content, whether based on warranty,
                        contract, tort (including negligence) or any other legal theory, whether or
                        not we have been informed of the possibility of such damage.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        10. Indemnification
                    </Heading>
                    <Text mb={4}>
                        You agree to defend, indemnify and hold harmless Turbocontent and its
                        licensee and licensors, and their employees, contractors, agents, officers
                        and directors, from and against any and all claims, damages, obligations,
                        losses, liabilities, costs or debt, and expenses (including but not limited
                        to attorney's fees), resulting from or arising out of a) your use and access
                        of the Service, by you or any person using your account and password; b) a
                        breach of these Terms, or c) content generated, posted, or used by you
                        through the Service.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        11. Changes to Terms
                    </Heading>
                    <Text mb={4}>
                        We reserve the right, at our sole discretion, to modify or replace these
                        Terms at any time. If a revision is material we will provide at least 30
                        days' notice prior to any new terms taking effect. What constitutes a
                        material change will be determined at our sole discretion. By continuing to
                        access or use our Service after any revisions become effective, you agree to
                        be bound by the revised terms.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        12. Termination
                    </Heading>
                    <Text mb={4}>
                        We may terminate or suspend your account and bar access to the Service
                        immediately, without prior notice or liability, under our sole discretion,
                        for any reason whatsoever and without limitation, including but not limited
                        to a breach of the Terms.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        13. Governing Law
                    </Heading>
                    <Text mb={4}>
                        These Terms shall be governed and construed in accordance with the laws of
                        the jurisdiction in which Turbocontent operates, without regard to its
                        conflict of law provisions.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        14. Dispute Resolution
                    </Heading>
                    <Text mb={4}>
                        Any disputes arising out of or related to these Terms or the Service shall
                        ideally be resolved through amicable negotiation. If negotiation fails,
                        disputes may be resolved through binding arbitration or in small claims
                        court, as determined appropriate, in the governing jurisdiction.
                    </Text>
                </Box>

                <Box>
                    <Heading as="h2" size="lg" mb={4}>
                        15. Contact Us
                    </Heading>
                    <Text mb={4}>
                        If you have any questions about these Terms, please contact us through the
                        feedback form or designated contact channels provided on the website.
                    </Text>
                </Box>
            </VStack>
        </Container>
    );
};

export default Terms;
