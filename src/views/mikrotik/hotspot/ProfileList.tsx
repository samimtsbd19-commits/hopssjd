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

// Component Imports
import AddProfileDrawer from './AddProfileDrawer'

type Profile = {
  '.id': string
  name: string
  'rate-limit'?: string
  'shared-users'?: string
  routerName?: string
  routerId: string
}

const ProfileList = () => {
    // States
    const [addProfileOpen, setAddProfileOpen] = useState(false)
    const [data, setData] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/mikrotik/hotspot/profiles')
            if (res.ok) {
                const profiles = await res.json()
                setData(profiles)
            }
        } catch (error) {
            console.error('Failed to fetch profiles', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (profile: Profile) => {
        if (confirm(`Are you sure you want to delete profile '${profile.name}' from ${profile.routerName}?`)) {
            try {
                const res = await fetch('/api/mikrotik/hotspot/profiles', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: profile['.id'],
                        routerId: profile.routerId
                    })
                })
                if (res.ok) {
                    fetchData()
                } else {
                    alert('Failed to delete profile')
                }
            } catch (error) {
                console.error('Error deleting profile', error)
            }
        }
    }

    return (
        <Card>
            <CardHeader
                title='Hotspot User Profiles'
                action={
                    <Button
                        variant='contained'
                        startIcon={<i className='tabler-plus' />}
                        onClick={() => setAddProfileOpen(!addProfileOpen)}
                    >
                        Add New Profile
                    </Button>
                }
            />
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Router</TableCell>
                            <TableCell>Rate Limit</TableCell>
                            <TableCell>Shared Users</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align='center'>Loading Profiles...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align='center'>No profiles found.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => (
                                <TableRow key={`${row.routerId}-${row['.id']}-${index}`}>
                                    <TableCell component='th' scope='row'>
                                        <Typography className='font-medium'>{row.name}</Typography>
                                    </TableCell>
                                    <TableCell>{row.routerName}</TableCell>
                                    <TableCell>{row['rate-limit'] || 'Unlimited'}</TableCell>
                                    <TableCell>{row['shared-users']}</TableCell>
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
            <AddProfileDrawer
                open={addProfileOpen}
                handleClose={() => setAddProfileOpen(!addProfileOpen)}
                onSuccess={() => {
                    setAddProfileOpen(false)
                    fetchData()
                }}
            />
        </Card>
    )
}

export default ProfileList
