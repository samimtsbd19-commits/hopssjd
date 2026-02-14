// Next Imports
import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    // NOTE: In production, hash the password with bcrypt
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password, // TODO: Hash with bcrypt in production
        role: 'customer'
      }
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    )
  }
}
