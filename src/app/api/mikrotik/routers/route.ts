// Next Imports
import { NextResponse } from 'next/server'

// Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const routers = await prisma.mikrotikRouter.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(routers)
  } catch (error: any) {
    return NextResponse.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, host, port, user, password, description } = body

    if (!name || !host || !user || !password) {
      return NextResponse.json(
        { message: 'Name, Host, User, and Password are required' },
        { status: 400 }
      )
    }

    const router = await prisma.mikrotikRouter.create({
      data: {
        name,
        host,
        port: port || 8728,
        user,
        password, // TODO: Encrypt in production
        description,
        isActive: true
      }
    })

    return NextResponse.json(router, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Router ID is required' },
        { status: 400 }
      )
    }

    await prisma.mikrotikRouter.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Router deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
