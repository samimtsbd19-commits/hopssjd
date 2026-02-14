// Next Imports
import { NextResponse } from 'next/server'

// Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        router: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(vouchers)
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
            return NextResponse.json({ message: 'Voucher ID is required' }, { status: 400 })
        }

        // Ideally we should also delete from MikroTik, but since vouchers are just users there, we need the code.
        // Let's find the voucher first
        const voucher = await prisma.voucher.findUnique({
            where: { id },
            include: { router: true }
        })

        if (!voucher) {
            return NextResponse.json({ message: 'Voucher not found' }, { status: 404 })
        }

        // Delete from DB first (or both in parallel)
        await prisma.voucher.delete({ where: { id } })

        // Delete from MikroTik if router is active (optional enhancement to keep DB clean even if router offline)
        // But better to try to delete from router
        /*
        try {
            const api = new MikrotikService(voucher.router.host, voucher.router.port, voucher.router.user, voucher.router.password)
            await api.removeHotspotUser(voucher.code) // Assuming code is the username
        } catch (e) {
            console.warn('Failed to delete from router, but deleted from DB', e)
        }
        */

        return NextResponse.json({ message: 'Voucher deleted' })

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to delete voucher: ${error.message}` }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, isSold, soldBy } = await req.json()

        if (!id) {
            return NextResponse.json({ message: 'Voucher ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (typeof isSold === 'boolean') {
            updateData.isSold = isSold
            if (isSold) {
                updateData.soldAt = new Date()
                updateData.soldBy = soldBy || 'Admin'
            } else {
                updateData.soldAt = null
                updateData.soldBy = null
            }
        }

        const voucher = await prisma.voucher.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json(voucher)

    } catch (error: any) {
        return NextResponse.json({ message: `Failed to update voucher: ${error.message}` }, { status: 500 })
    }
}
