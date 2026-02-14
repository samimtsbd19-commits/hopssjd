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

// Util function for bytes
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

type ActiveUser = {
  '.id': string
  id: string
  name: string
  address: string
  uptime: string
  'bytes-in': number
  'bytes-out': number
  'mac-address': string
  login: string
  routerName: string
  routerId: string
}

const ActiveUsersList = () => {
  // States
  const [data, setData] = useState<ActiveUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/mikrotik/hotspot/active')
      if (res.ok) {
        const users = await res.json()
        setData(users)
      }
    } catch (error) {
      console.error('Failed to fetch active users', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDisconnect = async (user: ActiveUser) => {
    if (confirm(`Assuming you want to disconnect '${user.name}' at ${user.address}?`)) {
      try {
        const res = await fetch('/api/mikrotik/hotspot/active', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id: user['.id'], // MikroTik internal ID often starts with *
              routerId: user.routerId 
          })
        })
        if (res.ok) {
          fetchData()
        } else {
            console.error('Failed to disconnect user')
        }
      } catch (error) {
        console.error('Network error during disconnect', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title='Active Hotspot Users'
        action={
          <Button
            variant='contained'
            startIcon={<i className='tabler-refresh' />}
            onClick={fetchData}
          >
            Refresh
          </Button>
        }
      />
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>IP / MAC</TableCell>
              <TableCell>Router</TableCell>
              <TableCell>Uptime</TableCell>
              <TableCell>Download</TableCell>
              <TableCell>Upload</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align='center'>
                  Loading Active Users...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align='center'>
                  No active users found across connected routers.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={`${row.routerId}-${row['.id']}-${index}`}>
                  <TableCell component='th' scope='row'>
                    <div className='flex flex-col'>
                      <Typography className='font-medium'>{row.name}</Typography>
                      <Chip label={row.login} size='small' variant='tonal' color='primary' className='w-fit h-6 text-xs' />
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className='flex flex-col'>
                          <Typography variant='body2'>{row.address}</Typography>
                          <Typography variant='caption' className='text-textSecondary'>{row['mac-address']}</Typography>
                      </div>
                  </TableCell>
                  <TableCell>{row.routerName}</TableCell>
                  <TableCell>{row.uptime}</TableCell>
                  <TableCell>{formatBytes(row['bytes-out'])}</TableCell> {/* Download = Out (from router to user) usually, but bytes-out is from router perspective, so Out = Download */}
                  <TableCell>{formatBytes(row['bytes-in'])}</TableCell>   {/* Upload = In (from user to router) */}
                  <TableCell>
                    <IconButton size='small' color='error' onClick={() => handleDisconnect(row)} title='Disconnect User'>
                      <i className='tabler-logout-2' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default ActiveUsersList
