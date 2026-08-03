'use server'

import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai'

export type FormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export type AIQuestionResponse = {
  success: boolean
  message: string
  data?: {
    questionText: string
    options: string[]
    correctAnswerIndex: number
    explanation: string
  }
}

export async function generateQuestionWithAI(
  subject: string,
  difficulty: string,
  tags?: string
): Promise<AIQuestionResponse> {
  const timestamp = new Date().toISOString()
  console.log(`\x1b[36m[DEBUG - ${timestamp}] [generateQuestionWithAI]\x1b[0m Starting AI question generation with Google Gen AI SDK`, {
    subject,
    difficulty,
    tags,
  })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(`\x1b[31m[DEBUG - ${timestamp}] [generateQuestionWithAI]\x1b[0m Missing GEMINI_API_KEY environment variable.`)
    return {
      success: false,
      message: 'Gemini API key is not configured in the environment.',
    }
  }

  const prompt = `Generate a multiple choice question with exactly 4 options.
Subject: ${subject}
Difficulty: ${difficulty}
${tags?.trim() ? `Tags/Topic: ${tags}` : ''}

Requirements:
1. The question must be appropriate for the difficulty level '${difficulty}' and subject '${subject}'.
2. Provide exactly 4 plausible options.
3. Indicate the correct option by its index (0, 1, 2, or 3).
4. Provide a helpful, concise explanation for the correct answer.`

  console.log(`\x1b[33m[DEBUG] [generateQuestionWithAI]\x1b[0m Constructed Prompt:\n${prompt}`)

  try {
    console.log(`\x1b[34m[DEBUG] [generateQuestionWithAI]\x1b[0m Initializing GoogleGenAI client...`)
    const ai = new GoogleGenAI({ apiKey })

    console.log(`\x1b[34m[DEBUG] [generateQuestionWithAI]\x1b[0m Calling ai.models.generateContent (gemini-2.5-flash)...`)
    const response = await ai.models.generateContent({
      // model: 'gemini-2.5-flash',
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ['questionText', 'options', 'correctAnswerIndex', 'explanation'],
        },
      },
    })

    const text = response.text
    console.log(`\x1b[35m[DEBUG] [generateQuestionWithAI]\x1b[0m Received raw response text from SDK:`, text)

    if (!text) {
      console.warn(`\x1b[33m[DEBUG] [generateQuestionWithAI]\x1b[0m No response text returned from SDK.`)
      return {
        success: false,
        message: 'No response content was received from the AI model.',
      }
    }

    const parsed = JSON.parse(text)
    console.log(`\x1b[32m[DEBUG] [generateQuestionWithAI]\x1b[0m Parsed JSON payload:`, parsed)

    if (
      typeof parsed.questionText !== 'string' ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctAnswerIndex !== 'number' ||
      parsed.correctAnswerIndex < 0 ||
      parsed.correctAnswerIndex > 3 ||
      typeof parsed.explanation !== 'string'
    ) {
      console.error(`\x1b[31m[DEBUG] [generateQuestionWithAI]\x1b[0m Schema validation failed on parsed output:`, parsed)
      return {
        success: false,
        message: 'The AI model returned an invalid or malformed response structure.',
      }
    }

    console.log(`\x1b[32m[DEBUG] [generateQuestionWithAI]\x1b[0m Question generated successfully via Gen AI SDK!`)

    return {
      success: true,
      message: 'Question generated successfully!',
      data: {
        questionText: parsed.questionText,
        options: parsed.options,
        correctAnswerIndex: parsed.correctAnswerIndex,
        explanation: parsed.explanation,
      },
    }
  } catch (error) {
    console.error(`\x1b[31m[DEBUG] [generateQuestionWithAI]\x1b[0m Exception caught in generateQuestionWithAI:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during generation.',
    }
  }
}
