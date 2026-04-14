import {
  Box, Container, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress,
  FormControlLabel, Switch, Divider, Select, MenuItem, InputLabel, FormControl
} from '@mui/material'
import { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import bannerService from '../../apis/bannerService'

const BannersManagement = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')

  // Settings state
  const [homeConfig, setHomeConfig] = useState({
    disablePagination: true,
    topX: 10,
    columns: 5,
    rows: 2
  })

  useEffect(() => {
    const savedConfig = localStorage.getItem('homePageConfig')
    if (savedConfig) {
      try {
        setHomeConfig(JSON.parse(savedConfig))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleSaveConfig = () => {
    localStorage.setItem('homePageConfig', JSON.stringify(homeConfig))
    alert('Đã lưu cấu hình giao diện!')
  }

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const data = await bannerService.getBanners()
      setBanners(Array.isArray(data) ? data : [])
    } catch (error) {
      alert('Lỗi khi tải danh sách banner: ' + (error.message || 'Unknown error'))
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddDialog = () => {
    setIsEditing(false)
    setCurrentBanner(null)
    setImageFile(null)
    setDisplayOrder(banners.length > 0 ? Math.max(...banners.map(b => b.displayOrder)) + 1 : 1)
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (banner) => {
    setIsEditing(true)
    setCurrentBanner(banner)
    setImageFile(null)
    setDisplayOrder(banner.displayOrder)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentBanner(null)
    setImageFile(null)
    setDisplayOrder('')
  }

  const handleSave = async () => {
    if (!imageFile) {
      alert('Vui lòng chọn ảnh banner')
      return
    }
    if (!displayOrder) {
      alert('Vui lòng nhập Display Order')
      return
    }

    try {
      if (isEditing) {
        await bannerService.updateBanner(currentBanner.id, imageFile, parseInt(displayOrder))
        alert('Cập nhật banner thành công!')
      } else {
        await bannerService.createBanner(imageFile, parseInt(displayOrder))
        alert('Tạo banner mới thành công!')
      }
      fetchBanners()
      handleCloseDialog()
    } catch (error) {
      alert('Lỗi: ' + (error.message || 'Unknown error'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa banner này?')) return

    try {
      await bannerService.deleteBanner(id)
      alert('Xóa banner thành công!')
      fetchBanners()
    } catch (error) {
      alert('Lỗi khi xóa banner: ' + (error.message || 'Unknown error'))
    }
  }

  const handleChangeOrder = async (banner, newOrder) => {
    if (newOrder < 1) return

    try {
      await bannerService.updateBanner(banner.id, banner.imageUrl, newOrder)
      fetchBanners()
    } catch (error) {
      alert('Lỗi khi thay đổi thứ tự: ' + (error.message || 'Unknown error'))
    }
  }

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Quản lý giao diện
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Thêm Banner
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ảnh Preview</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Image URL</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thứ tự</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      Chưa có banner nào
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell>{banner.id}</TableCell>
                      <TableCell>
                        <Box
                          component="img"
                          src={banner.imageUrl}
                          alt="Banner preview"
                          sx={{
                            width: 150,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #ddd'
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%2280%22%3E%3Crect width=%22150%22 height=%2280%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {banner.imageUrl}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {banner.displayOrder}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleChangeOrder(banner, banner.displayOrder - 1)}
                          disabled={banner.displayOrder === 1}
                          title="Tăng ưu tiên (giảm thứ tự)"
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleChangeOrder(banner, banner.displayOrder + 1)}
                          disabled={banner.displayOrder === banners.length}
                          title="Giảm ưu tiên (tăng thứ tự)"
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(banner)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Divider sx={{ my: 6 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            Cấu hình danh sách Sách Bán Chạy (Trang chủ)
          </Typography>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Kiểu hiển thị</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={homeConfig.disablePagination}
                      onChange={(e) => setHomeConfig({ ...homeConfig, disablePagination: e.target.checked })}
                    />
                  }
                  label="Tắt phân trang (Hiển thị dạng lưới tĩnh)"
                />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Tham số hiển thị</Typography>
                <TextField 
                  fullWidth 
                  type="number"
                  label="Hiển thị Top X (VD: 10, 20)" 
                  value={homeConfig.topX}
                  onChange={(e) => setHomeConfig({ ...homeConfig, topX: parseInt(e.target.value) || 0 })}
                  sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField 
                    fullWidth 
                    type="number"
                    label="Số cột" 
                    value={homeConfig.columns}
                    onChange={(e) => setHomeConfig({ ...homeConfig, columns: parseInt(e.target.value) || 1 })}
                  />
                  <TextField 
                    fullWidth 
                    type="number"
                    label="Số hàng" 
                    value={homeConfig.rows}
                    onChange={(e) => setHomeConfig({ ...homeConfig, rows: parseInt(e.target.value) || 1 })}
                  />
                </Box>
                <Button variant="contained" color="primary" onClick={handleSaveConfig}>
                  Lưu cấu hình
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Dialog Add/Edit Banner */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEditing ? 'Sửa Banner' : 'Thêm Banner'}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Chọn ảnh banner
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </Button>

          {imageFile && (
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Đã chọn file: {imageFile.name}
            </Typography>
          )}
          <TextField
            fullWidth
            type="number"
            label="Thứ tự hiển thị"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            margin="normal"
            inputProps={{ min: 1 }}
            helperText="Thứ tự thấp hơn sẽ được hiển thị trước"
          />

          {previewUrl && (
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Xem trước:
              </Typography>
              <Box
                component="img"
                src={previewUrl}
                alt="Banner preview"
                sx={{
                  maxWidth: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect width=%22400%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!imageFile || !displayOrder}
          >
            {isEditing ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BannersManagement
