import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
dotenv.config({ override: true });

const vertex_ai = new VertexAI({ project: process.env.GOOGLE_KEY, location: 'us-central1' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MEDIA_FOLDER = join(__dirname, '../media');

export const getTextGemini = async (prompt, model, temperature = 0.7, imageBase64) => {
    const generation_config = {
        temperature: temperature,
        maxOutputTokens: 8192,
        tools: [
            {
                googleSearchRetrieval: {
                    disableAttribution: true
                }
            }
        ]
    };

    const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: model
    });

    const parts = [];
    if (imageBase64 && !imageBase64.startsWith('http')) {
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
            }
        });
    }
    parts.push({ text: prompt });

    const chat = generativeModel.startChat({ generation_config });
    const result = await chat.sendMessage(parts);
    return result?.response?.candidates?.[0].content?.parts?.[0]?.text;
};

export const getTextImageContent = async (prompt) => {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp-image-generation',
        generationConfig: {
            responseModalities: ['Text', 'Image']
        }
    });
    const result = await model.generateContent(prompt);
    let content = '';
    for (const part of result.response.candidates[0].content.parts) {
        if (part.text) {
            content += part.text;
        } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            content += `![alt text](/media${await convertImage(Buffer.from(imageData, 'base64'))})`;
        }
    }
    return content;
};

export const convertImage = async (imageBuffer) => {
    const output = `/${nanoid()}.jpeg`;
    const outputPath = join(MEDIA_FOLDER, output);
    try {
        await sharp(imageBuffer)
            .resize(1200, 675, {
                fit: 'cover',
                position: 'center'
            })
            .rotate()
            .jpeg({ quality: 90 })
            .toFile(outputPath);
        return output;
    } catch (error) {
        console.error('Image conversion error:', error.message);
        return null;
    }
};

const MODEL_SOCIAL_MEDIA = 'gemini-pro';

export const generateSocialMediaText = async (topic, goal, platform, tone) => {
    const prompt = `Generate engaging social media content for ${platform}. 
Topic: ${topic}. 
Goal: ${goal}. 
Tone: ${tone}. 
Create a few options.`;
    return await getTextGemini(prompt, MODEL_SOCIAL_MEDIA, 0.7);
};

export const generateHashtags = async (topic, platform, tone) => {
    const prompt = `Generate relevant and trending hashtags for a social media post on ${platform} about ${topic} with a ${tone} tone.`;
    return await getTextGemini(prompt, MODEL_SOCIAL_MEDIA, 0.5);
};

export const generateAltText = async (imageDescription) => {
    const prompt = `Write descriptive alt text for an image depicting: ${imageDescription}. Focus on accessibility and SEO.`;
    return await getTextGemini(prompt, MODEL_SOCIAL_MEDIA, 0.5);
};
