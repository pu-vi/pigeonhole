import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Subject, Difficulty, QuestionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      questionText,
      mediaUrl,
      type: typeString,
      subject: subjectString,
      difficulty: difficultyString,
      tags: tagsStringOrArray,
      option0,
      option1,
      option2,
      option3,
      correctAnswer: correctAnswerIndexStr
    } = body

    const errors: Record<string, string> = {}

    // Validation
    if (!questionText || typeof questionText !== 'string' || questionText.trim().length === 0) {
      errors.questionText = 'Question text is required.'
    }

    const options = [option0, option1, option2, option3].map(opt => typeof opt === 'string' ? opt.trim() : '')
    if (options.some(opt => opt.length === 0)) {
      errors.options = 'All four options must be filled out.'
    }

    if (correctAnswerIndexStr === null || correctAnswerIndexStr === undefined || correctAnswerIndexStr === '') {
      errors.correctAnswer = 'You must select one option as the correct answer.'
    }

    const correctAnswerIndex = Number(correctAnswerIndexStr)
    if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 3) {
      errors.correctAnswer = 'Invalid correct answer selection.'
    }

    if (!Object.values(QuestionType).includes(typeString as QuestionType)) {
      errors.type = 'Invalid question type.'
    }

    if (!Object.values(Subject).includes(subjectString as Subject)) {
      errors.subject = 'Invalid subject selected.'
    }

    if (!Object.values(Difficulty).includes(difficultyString as Difficulty)) {
      errors.difficulty = 'Invalid difficulty selected.'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please correct the errors in the form.',
          errors,
        },
        { status: 400 }
      )
    }

    const type = typeString as QuestionType
    const subject = subjectString as Subject
    const difficulty = difficultyString as Difficulty
    const correctAnswerText = options[correctAnswerIndex]

    // Parse tags
    let tags: string[] = []
    if (typeof tagsStringOrArray === 'string') {
      tags = Array.from(
        new Set(
          tagsStringOrArray
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
        )
      )
    } else if (Array.isArray(tagsStringOrArray)) {
      tags = Array.from(
        new Set(
          tagsStringOrArray
            .map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '')
            .filter(tag => tag.length > 0)
        )
      )
    }

    const question = await prisma.question.create({
      data: {
        subject,
        type,
        difficulty,
        questionText: questionText.trim(),
        mediaUrl: (typeof mediaUrl === 'string' && mediaUrl.trim().length > 0) ? mediaUrl.trim() : null,
        options,
        correctAnswer: correctAnswerText,
        explanation: (typeof body.explanation === 'string' && body.explanation.trim().length > 0) ? body.explanation.trim() : null,
        tags: {
          create: tags.map(tag => ({ tag })),
        },
      },
    })

    revalidatePath('/questions')

    return NextResponse.json({
      success: true,
      message: 'Question saved successfully!',
      data: question
    })
  } catch (error) {
    console.error('Error creating question in API:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred while saving the question.',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      questionText,
      mediaUrl,
      type: typeString,
      subject: subjectString,
      difficulty: difficultyString,
      tags: tagsStringOrArray,
      option0,
      option1,
      option2,
      option3,
      correctAnswer: correctAnswerIndexStr
    } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Question ID is required for update.' },
        { status: 400 }
      )
    }

    const errors: Record<string, string> = {}

    // Validation
    if (!questionText || typeof questionText !== 'string' || questionText.trim().length === 0) {
      errors.questionText = 'Question text is required.'
    }

    const options = [option0, option1, option2, option3].map(opt => typeof opt === 'string' ? opt.trim() : '')
    if (options.some(opt => opt.length === 0)) {
      errors.options = 'All four options must be filled out.'
    }

    if (correctAnswerIndexStr === null || correctAnswerIndexStr === undefined || correctAnswerIndexStr === '') {
      errors.correctAnswer = 'You must select one option as the correct answer.'
    }

    const correctAnswerIndex = Number(correctAnswerIndexStr)
    if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 3) {
      errors.correctAnswer = 'Invalid correct answer selection.'
    }

    if (!Object.values(QuestionType).includes(typeString as QuestionType)) {
      errors.type = 'Invalid question type.'
    }

    if (!Object.values(Subject).includes(subjectString as Subject)) {
      errors.subject = 'Invalid subject selected.'
    }

    if (!Object.values(Difficulty).includes(difficultyString as Difficulty)) {
      errors.difficulty = 'Invalid difficulty selected.'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please correct the errors in the form.',
          errors,
        },
        { status: 400 }
      )
    }

    const type = typeString as QuestionType
    const subject = subjectString as Subject
    const difficulty = difficultyString as Difficulty
    const correctAnswerText = options[correctAnswerIndex]

    // Parse tags
    let tags: string[] = []
    if (typeof tagsStringOrArray === 'string') {
      tags = Array.from(
        new Set(
          tagsStringOrArray
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
        )
      )
    } else if (Array.isArray(tagsStringOrArray)) {
      tags = Array.from(
        new Set(
          tagsStringOrArray
            .map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '')
            .filter(tag => tag.length > 0)
        )
      )
    }

    // Update question and overwrite tags in a transaction
    await prisma.$transaction([
      prisma.questionTag.deleteMany({
        where: { questionId: id }
      }),
      prisma.question.update({
        where: { id },
        data: {
          subject,
          type,
          difficulty,
          questionText: questionText.trim(),
          mediaUrl: (typeof mediaUrl === 'string' && mediaUrl.trim().length > 0) ? mediaUrl.trim() : null,
          options,
          correctAnswer: correctAnswerText,
          explanation: (typeof body.explanation === 'string' && body.explanation.trim().length > 0) ? body.explanation.trim() : null,
          tags: {
            create: tags.map(tag => ({ tag })),
          },
        },
      })
    ])

    revalidatePath('/questions')

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully!'
    })
  } catch (error) {
    console.error('Error updating question in API:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred while updating the question.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let id = request.nextUrl.searchParams.get('id')
    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // ignore parsing error if body is empty
      }
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Question ID is required for deletion.' },
        { status: 400 }
      )
    }

    await prisma.question.delete({
      where: { id }
    })

    revalidatePath('/questions')

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully!'
    })
  } catch (error) {
    console.error('Error deleting question in API:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the question.',
      },
      { status: 500 }
    )
  }
}
