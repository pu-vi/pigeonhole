'use server'

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
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questionText: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" }
            },
            correctAnswerIndex: { type: "integer" },
            explanation: { type: "string" }
          },
          required: ["questionText", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response:', errorText)
      return {
        success: false,
        message: `Gemini API returned status ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return {
        success: false,
        message: 'No response content was received from the AI model.',
      }
    }

    const parsed = JSON.parse(text)
    if (
      typeof parsed.questionText !== 'string' ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctAnswerIndex !== 'number' ||
      parsed.correctAnswerIndex < 0 ||
      parsed.correctAnswerIndex > 3 ||
      typeof parsed.explanation !== 'string'
    ) {
      return {
        success: false,
        message: 'The AI model returned an invalid or malformed response structure.',
      }
    }

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
    console.error('Error calling Gemini API:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during generation.',
    }
  }
}
