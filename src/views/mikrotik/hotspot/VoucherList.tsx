// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'

// Component Imports
import GenerateVoucherDrawer from './GenerateVoucherDrawer'

type Voucher = {
  id: string
  code: string
  profile: string
  price: number
  isSold: boolean
  createdAt: string
  router: {
      name: string
  }
}

const VoucherList = () => {
    // States
    const [generateOpen, setGenerateOpen] = useState(false)
    const [data, setData] = useState<Voucher[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selected, setSelected] = useState<string[]>([])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/mikrotik/hotspot/vouchers')
            if (res.ok) {
                const vouchers = await res.json()
                setData(vouchers)
            }
        } catch (error) {
            console.error('Failed to fetch vouchers', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (voucher: Voucher) => {
        if (confirm(`Delete voucher ${voucher.code}?`)) {
            try {
                const res = await fetch('/api/mikrotik/hotspot/vouchers', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: voucher.id })
                })
                if (res.ok) {
                    fetchData()
                } else {
                    alert('Failed to delete voucher')
                }
            } catch (error) {
                console.error('Error deleting voucher', error)
            }
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(data.map(v => v.id))
        } else {
            setSelected([])
        }
    }

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelected([...selected, id])
        } else {
            setSelected(selected.filter(sid => sid !== id))
        }
    }

    const handlePrintSelected = () => {
        if (selected.length === 0) return
        const vouchersToPrint = data.filter(v => selected.includes(v.id))
        localStorage.setItem('printVouchers', JSON.stringify(vouchersToPrint))
        window.open('/print/vouchers', '_blank')
    }

    const handleMarkAsSold = async (isSold: boolean) => {
        if (selected.length === 0) return
        
        if (!confirm(`Mark ${selected.length} vouchers as ${isSold ? 'SOLD' : 'AVAILABLE'}?`)) return

        // Ideally batch update, but we'll do promise all for now
        // Or implement batch endpoint. Let's do Promise.all for simplicity
        try {
            await Promise.all(selected.map(id => 
                fetch('/api/mikrotik/hotspot/vouchers', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, isSold })
                })
            ))
            fetchData()
            setSelected([])
        } catch (e) {
            console.error('Update failed', e)
        }
    }

    return (
        <Card>
            <CardHeader
                title='Voucher Management'
                action={
                    <div className='flex gap-2'>
                        {selected.length > 0 && (
                            <>
                                <Button 
                                    variant='tonal' 
                                    color='success'
                                    startIcon={<i className='tabler-currency-dollar' />}
                                    onClick={() => handleMarkAsSold(true)}
                                >
                                    Mark Sold
                                </Button>
                                <Button 
                                    variant='tonal' 
                                    color='primary'
                                    startIcon={<i className='tabler-printer' />}
                                    onClick={handlePrintSelected}
                                >
                                    Print ({selected.length})
                                </Button>
                            </>
                        )}
                        <Button
                            variant='contained'
                            startIcon={<i className='tabler-wand' />}
                            onClick={() => setGenerateOpen(!generateOpen)}
                        >
                            Generate
                        </Button>
                    </div>
                }
            />
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < data.length}
                                    checked={data.length > 0 && selected.length === data.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Profile</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Router</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} align='center'>Loading Vouchers...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align='center'>No vouchers found. Generate some!</TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id} selected={selected.includes(row.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(row.id)}
                                            onChange={(e) => handleSelect(row.id, e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell component='th' scope='row'>
                                        <Typography className='font-medium font-mono text-primary'>{row.code}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={row.profile} size='small' variant='outlined' />
                                    </TableCell>
                                    <TableCell>${row.price?.toFixed(2)}</TableCell>
                                    <TableCell>{row.router?.name}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.isSold ? 'Sold' : 'Available'} 
                                            color={row.isSold ? 'success' : 'info'} 
                                            size='small' 
                                            variant='tonal' 
                                            onClick={() => {
                                                // Toggle single status
                                                // handleMarkAsSoldSingle(row.id, !row.isSold)
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <IconButton size='small' color='error' onClick={() => handleDelete(row)}>
                                            <i className='tabler-trash' />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <GenerateVoucherDrawer
                open={generateOpen}
                handleClose={() => setGenerateOpen(!generateOpen)}
                onSuccess={(count) => {
                    alert(`Successfully generated ${count} vouchers!`)
                    setGenerateOpen(false)
                    fetchData()
                }}
            />
        </Card>
    )
}

export default VoucherList
