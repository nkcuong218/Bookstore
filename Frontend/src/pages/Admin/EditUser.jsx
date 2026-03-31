import { Box, Paper, Typography, TextField, Button, Grid, Breadcrumbs, Link, MenuItem, Divider, Avatar } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import { formatPrice } from '../../utils/formatPrice'
import userService from '../../apis/userService'

const EditUser = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer',
    status: 'Active'
  })

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      try {
        const found = await userService.getUserById(id)
        setUser(found)
        setFormData({
          name: found.fullName || '',
          email: found.email || '',
          role: found.role === 'admin' ? 'Admin' : 'Customer',
          status: found.status === 'active' ? 'Active' : 'Blocked'
        })
      } catch {
        alert('User not found.')
        navigate('/admin/users')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id, navigate])

  const getAvatarColor = (name) => {
    if (!name) return '#bdbdbd'
    const colors = ['#3e5d58', '#e57373', '#7986cb', '#4db6ac', '#ff8a65', '#a1887f']
    return colors[name.charCodeAt(0) % colors.length]
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) return

    try {
      const roleChanged = (formData.role === 'Admin' ? 'admin' : 'customer') !== user.role
      const statusChanged = (formData.status === 'Active' ? 'active' : 'blocked') !== user.status

      if (roleChanged) {
        await userService.changeUserRole(user.id, formData.role === 'Admin' ? 'ADMIN' : 'CUSTOMER')
      }

      if (statusChanged) {
        await userService.toggleUserStatus(user.id)
      }

      alert('User updated successfully.')
      navigate('/admin/users')
    } catch (error) {
      alert(error.message || 'Failed to update user.')
    }
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    )
  }

  if (!user) return null

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/admin/users')} sx={{ cursor: 'pointer' }}>
          User management
        </Link>
        <Typography color="text.primary">Edit #{user.id}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')} variant="outlined">
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Edit user
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Account information
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full name"
                    value={formData.name}
                    disabled
                    helperText="Backend does not support admin update for full name yet."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    helperText="Backend does not support admin update for email yet."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 2 }}>
                    Role and status
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                  >
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Blocked">Blocked</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                <Button variant="outlined" size="large" onClick={() => navigate('/admin/users')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} sx={{ minWidth: 160 }}>
                  Save changes
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Preview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: getAvatarColor(formData.name), fontSize: '1.8rem', fontWeight: 700, mb: 2 }}>
                {getInitials(formData.name)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {formData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.email}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Account stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'User id', value: `#${user.id}` },
                { label: 'Orders', value: '0' },
                { label: 'Total spent', value: formatPrice(0) },
                { label: 'Join date', value: user.joinDate }
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EditUser
