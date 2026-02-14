// Next Imports
import { NextResponse } from 'next/server'

// Lib Imports
import { MikrotikService } from '@/libs/mikrotik'
// Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Get all active routers
    const routers = await prisma.mikrotikRouter.findMany({
      where: { isActive: true },
      select: {
          id: true,
          name: true,
          host: true,
          port: true,
          user: true,
          password: true
      }
    })

    if (routers.length === 0) {
        return NextResponse.json([])
    }

    // 2. Fetch active users from each router in parallel
    const promises = routers.map(async (router) => {
        try {
            const api = new MikrotikService(router.host, router.port, router.user, router.password)
            const users = await api.getActiveUsers() as any[]
            
            // Add router info to each user object
            return users.map(user => ({
                ...user,
                routerId: router.id,
                routerName: router.name,
                // Normalize data structure if needed (e.g. bytes-in/out to number)
                'bytes-in': parseInt(user['bytes-in'] || '0'),
                'bytes-out': parseInt(user['bytes-out'] || '0'),
                uptime: user.uptime || '0s'
            }))
        } catch (error: any) {
            console.error(`Failed to fetch from router ${router.name}:`, error)
            // Return empty array or error object, but keep other routers working
            return []
        }
    })

    const results = await Promise.all(promises)
    // Flatten array
    const allActiveUsers = results.flat()

    return NextResponse.json(allActiveUsers)

  } catch (error: any) {
    return NextResponse.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
    try {
        const { routerId, id } = await req.json() // id is usually the MikroTik internal ID (e.g. *1F)

        if (!routerId || !id) {
             return NextResponse.json({ message: 'Router ID and User ID session are required' }, { status: 400 })
        }

        const router = await prisma.mikrotikRouter.findUnique({
            where: { id: routerId }
        })

        if (!router) {
            return NextResponse.json({ message: 'Router not found' }, { status: 404 })
        }

        const api = new MikrotikService(router.host, router.port, router.user, router.password)
        await api.removeActiveUser(id)

        return NextResponse.json({ message: 'User disconnected' })

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to disconnect: ${error.message}` }, { status: 500 })
    }
}
