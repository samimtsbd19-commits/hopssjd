// Next Imports
import { NextResponse } from 'next/server'

// Lib Imports
import { MikrotikService } from '@/libs/mikrotik'
// Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: List all profiles, optionally filtered by routerId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const routerId = searchParams.get('routerId')

    const whereClause: any = { isActive: true }
    if (routerId) whereClause.id = routerId

    const routers = await prisma.mikrotikRouter.findMany({
      where: whereClause
    })

    if (routers.length === 0) return NextResponse.json([])

    const promises = routers.map(async (router) => {
        try {
            const api = new MikrotikService(router.host, router.port, router.user, router.password)
            const profiles = await api.getProfiles() as any[]
            return profiles.map(profile => ({
                ...profile,
                routerId: router.id,
                routerName: router.name
            }))
        } catch (error) {
            console.error(`Failed to fetch profiles from ${router.name}`, error)
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

// POST: Create a profile on a specific router
export async function POST(req: Request) {
    try {
        const { routerId, name, rateLimit, sharedUsers, onLogin, onLogout } = await req.json()

        if (!routerId || !name) {
            return NextResponse.json({ message: 'Router ID and Profile Name are required' }, { status: 400 })
        }

        const router = await prisma.mikrotikRouter.findUnique({ where: { id: routerId } })
        if (!router) return NextResponse.json({ message: 'Router not found' }, { status: 404 })

        const api = new MikrotikService(router.host, router.port, router.user, router.password)
        
        // RouterOS REST usually uses PUT to create if ID known, or POST/PUT to collection
        // Check mikrotik.ts implementation, or just use generic request
        // For profiles: /ip/hotspot/user/profile
        
        const body = {
            name,
            'rate-limit': rateLimit,
            'shared-users': sharedUsers,
            'on-login': onLogin,
            'on-logout': onLogout
        }

        const result = await api.request('/ip/hotspot/user/profile', 'PUT', body)
        return NextResponse.json(result, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to create profile: ${error.message}` }, { status: 500 })
    }
}

// DELETE: Remove profile from a specific router
export async function DELETE(req: Request) {
    try {
        const { routerId, id } = await req.json()

        if (!routerId || !id) {
            return NextResponse.json({ message: 'Router ID and Profile ID are required' }, { status: 400 })
        }

        const router = await prisma.mikrotikRouter.findUnique({ where: { id: routerId } })
        if (!router) return NextResponse.json({ message: 'Router not found' }, { status: 404 })

        const api = new MikrotikService(router.host, router.port, router.user, router.password)
        await api.request(`/ip/hotspot/user/profile/${id}`, 'DELETE')

        return NextResponse.json({ message: 'Profile deleted' })

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to delete profile: ${error.message}` }, { status: 500 })
    }
}
