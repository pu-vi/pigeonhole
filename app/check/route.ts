import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function logRequest(method: string) {
  try {
    const log = await prisma.requestLog.create({
      data: {
        method,
        timestamp: new Date(),
      },
    })
    return NextResponse.json(log)
  } catch (error) {
    console.error(`Request logging error for ${method}:`, error)
    return NextResponse.json(
      { error: 'Failed to write request log to database.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return logRequest('GET')
}

export async function POST() {
  return logRequest('POST')
}

export async function PUT() {
  return logRequest('PUT')
}

export async function DELETE() {
  return logRequest('DELETE')
}
