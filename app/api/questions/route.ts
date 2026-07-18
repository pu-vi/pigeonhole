import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Subject, Difficulty, QuestionType } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const difficulty = searchParams.get('difficulty')
    const subject = searchParams.get('subject')
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')

    const skip = (page - 1) * limit

    const where: any = {}

    if (difficulty && Object.values(Difficulty).includes(difficulty as Difficulty)) {
      where.difficulty = difficulty as Difficulty
    }
    if (subject && Object.values(Subject).includes(subject as Subject)) {
      where.subject = subject as Subject
    }
    if (type && Object.values(QuestionType).includes(type as QuestionType)) {
      where.type = type as QuestionType
    }
    if (tag && tag.trim().length > 0) {
      where.tags = {
        some: {
          tag: tag.trim().toLowerCase(),
        },
      }
    }

    const [questions, total] = await prisma.$transaction([
      prisma.question.findMany({
        where,
        include: {
          tags: {
            orderBy: {
              tag: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions in API:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      },
      { status: 500 }
    )
  }
}
