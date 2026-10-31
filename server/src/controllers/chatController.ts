import { Request, Response } from 'express';
import { askQuestion } from '../services/ragService.js';

export async function handleChat(req: Request, res: Response): Promise<void> {
  try {
    const { question } = req.body;

    // validation: ensure a question was provided
    if (!question || typeof question !== 'string' || question.trim() === '') {
      res.status(400).json({
        success: false,
        error: "A valid 'question' string is required in the request body."
      });
      return;
    }

    // execute RAG pipeline
    const ragResponse = await askQuestion(question);

    // return 200 ok with the answer and source attribution
    res.status(200).json({
      success: true,
      data: ragResponse
    });
  } catch (error: any) {
    console.error('Error in handleChat controller:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your question. Please try again.'
    });
  }
}