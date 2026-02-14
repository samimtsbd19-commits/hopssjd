// Next Imports
import { NextResponse } from 'next/server'

import prisma from '@/libs/prisma'

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
    const user = await (prisma.user as any).create({
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
        role: (user as any).role
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    return NextResponse.json(
      { message: 'Server error during registration', error: error.message },
      { status: 500 }
    )
  }
}
