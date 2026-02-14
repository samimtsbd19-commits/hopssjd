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

// Component Imports
import AddRouterDrawer from './AddRouterDrawer'

type MikrotikRouter = {
  id: string
  name: string
  host: string
  port: number
  user: string
  description?: string
  isActive: boolean
  createdAt: string
}

const RouterList = () => {
  // States
  const [addRouterOpen, setAddRouterOpen] = useState(false)
  const [data, setData] = useState<MikrotikRouter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/mikrotik/routers')
      if (res.ok) {
        const routers = await res.json()
        setData(routers)
      }
    } catch (error) {
      console.error('Failed to fetch routers', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this router?')) {
      try {
        const res = await fetch('/api/mikrotik/routers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })
        if (res.ok) {
          fetchData()
        }
      } catch (error) {
        console.error('Failed to delete router', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title='MikroTik Routers'
        action={
          <Button
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => setAddRouterOpen(!addRouterOpen)}
          >
            Add New Router
          </Button>
        }
      />
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  No routers found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow key={row.id}>
                  <TableCell component='th' scope='row'>
                    <div className='flex flex-col'>
                      <Typography className='font-medium'>{row.name}</Typography>
                      <Typography variant='body2' className='text-textSecondary'>
                        {row.description}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>{row.host}:{row.port}</TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.isActive ? 'Active' : 'Inactive'}
                      color={row.isActive ? 'success' : 'secondary'}
                      size='small'
                      variant='tonal'
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size='small' color='error' onClick={() => handleDelete(row.id)}>
                      <i className='tabler-trash' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AddRouterDrawer
        open={addRouterOpen}
        handleClose={() => setAddRouterOpen(!addRouterOpen)}
        onSuccess={() => {
          setAddRouterOpen(false)
          fetchData()
        }}
      />
    </Card>
  )
}

export default RouterList
