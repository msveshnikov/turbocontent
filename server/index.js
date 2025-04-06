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
import { authenticateTokenOptional } from './middleware/auth.js';
import { getTextImageContent } from './gemini.js';
import { promises as fsPromises } from 'fs';
import { fetchSearchResults, searchWebContent } from './search.js';
import { enrichMetadata } from './utils.js';

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
    includeStatusCode: true
});
app.use(metricsMiddleware);
app.use(cors());
app.use(express.static(join(__dirname, '../dist')));
app.use('/media', express.static(join(__dirname, '../media')));
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

app.post('/api/generate-content', authenticateTokenOptional, async (req, res) => {
    try {
        const { topic, goal, platform, tone, contentOptions } = req.body;
        const { wordCount = 50, customInstructions = '', keywords = [] } = contentOptions || {};

        if (!topic || !goal || !platform || !tone) {
            return res.status(400).json({
                error: 'Missing required parameters: topic, goal, platform, and tone are required.'
            });
        }

        const webSearchContent = await fetchSearchResults(topic);
        let webContent = await searchWebContent(webSearchContent);

        let prompt = `Generate a social media post about the topic: "${topic}".
            The goal of the post is to "${goal}".
            The target platform is ${platform}.
            The desired tone is ${tone}.
            Research the web and think about the topic before generating. Web search results
                <web_search_results>${JSON.stringify(webSearchContent)}</web_search_results>
                <web_content>${webContent}</web_content>
            Word count should be approximately ${wordCount} words.`;

        if (customInstructions) {
            prompt += `\n\nCustom instructions: ${customInstructions}`;
        }

        if (keywords && keywords.length > 0) {
            prompt += `\n\nInclude these keywords: ${keywords.join(', ')}`;
        }

        prompt += `\n\nPost option should include:
            - Engaging text optimized for the platform.
            - Relevant images and hashtags.
            - Always include at least 3 images inside text.

            Return the response as markdown`;

        let aiResponse;
        aiResponse = await getTextImageContent(prompt);

        if (!aiResponse) {
            return res
                .status(500)
                .json({ error: 'AI content generation failed: No response received' });
        }

        try {
            const newContent = new Content({
                userId: req.user?.id,
                topic,
                goal,
                platform,
                tone,
                content: aiResponse,
                isPrivate: false,
                wordCount,
                customInstructions,
                keywords: keywords
            });

            await newContent.save();
            return res.status(200).json({ content: aiResponse });
        } catch (saveError) {
            console.error('Error auto-saving content:', saveError);
            return res
                .status(200)
                .json({ content: aiResponse, saveError: 'Failed to auto-save content' });
        }
    } catch (error) {
        console.error('Error processing generate-content request:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});

app.get('/api/docs', async (req, res) => {
    try {
        const search = req.query.search ? req.query.search.toLowerCase() : '';
        const categoryQuery =
            req.query.category && req.query.category !== 'all'
                ? req.query.category.toLowerCase()
                : null;
        const docsPath = join(__dirname, '../docs');
        const filenames = await fsPromises.readdir(docsPath);
        const docsData = await Promise.all(
            filenames.map(async (filename) => {
                const filePath = join(docsPath, filename);
                const content = await fsPromises.readFile(filePath, 'utf8');
                const title = filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
                const category = 'general';
                return { title, category, content, filename };
            })
        );
        let filteredDocs = docsData;
        if (categoryQuery) {
            filteredDocs = filteredDocs.filter(
                (doc) =>
                    doc.category.toLowerCase().includes(categoryQuery) ||
                    doc.filename.toLowerCase().includes(categoryQuery)
            );
        }
        if (search) {
            filteredDocs = filteredDocs.filter(
                (doc) =>
                    doc.title.toLowerCase().includes(search) ||
                    doc.content.toLowerCase().includes(search)
            );
        }
        res.json(filteredDocs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/', async (req, res) => {
    const html = fs.readFileSync(join(__dirname, '../dist/landing.html'), 'utf8');
    res.send(html);
});

app.get('*', async (req, res) => {
    const html = fs.readFileSync(join(__dirname, '../dist/index.html'), 'utf8');
    if (!req.path.startsWith('/content/')) {
        return res.send(html);
    }
    const slug = req.path.substring(6);
    const enrichedHtml = await enrichMetadata(html, slug);
    res.send(enrichedHtml);
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
