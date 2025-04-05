import express from 'express';
import cors from 'cors';
import fs from 'fs';
import promBundle from 'express-prom-bundle';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import morgan from 'morgan';
import compression from 'compression';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Feedback from './models/Feedback.js';
import Content from './models/Content.js';
import userRoutes from './user.js';
import adminRoutes from './admin.js';
import { authenticateTokenOptional, authenticateToken } from './middleware/auth.js';
import { getTextGemini } from './gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.set('trust proxy', 1);
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    customLabels: { model: 'No' },
    transformLabels: (labels, req) => {
        labels.model = req?.body?.model ?? 'No';
        return labels;
    }
});
app.use(metricsMiddleware);
app.use(cors());
app.use(express.static(join(__dirname, '../dist')));
app.use(morgan('dev'));
app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 130
});

if (process.env.NODE_ENV === 'production') {
    app.use('/api/', limiter);
}

mongoose.connect(process.env.MONGODB_URI, {});

userRoutes(app);
adminRoutes(app);

const generateAIResponse = async (prompt, model, temperature = 0.7) => {
    switch (model) {
        case 'gemini-2.5-pro-exp-03-25':
        case 'gemini-2.0-flash-001':
        case 'gemini-2.0-flash-thinking-exp-01-21':
            return await getTextGemini(prompt, model, temperature);
        default:
            return await getTextGemini(prompt, 'gemini-2.0-flash-thinking-exp-01-21', temperature);
    }
};

app.post('/api/feedback', authenticateTokenOptional, async (req, res) => {
    try {
        const { message, type } = req.body;
        const feedback = new Feedback({
            userId: req?.user?.id,
            message,
            type,
            createdAt: new Date()
        });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
    }
});

app.post('/api/generate-content', async (req, res) => {
    try {
        const {
            topic,
            goal,
            platform,
            tone,
            model = 'gemini-2.0-flash-thinking-exp-01-21'
        } = req.body;

        if (!topic || !goal || !platform || !tone) {
            return res.status(400).json({
                error: 'Missing required parameters: topic, goal, platform, and tone are required.'
            });
        }

        const prompt = `Generate 3 different social media post options about the topic: "${topic}".
            The goal of the posts is to "${goal}".
            The target platform is ${platform}.
            The desired tone is ${tone}.

            Each post option should include:
            - Engaging text optimized for the platform.
            - Relevant hashtags.
            - A short description for alt text for an image that would be relevant to the post.

            Format each option as a JSON object with keys: text, hashtags, altText.
            Return the response as a JSON array of these objects.`;

        let aiResponse;
        try {
            aiResponse = await generateAIResponse(prompt, model);
        } catch (aiError) {
            console.error('AI generation failed:', aiError);
            return res
                .status(500)
                .json({ error: 'AI content generation failed', details: aiError.message });
        }

        let contentOptions;
        try {
            contentOptions = JSON.parse(aiResponse);
            if (!Array.isArray(contentOptions)) {
                contentOptions = [
                    { text: aiResponse, hashtags: '', altText: 'Placeholder image description' }
                ];
            }
        } catch (parseError) {
            console.error('JSON parsing failed:', parseError);
            contentOptions = [
                { text: aiResponse, hashtags: '', altText: 'Placeholder image description' }
            ]; // Fallback even if JSON parsing fails, to return raw text.
        }

        res.status(200).json(contentOptions);
    } catch (error) {
        console.error('Error processing generate-content request:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});

app.post('/api/save-content', authenticateToken, async (req, res) => {
    try {
        const { topic, goal, platform, tone, contentOptions, model, isPrivate = false } = req.body;

        if (!topic || !goal || !platform || !tone || !contentOptions) {
            return res.status(400).json({
                error: 'Missing required parameters: topic, goal, platform, tone, and contentOptions are required.'
            });
        }

        const newContent = new Content({
            userId: req.user.id,
            topic,
            goal,
            platform,
            tone,
            contentOptions,
            model,
            isPrivate
        });

        const savedContent = await newContent.save();
        res.status(201).json(savedContent);
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).json({ error: 'Failed to save content', details: error.message });
    }
});

app.get('/', async (req, res) => {
    const html = fs.readFileSync(join(__dirname, '../dist/landing.html'), 'utf8');
    res.send(html);
});

app.get('*', async (req, res) => {
    const html = fs.readFileSync(join(__dirname, '../dist/index.html'), 'utf8');
    return res.send(html);
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

process.on('uncaughtException', (err, origin) => {
    console.error(`Caught exception: ${err}`, `Exception origin: ${origin}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.env['GOOGLE_APPLICATION_CREDENTIALS'] = './google.json';
