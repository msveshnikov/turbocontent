import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
dotenv.config({ override: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MEDIA_FOLDER = join(__dirname, '../media');

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
