// Next Imports
import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...filteredUserData } = user

      return NextResponse.json(filteredUserData)
    } else {
      return NextResponse.json(
        { message: ['Email or Password is invalid'] },
        { status: 401, statusText: 'Unauthorized Access' }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: ['Server error'] },
      { status: 500 }
    )
  }
}
