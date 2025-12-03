import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generates a vector embedding for a given text string.
 * Model: text-embedding-004
 * Dimensions: 768
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    // Replace newlines to improve embedding quality (Standard practice)
    const cleanText = text.replace(/\n/g, ' ');

    const result = await model.embedContent(cleanText);
    const embedding = result.embedding;

    if (!embedding || !embedding.values) {
      throw new Error('Failed to generate embedding: No values returned');
    }

    return embedding.values;
  } catch (error: any) {
    console.error('❌ AI Embedding Error:', error.message);
    throw error;
  }
};