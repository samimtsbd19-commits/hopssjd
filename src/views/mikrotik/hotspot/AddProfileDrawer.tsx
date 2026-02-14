'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'

import CustomTextField from '@core/components/mui/TextField'

type Router = {
  id: string
  name: string
}

type Props = {
  open: boolean
  handleClose: () => void
  onSuccess: () => void
}

type FormData = {
  routerId: string
  name: string
  rateLimit: string
  sharedUsers: string
  onLogin?: string
  onLogout?: string
}

const AddProfileDrawer = ({ open, handleClose, onSuccess }: Props) => {
  const [routers, setRouters] = useState<Router[]>([])

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      routerId: '',
      name: '',
      rateLimit: '',
      sharedUsers: '1',
      onLogin: '',
      onLogout: ''
    }
  })

  useEffect(() => {
    // Fetch routers for dropdown
    fetch('/api/mikrotik/routers')
      .then(res => res.json())
      .then(data => setRouters(data))
      .catch(err => console.error('Failed to load routers', err))
  }, [])

  const handleReset = () => {
    handleClose()
    reset()
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/mikrotik/hotspot/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        onSuccess()
        handleReset()
      } else {
        alert('Failed to create profile') // Simple feedback
      }
    } catch (error) {
      console.error('Error creating profile', error)
      alert('Network error')
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>Add New Profile</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textPrimary text-xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='routerId'
            control={control}
            rules={{ required: parseRouterIdRules() }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Select Router'
                {...field}
                error={false} // Add proper error handling
              >
                {routers.map(router => (
                  <MenuItem key={router.id} value={router.id}>
                    {router.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />

          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField fullWidth label='Profile Name' placeholder='e.g. 5Mbps' {...field} />
            )}
          />

          <Controller
            name='rateLimit'
            control={control}
            render={({ field }) => (
              <CustomTextField fullWidth label='Rate Limit (Rx/Tx)' placeholder='5M/5M' {...field} />
            )}
          />
          
          <Controller
            name='sharedUsers'
            control={control}
            render={({ field }) => (
              <CustomTextField fullWidth label='Shared Users' type="number" placeholder='1' {...field} />
            )}
          />

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              Submit
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

// Helper to avoid recreating rule object
const parseRouterIdRules = () => true

export default AddProfileDrawer
