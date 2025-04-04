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
import userRoutes from './user.js';
import adminRoutes from './admin.js';
import { authenticateTokenOptional } from './middleware/auth.js';
import { getTextGemini } from './gemini';

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
        case 'gemini-2.0-pro-exp-02-05':
        case 'gemini-2.0-flash-001':
        case 'gemini-2.0-flash-thinking-exp-01-21':
            return await getTextGemini(prompt, model, temperature);
        default:
            throw new Error('Invalid model specified');
    }
};

export const getIpFromRequest = (req) => {
    let ips = (
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        ''
    ).split(',');
    return ips[0].trim();
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
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-content', async (req, res) => {
    const { topic, goal, platform, tone, model = 'gpt-4o-mini' } = req.body;

    if (!topic || !goal || !platform || !tone) {
        return res.status(400).json({ error: 'Missing required parameters' });
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

    const aiResponse = await generateAIResponse(prompt, model);

    let contentOptions;
    try {
        contentOptions = JSON.parse(aiResponse);
        if (!Array.isArray(contentOptions)) {
            contentOptions = [
                { text: aiResponse, hashtags: '', altText: 'Placeholder image description' }
            ]; // Fallback if not valid JSON array
        }
        {
            contentOptions = [
                { text: aiResponse, hashtags: '', altText: 'Placeholder image description' }
            ]; // Fallback if JSON parsing fails
        }

        res.status(200).json(contentOptions);
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
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
