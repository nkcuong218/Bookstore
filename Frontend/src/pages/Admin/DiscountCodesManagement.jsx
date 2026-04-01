import {
  Box, Paper, Typography, Button, IconButton, Chip, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, FormControlLabel, Switch
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import discountCodeService from '../../apis/discountCodeService'
import { formatPrice } from '../../utils/formatPrice'

const defaultForm = {
  code: '',
  expiresAt: '',
  description: '',
  category: 'PRODUCT',
  type: 'FIXED',
  value: '',
  minOrder: 0,
  maxDiscount: '',
  active: true
}

const DiscountCodesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    loadCodes()
  }, [])

  const loadCodes = async () => {
    setLoading(true)
    try {
      const data = await discountCodeService.getAllCodesAdmin()
      setCodes(Array.isArray(data) ? data : [])
    } catch {
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCodes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return codes

    return codes.filter((item) =>
      String(item.code || '').toLowerCase().includes(keyword)
      || String(item.expiresAt || '').toLowerCase().includes(keyword)
      || String(item.description || '').toLowerCase().includes(keyword)
    )
  }, [codes, searchTerm])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingId(item.id)
    setForm({
      code: item.code || '',
      expiresAt: item.expiresAt ? String(item.expiresAt).slice(0, 16) : '',
      description: item.description || '',
      category: item.category || 'PRODUCT',
      type: item.type || 'FIXED',
      value: item.value ?? '',
      minOrder: item.minOrder ?? 0,
      maxDiscount: item.maxDiscount ?? '',
      active: item.active !== false
    })
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (item) => {
    try {
      await discountCodeService.toggleCodeAdmin(item.id)
      await loadCodes()
    } catch (error) {
      alert(error.message || 'Không thể đổi trạng thái mã giảm giá')
    }
  }

  const handleSave = async () => {
    if (!form.code.trim() || !form.expiresAt || form.value === '') {
      alert('Vui lòng nhập mã, thời hạn và giá trị giảm')
      return
    }

    const normalizedExpiresAt = form.expiresAt.length === 16
      ? `${form.expiresAt}:00`
      : form.expiresAt

    const payload = {
      code: form.code.trim().toUpperCase(),
      expiresAt: normalizedExpiresAt,
      description: form.description.trim(),
      category: form.category,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder || 0),
      maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
      active: Boolean(form.active)
    }

    try {
      if (editingId) {
        await discountCodeService.updateCodeAdmin(editingId, payload)
      } else {
        await discountCodeService.createCodeAdmin(payload)
      }

      setIsDialogOpen(false)
      setForm(defaultForm)
      setEditingId(null)
      await loadCodes()
    } catch (error) {
      alert(error.message || 'Không thể lưu mã giảm giá')
    }
  }

  const getTypeLabel = (type) => (type === 'PERCENT' ? 'Phần trăm' : 'Số tiền cố định')
  const getCategoryLabel = (category) => (category === 'SHIPPING' ? 'Vận chuyển' : 'Sản phẩm')

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Quản lý mã giảm giá
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tạo và quản lý mã giảm giá cho khách hàng
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Tạo mã mới
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Danh sách mã giảm giá
            <Chip label={filteredCodes.length} size="small" sx={{ ml: 1, fontWeight: 600 }} color="primary" />
          </Typography>

          <TextField
            placeholder="Tìm theo mã, thời hạn, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                {['Mã', 'Thời hạn', 'Loại', 'Kiểu giảm', 'Giá trị', 'Đơn tối thiểu', 'Đã dùng', 'Trạng thái', 'Thao tác'].map((col) => (
                  <th key={col} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.82rem', color: '#555', whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{item.code}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.expiresAt ? new Date(item.expiresAt).toLocaleString('vi-VN') : 'Không giới hạn'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{item.description || '-'}</Typography>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Chip size="small" label={getCategoryLabel(item.category)} color={item.category === 'SHIPPING' ? 'warning' : 'info'} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>{getTypeLabel(item.type)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {item.type === 'PERCENT' ? `${item.value}%` : formatPrice(item.value || 0)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>{formatPrice(item.minOrder || 0)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.usedCount || 0}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Chip
                      size="small"
                      label={item.active ? 'Đang bật' : 'Đang tắt'}
                      color={item.active ? 'success' : 'default'}
                      variant={item.active ? 'filled' : 'outlined'}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleToggleStatus(item)}>
                      <AutorenewIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredCodes.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                Không có mã giảm giá nào
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã giảm giá"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Thời hạn"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Danh mục"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="PRODUCT">Sản phẩm</MenuItem>
                <MenuItem value="SHIPPING">Vận chuyển</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Kiểu giảm"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="FIXED">Số tiền cố định</MenuItem>
                <MenuItem value="PERCENT">Phần trăm</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label={form.type === 'PERCENT' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Đơn tối thiểu (VNĐ)"
                value={form.minOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, minOrder: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Giảm tối đa (VNĐ)"
                value={form.maxDiscount}
                onChange={(e) => setForm((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                disabled={form.type !== 'PERCENT'}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(form.active)}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  />
                )}
                label="Bật mã giảm giá"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DiscountCodesManagement
