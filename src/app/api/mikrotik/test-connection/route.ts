// Next Imports
import { NextResponse } from 'next/server'

// Lib Imports
import { MikrotikService } from '@/libs/mikrotik'

export async function POST(req: Request) {
  try {
    const { host, port, user, password } = await req.json()

    if (!host || !user) {
      return NextResponse.json(
        { message: 'Host and user are required' },
        { status: 400 }
      )
    }

    const mikrotik = new MikrotikService(host, port || 8728, user, password || '')
    const result = await mikrotik.checkConnection()

    if (result.success) {
      return NextResponse.json({ 
        message: 'Connection successful',
        data: result.data 
      })
    } else {
      return NextResponse.json(
        { message: `Connection failed: ${result.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
