import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { requireAuth, requirePermission } from './middleware/auth.js';

dotenv.config();

const router = express.Router();

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

router.post('/chat', requireAuth, requirePermission('copilot.read'), async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.',
        details: 'The AI assistant requires an OpenAI API key to function. Please contact your administrator to set up the API key.'
      });
    }

    const { message, context } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'message is too long. Please keep it under 2000 characters.' });
    }

    const systemPrompt = `You are an AI assistant for a Waste Management System.
Provide concise, helpful answers about waste management operations, data analysis, and system functionality.
When useful, leverage provided context (JSON) about the current page, selections, or filters.
If asked to perform actions, reply with what you can do and any needed information.
Keep responses under 500 words and be specific to waste management topics.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ message: message.trim(), context: context || null }) }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      max_tokens: 600,
      timeout: 15000
    });

    const content = completion.choices?.[0]?.message?.content || '';
    if (!content) {
      return res.status(500).json({ error: 'No response generated from AI service' });
    }

    return res.json({ reply: content });
  } catch (err) {
    console.error('AI /chat error:', err);
    
    if (err.code === 'insufficient_quota') {
      return res.status(500).json({ 
        error: 'AI service quota exceeded',
        details: 'OpenAI API quota has been exceeded. Please contact your administrator.'
      });
    } else if (err.code === 'invalid_api_key') {
      return res.status(500).json({ 
        error: 'Invalid API key',
        details: 'The OpenAI API key is invalid. Please contact your administrator.'
      });
    } else if (err.code === 'rate_limit_exceeded') {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please wait a moment before trying again.'
      });
    }
    
    return res.status(500).json({ 
      error: 'AI service error',
      details: 'An unexpected error occurred. Please try again later.'
    });
  }
});

export default router;


