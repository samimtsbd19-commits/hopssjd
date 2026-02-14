'use client'

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

// Util Imports
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// Component Imports
import AddUserDrawer from './AddUserDrawer'

type HotspotUser = {
  '.id': string
  name: string
  profile: string
  comment?: string
  routerName?: string
  routerId: string
  bytesIn: number
  bytesOut: number
}

const UserList = () => {
    // States
    const [addUserOpen, setAddUserOpen] = useState(false)
    const [data, setData] = useState<HotspotUser[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/mikrotik/hotspot/users')
            if (res.ok) {
                const users = await res.json()
                setData(users)
            }
        } catch (error) {
            console.error('Failed to fetch users', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (user: HotspotUser) => {
        if (confirm(`Are you sure you want to delete user '${user.name}' from ${user.routerName}?`)) {
            try {
                const res = await fetch('/api/mikrotik/hotspot/users', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: user['.id'],
                        routerId: user.routerId
                    })
                })
                if (res.ok) {
                    fetchData()
                } else {
                    alert('Failed to delete user')
                }
            } catch (error) {
                console.error('Error deleting user', error)
            }
        }
    }

    return (
        <Card>
            <CardHeader
                title='Hotspot Static Users'
                action={
                    <Button
                        variant='contained'
                        startIcon={<i className='tabler-plus' />}
                        onClick={() => setAddUserOpen(!addUserOpen)}
                    >
                        Add New User
                    </Button>
                }
            />
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Router</TableCell>
                            <TableCell>Profile</TableCell>
                            <TableCell>Comment</TableCell>
                            <TableCell>Usage (DL/UL)</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align='center'>Loading Users...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align='center'>No hotspot users found.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => (
                                <TableRow key={`${row.routerId}-${row['.id']}-${index}`}>
                                    <TableCell component='th' scope='row'>
                                        <Typography className='font-medium'>{row.name}</Typography>
                                    </TableCell>
                                    <TableCell>{row.routerName}</TableCell>
                                    <TableCell>
                                        <Chip label={row.profile} size='small' variant='outlined' />
                                    </TableCell>
                                    <TableCell>{row.comment}</TableCell>
                                    <TableCell>
                                        <div className='flex flex-col text-xs'>
                                            <span>📉 {formatBytes(row.bytesOut)}</span>
                                            <span>📈 {formatBytes(row.bytesIn)}</span>
                                        </div>
                                    </TableCell>
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
            <AddUserDrawer
                open={addUserOpen}
                handleClose={() => setAddUserOpen(!addUserOpen)}
                onSuccess={() => {
                    setAddUserOpen(false)
                    fetchData()
                }}
            />
        </Card>
    )
}

export default UserList
