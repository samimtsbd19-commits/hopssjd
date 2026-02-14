// Next Imports
import { NextResponse } from 'next/server'

// Lib Imports
import { MikrotikService } from '@/libs/mikrotik'
// Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: List all users from all active routers
export async function GET() {
  try {
    const routers = await prisma.mikrotikRouter.findMany({
      where: { isActive: true }
    })

    if (routers.length === 0) return NextResponse.json([])

    const promises = routers.map(async (router) => {
        try {
            const api = new MikrotikService(router.host, router.port, router.user, router.password)
            const users = await api.getHotspotUsers() as any[]
            return users.map(user => ({
                ...user,
                routerId: router.id,
                routerName: router.name,
                bytesIn: parseInt(user['bytes-in'] || '0'),
                bytesOut: parseInt(user['bytes-out'] || '0'),
            }))
        } catch (error) {
            console.error(`Failed to fetch users from ${router.name}`, error)
            return []
        }
    })

    const results = await Promise.all(promises)
    return NextResponse.json(results.flat())

  } catch (error: any) {
    return NextResponse.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST: Create a user on a specific router
export async function POST(req: Request) {
    try {
        const { routerId, name, password, profile, comment } = await req.json()

        if (!routerId || !name) {
            return NextResponse.json({ message: 'Router ID and Username are required' }, { status: 400 })
        }

        const router = await prisma.mikrotikRouter.findUnique({ where: { id: routerId } })
        if (!router) return NextResponse.json({ message: 'Router not found' }, { status: 404 })

        const api = new MikrotikService(router.host, router.port, router.user, router.password)
        
        const result = await api.addHotspotUser(name, password, profile, comment)
        return NextResponse.json(result, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to create user: ${error.message}` }, { status: 500 })
    }
}

// DELETE: Remove user from a specific router
export async function DELETE(req: Request) {
    try {
        const { routerId, id } = await req.json()

        if (!routerId || !id) {
            return NextResponse.json({ message: 'Router ID and User ID are required' }, { status: 400 })
        }

        const router = await prisma.mikrotikRouter.findUnique({ where: { id: routerId } })
        if (!router) return NextResponse.json({ message: 'Router not found' }, { status: 404 })

        const api = new MikrotikService(router.host, router.port, router.user, router.password)
        await api.removeHotspotUser(id)

        return NextResponse.json({ message: 'User deleted' })

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to delete user: ${error.message}` }, { status: 500 })
    }
}
