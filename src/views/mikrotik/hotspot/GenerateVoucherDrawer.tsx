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
  onSuccess: (count: number) => void
}

type FormData = {
  routerId: string
  profile: string
  qty: number
  length: number
  prefix?: string
  price?: number
}

const GenerateVoucherDrawer = ({ open, handleClose, onSuccess }: Props) => {
  const [routers, setRouters] = useState<Router[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      routerId: '',
      profile: '',
      qty: 10,
      length: 6,
      prefix: '',
      price: 0
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
    setIsGenerating(false)
  }

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/mikrotik/hotspot/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await res.json()

      if (res.ok) {
        onSuccess(result.count)
        handleReset()
      } else {
        alert(`Failed to generate: ${result.message}`)
      }
    } catch (error) {
      console.error('Error creating vouchers', error)
      alert('Network error')
    } finally {
        setIsGenerating(false)
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
        <Typography variant='h5'>Generate Vouchers (Batch)</Typography>
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
            name='profile'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField 
                select 
                fullWidth 
                label='Profile' 
                {...field}
                disabled={!selectedRouterId}
              >
                  {profiles.map(profile => (
                      <MenuItem key={profile['.id']} value={profile.name}>{profile.name}</MenuItem>
                  ))}
              </CustomTextField>
            )}
          />

          <div className='flex gap-4'>
            <Controller
                name='qty'
                control={control}
                rules={{ required: true, min: 1 }}
                render={({ field }) => (
                <CustomTextField 
                    fullWidth 
                    label='Quantity' 
                    type='number' 
                    placeholder='10' 
                    {...field} 
                    onChange={e=>field.onChange(Number(e.target.value))}
                />
                )}
            />
            
            <Controller
                name='length'
                control={control}
                rules={{ required: true, min: 4, max: 20 }}
                render={({ field }) => (
                <CustomTextField 
                    fullWidth 
                    label='Code Length' 
                    type='number' 
                    placeholder='6' 
                    {...field} 
                    onChange={e=>field.onChange(Number(e.target.value))}
                />
                )}
            />
          </div>

          <Controller
            name='prefix'
            control={control}
            render={({ field }) => (
              <CustomTextField fullWidth label='Prefix (Optional)' placeholder='WIFI-' {...field} />
            )}
          />

          <Controller
            name='price'
            control={control}
            render={({ field }) => (
              <CustomTextField 
                fullWidth 
                label='Price' 
                type='number' 
                placeholder='0.00' 
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                {...field} 
                onChange={e=>field.onChange(Number(e.target.value))}
              />
            )}
          />

          <div className='flex items-center gap-4 mt-4'>
            <Button 
                variant='contained' 
                type='submit' 
                disabled={isGenerating}
                startIcon={isGenerating ? <i className='tabler-loader animate-spin' /> : <i className='tabler-wand' />}
            >
              {isGenerating ? 'Generating...' : 'Generate Batch'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleReset} disabled={isGenerating}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default GenerateVoucherDrawer
