'use client'

import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

type Voucher = {
  id: string
  code: string
  profile: string
  price: number
  router?: {
      name: string
  }
}

const VoucherPrintTemplate = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([])

  useEffect(() => {
    // Retrieve vouchers from storage
    const stored = localStorage.getItem('printVouchers')
    if (stored) {
      try {
        setVouchers(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse voucher data', e)
      }
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (vouchers.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
              <Typography variant="h5">No vouchers to print</Typography>
              <Button onClick={() => window.close()}>Close</Button>
          </div>
      )
  }

  return (
    <div className="p-8 print:p-0">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Typography variant="h4">Print Preview ({vouchers.length} Vouchers)</Typography>
        <div className="flex gap-4">
            <Button variant="contained" onClick={handlePrint}>Print Now</Button>
            <Button variant="outlined" color="secondary" onClick={() => window.close()}>Close</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="border-2 border-dashed border-gray-400 p-4 rounded-lg flex flex-col items-center justify-center text-center relative break-inside-avoid">
            <div className="absolute top-2 right-2 text-xs font-bold bg-black text-white px-2 py-0.5 rounded">
                ${voucher.price?.toFixed(2)}
            </div>
            
            <Typography variant="subtitle2" className="font-bold uppercase tracking-widest text-primary mb-1">
                WiFi Access
            </Typography>
            
            <Typography variant="h4" className="font-mono font-bold my-2 tracking-wide border-y-2 border-black py-1">
                {voucher.code}
            </Typography>
            
            <div className="w-full flex justify-between text-xs text-gray-600 mt-2 px-2">
                <span>Profile: {voucher.profile}</span>
                <span>{voucher.router?.name}</span>
            </div>
            
            <Typography variant="caption" className="mt-2 text-[10px] text-gray-500">
                Type this code to login to hotspot
            </Typography>
          </div>
        ))}
      </div>
      
      <style jsx global>{`
        @media print {
            @page {
                size: A4;
                margin: 1cm;
            }
            body {
                background: white;
            }
        }
      `}</style>
    </div>
  )
}

export default VoucherPrintTemplate
