// Next Imports
import { NextResponse } from 'next/server'

// Lib Imports
import { MikrotikService } from '@/libs/mikrotik'
// Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateCode(length: number, prefix: string = ''): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Removed confusing chars like 1/I, 0/O
    let result = ''
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return prefix + result
}

export async function POST(req: Request) {
    try {
        const { routerId, profile, prefix, length, qty, price } = await req.json()

        if (!routerId || !profile || !qty) {
            return NextResponse.json({ message: 'Router, Profile, and Quantity are required' }, { status: 400 })
        }

        const router = await prisma.mikrotikRouter.findUnique({ where: { id: routerId } })
        if (!router) return NextResponse.json({ message: 'Router not found' }, { status: 404 })

        const api = new MikrotikService(router.host, router.port, router.user, router.password)
        
        const generatedVouchers = []
        const createdCount = 0

        // Create vouchers one by one (or batch if possible, but one by one is safer for atomicity/errors)
        for (let i = 0; i < Number(qty); i++) {
            const code = generateCode(Number(length) || 6, prefix || '')
            
            try {
                // 1. Add to MikroTik
                await api.addHotspotUser(code, code, profile, 'Voucher')

                // 2. Add to DB
                const voucher = await prisma.voucher.create({
                    data: {
                        code,
                        password: code,
                        profile,
                        price: Number(price) || 0,
                        routerId: router.id
                    }
                })
                generatedVouchers.push(voucher)
            } catch (err: any) {
                console.error(`Failed to generate voucher ${code}`, err)
                // Continue despite error? Or stop? Continue is usually better for batch.
            }
        }

        return NextResponse.json({ 
            message: `Generated ${generatedVouchers.length} vouchers successfully`,
            count: generatedVouchers.length
        }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ message: `Server error: ${error.message}` }, { status: 500 })
    }
}
