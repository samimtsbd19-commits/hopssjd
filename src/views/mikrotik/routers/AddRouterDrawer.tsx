'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, number, pipe, minLength, minValue, optional } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Divider from '@mui/material/Divider'

type Props = {
  open: boolean
  handleClose: () => void
  onSuccess: (data: any) => void
}

type FormData = {
  name: string
  host: string
  port: number
  user: string
  password?: string
  description?: string
}

const schema = object({
  name: pipe(string(), minLength(1, 'Name is required')),
  host: pipe(string(), minLength(1, 'Host IP/Domain is required')),
  port: number('Port must be a number'),
  user: pipe(string(), minLength(1, 'Username is required')),
  password: optional(string()),
  description: optional(string())
})

const AddRouterDrawer = ({ open, handleClose, onSuccess }: Props) => {
  // States
  const [isTesting, setIsTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Hooks
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      host: '',
      port: 8728, // Default API port
      user: 'admin',
      password: '',
      description: ''
    }
  })

  const handleReset = () => {
    handleClose()
    setTestStatus(null)
    reset()
  }

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      const response = await fetch('/api/mikrotik/routers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        onSuccess(result)
        handleReset()
      } else {
        const error = await response.json()
        setTestStatus({ success: false, message: error.message || 'Failed to save router' })
      }
    } catch (error) {
       setTestStatus({ success: false, message: 'Network error saving router' })
    }
  }

  const handleTestConnection = async () => {
    const data = watch()
    if (!data.host || !data.user) {
      setTestStatus({ success: false, message: 'Host and User are required to test connection' })
      return
    }

    setIsTesting(true)
    setTestStatus(null)
    try {
      const response = await fetch('/api/mikrotik/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: data.host,
          port: Number(data.port),
          user: data.user,
          password: data.password
        })
      })

      const result = await response.json()
      if (response.ok) {
        setTestStatus({ success: true, message: 'Connection Successful! ✅' })
      } else {
        setTestStatus({ success: false, message: `Failed: ${result.message}` })
      }
    } catch (error) {
      setTestStatus({ success: false, message: 'Network error testing connection' })
    } finally {
      setIsTesting(false)
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
        <Typography variant='h5'>Add New Router</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textPrimary text-xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Router Name'
                placeholder='Main Gateway'
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name='host'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Host / IP Address'
                placeholder='192.168.88.1'
                error={Boolean(errors.host)}
                helperText={errors.host?.message}
              />
            )}
          />

          <Controller
            name='port'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='API Port'
                placeholder='8728'
                error={Boolean(errors.port)}
                helperText={errors.port?.message}
                onChange={e => {
                  field.onChange(parseInt(e.target.value))
                }}
              />
            )}
          />

          <Controller
            name='user'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Username'
                placeholder='admin'
                error={Boolean(errors.user)}
                helperText={errors.user?.message}
              />
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
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
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
            name='description'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                rows={2}
                label='Description'
                placeholder='Router location, model, etc.'
              />
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

          <Divider className='my-2' />

          <Button
            variant='outlined'
            color={testStatus?.success ? 'success' : 'primary'}
            onClick={handleTestConnection}
            disabled={isTesting}
            startIcon={isTesting ? <i className='tabler-loader animate-spin' /> : <i className='tabler-plug-connected' />}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>

          {testStatus && (
            <Typography color={testStatus.success ? 'success.main' : 'error.main'} variant='body2' className='text-center'>
              {testStatus.message}
            </Typography>
          )}

        </form>
      </div>
    </Drawer>
  )
}

export default AddRouterDrawer
