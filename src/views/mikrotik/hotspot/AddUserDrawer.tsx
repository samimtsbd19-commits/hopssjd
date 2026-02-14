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
import InputAdornment from '@mui/material/InputAdornment'

import CustomTextField from '@core/components/mui/TextField'

type Router = {
  id: string
  name: string
}

type Profile = {
  '.id': string
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
  password?: string
  profile?: string
  comment?: string
}

const AddUserDrawer = ({ open, handleClose, onSuccess }: Props) => {
  const [routers, setRouters] = useState<Router[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showPassword, setShowPassword] = useState(false)

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      routerId: '',
      name: '',
      password: '',
      profile: 'default',
      comment: ''
    }
  })

  const selectedRouterId = watch('routerId')

  useEffect(() => {
    fetch('/api/mikrotik/routers')
      .then(res => res.json())
      .then(data => setRouters(data))
      .catch(err => console.error('Failed to load routers', err))
  }, [])

  useEffect(() => {
    if (selectedRouterId) {
      fetch(`/api/mikrotik/hotspot/profiles?routerId=${selectedRouterId}`)
        .then(res => res.json())
        .then(data => setProfiles(data))
        .catch(err => console.error('Failed to load profiles', err))
    } else {
        setProfiles([])
    }
  }, [selectedRouterId])

  const handleReset = () => {
    handleClose()
    reset()
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/mikrotik/hotspot/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        onSuccess()
        handleReset()
      } else {
        alert('Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user', error)
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
        <Typography variant='h5'>Add Hotspot User</Typography>
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
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Select Router'
                {...field}
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
              <CustomTextField fullWidth label='Username' placeholder='johndoe' {...field} />
            )}
          />

          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Password'
                type={showPassword ? 'text' : 'password'}
                placeholder='············'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={e => e.preventDefault()}
                        edge='end'
                      >
                        <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          
          <Controller
            name='profile'
            control={control}
            render={({ field }) => (
              <CustomTextField 
                select 
                fullWidth 
                label='Profile' 
                {...field}
                disabled={!selectedRouterId}
              >
                  <MenuItem value="default">default</MenuItem>
                  {profiles.map(profile => (
                      <MenuItem key={profile['.id']} value={profile.name}>{profile.name}</MenuItem>
                  ))}
              </CustomTextField>
            )}
          />

          <Controller
            name='comment'
            control={control}
            render={({ field }) => (
              <CustomTextField fullWidth label='Comment' placeholder='e.g. VIP User' {...field} />
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

export default AddUserDrawer
