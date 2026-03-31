import { Box, Paper, Typography, TextField, Button, Grid, Breadcrumbs, Link, MenuItem, Divider, Avatar } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import apiClient from '../../apis/apiClient'
import userService from '../../apis/userService'

const AddUser = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    status: 'Active'
  })

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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Please enter name, email, and password.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Invalid email format.')
      return
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }

    try {
      const created = await apiClient.post(
        '/api/auth/register',
        {
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
          phone: ''
        },
        { skipAuth: true }
      )

      const createdId = created?.id
      if (!createdId) {
        throw new Error('Cannot get created user id.')
      }

      if (formData.role === 'Admin') {
        await userService.changeUserRole(createdId, 'ADMIN')
      }

      if (formData.status === 'Blocked') {
        await userService.toggleUserStatus(createdId)
      }

      alert('User created successfully.')
      navigate('/admin/users')
    } catch (error) {
      alert(error.message || 'Failed to create user.')
    }
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/admin/users')} sx={{ cursor: 'pointer' }}>
          User management
        </Link>
        <Typography color="text.primary">Add user</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')} variant="outlined">
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Add new user
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
                    label="Full name *"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Temporary password *"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
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
                  Create user
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Preview
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: getAvatarColor(formData.name), fontSize: '1.8rem', fontWeight: 700, mb: 2 }}>
                {getInitials(formData.name)}
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {formData.name || 'User name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.email || 'email@example.com'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              User is created via auth register API, then role and status are synced via admin APIs.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AddUser
