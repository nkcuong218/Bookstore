import {
  Box, Container, Typography, Paper, Button, TextField, IconButton, Divider,
  FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl, Tabs, Tab
} from '@mui/material'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import bannerService from '../../apis/bannerService'

const defaultHomeSections = [{ id: 1, title: 'Sách bán chạy', disablePagination: true, topX: 10, columns: 5, rows: 2, dataSource: 'bestseller' }]
const defaultPaginationConfig = { homeGenresPerPage: 10, booksPerPage: 12, booksRows: 3, booksColumns: 4 }

const InterfaceManagement = () => {
  const [tabValue, setTabValue] = useState(0)
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')
  const [homeSections, setHomeSections] = useState(defaultHomeSections)
  const [paginationConfig, setPaginationConfig] = useState(defaultPaginationConfig)

  useEffect(() => {
    const savedSections = localStorage.getItem('homeSectionsConfig')
    if (savedSections) {
      try {
        setHomeSections(JSON.parse(savedSections))
      } catch {
        setHomeSections(defaultHomeSections)
      }
    }

    fetchBanners()

    const savedPagination = localStorage.getItem('pagePaginationConfig')
    if (savedPagination) {
      try {
        const parsed = JSON.parse(savedPagination)
        const parsedColumns = Math.max(1, parseInt(parsed.booksColumns) || defaultPaginationConfig.booksColumns)
        const parsedRows = Math.max(1, parseInt(parsed.booksRows) || defaultPaginationConfig.booksRows)
        const parsedTotal = Math.max(1, parseInt(parsed.booksPerPage) || parsedRows * parsedColumns)
        setPaginationConfig({
          homeGenresPerPage: parsed.homeGenresPerPage || defaultPaginationConfig.homeGenresPerPage,
          booksColumns: parsedColumns,
          booksRows: parsedRows,
          booksPerPage: parsedTotal
        })
      } catch {
        setPaginationConfig(defaultPaginationConfig)
      }
    }
  }, [])

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const fetchBanners = async () => {
    setLoadingBanners(true)
    try {
      const data = await bannerService.getBanners()
      setBanners(Array.isArray(data) ? data : [])
    } catch {
      setBanners([])
    } finally {
      setLoadingBanners(false)
    }
  }

  const handleOpenAddBannerDialog = () => {
    setIsEditing(false)
    setCurrentBanner(null)
    setImageFile(null)
    setDisplayOrder(banners.length > 0 ? Math.max(...banners.map((b) => b.displayOrder)) + 1 : 1)
    setOpenDialog(true)
  }

  const handleOpenEditBannerDialog = (banner) => {
    setIsEditing(true)
    setCurrentBanner(banner)
    setImageFile(null)
    setDisplayOrder(banner.displayOrder)
    setOpenDialog(true)
  }

  const handleCloseBannerDialog = () => {
    setOpenDialog(false)
    setCurrentBanner(null)
    setImageFile(null)
    setDisplayOrder('')
  }

  const handleSaveBanner = async () => {
    if (!imageFile) {
      alert('Vui lòng chọn ảnh banner')
      return
    }

    if (!displayOrder) {
      alert('Vui lòng nhập thứ tự hiển thị')
      return
    }

    try {
      if (isEditing) {
        await bannerService.updateBanner(currentBanner.id, imageFile, parseInt(displayOrder))
      } else {
        await bannerService.createBanner(imageFile, parseInt(displayOrder))
      }
      await fetchBanners()
      handleCloseBannerDialog()
    } catch (error) {
      alert('Lỗi khi lưu banner: ' + (error.message || 'Unknown error'))
    }
  }

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa banner này?')) return

    try {
      await bannerService.deleteBanner(id)
      await fetchBanners()
    } catch (error) {
      alert('Lỗi khi xóa banner: ' + (error.message || 'Unknown error'))
    }
  }

  const handleChangeBannerOrder = async (banner, newOrder) => {
    if (newOrder < 1) return

    try {
      await bannerService.updateBanner(banner.id, banner.imageUrl, newOrder)
      await fetchBanners()
    } catch (error) {
      alert('Lỗi khi thay đổi thứ tự banner: ' + (error.message || 'Unknown error'))
    }
  }

  const handleSaveHomepage = () => {
    localStorage.setItem('homeSectionsConfig', JSON.stringify(homeSections))
    localStorage.setItem('pagePaginationConfig', JSON.stringify(paginationConfig))
    alert('Đã lưu cấu hình homepage!')
  }

  const handleSaveBooks = () => {
    const rows = Math.max(1, parseInt(paginationConfig.booksRows) || defaultPaginationConfig.booksRows)
    const columns = Math.max(1, parseInt(paginationConfig.booksColumns) || defaultPaginationConfig.booksColumns)
    const total = Math.max(1, parseInt(paginationConfig.booksPerPage) || defaultPaginationConfig.booksPerPage)

    const nextConfig = {
      ...paginationConfig,
      booksRows: rows,
      booksColumns: columns,
      booksPerPage: total
    }
    setPaginationConfig(nextConfig)
    localStorage.setItem('pagePaginationConfig', JSON.stringify(nextConfig))
    alert('Đã lưu cấu hình phân trang cho trang sách!')
  }

  const handleAddSection = () => {
    const newId = homeSections.length > 0 ? Math.max(...homeSections.map((s) => s.id)) + 1 : 1
    const newSection = { id: newId, title: 'Chuyên mục mới', disablePagination: false, topX: 20, columns: 5, rows: 2, dataSource: 'featured' }
    setHomeSections([...homeSections, newSection])
  }

  const handleRemoveSection = (id) => {
    setHomeSections(homeSections.filter((s) => s.id !== id))
  }

  const handleUpdateSection = (id, field, value) => {
    setHomeSections(homeSections.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleMoveSection = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= homeSections.length) return

    const nextSections = [...homeSections]
    ;[nextSections[index], nextSections[targetIndex]] = [nextSections[targetIndex], nextSections[index]]
    setHomeSections(nextSections)
  }

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            Quản lý giao diện
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chỉnh homepage và phân trang danh sách sách trong một nơi.
          </Typography>
        </Box>

        <Paper sx={{ p: 2, mb: 4 }}>
          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
            <Tab label="Homepage" />
            <Tab label="Sách" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <>
            <Paper sx={{ p: 4, bgcolor: '#fdfdfd', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Banner Homepage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý banner hiển thị ở đầu trang chủ.
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddBannerDialog}>
                  Thêm Banner
                </Button>
              </Box>

              {loadingBanners ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
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
                                sx={{ width: 150, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
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
                              <IconButton size="small" color="primary" onClick={() => handleChangeBannerOrder(banner, banner.displayOrder - 1)} disabled={banner.displayOrder === 1} title="Tăng ưu tiên (giảm thứ tự)">
                                <KeyboardArrowUpIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="primary" onClick={() => handleChangeBannerOrder(banner, banner.displayOrder + 1)} disabled={banner.displayOrder === banners.length} title="Giảm ưu tiên (tăng thứ tự)">
                                <KeyboardArrowDownIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditBannerDialog(banner)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteBanner(banner.id)}>
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
            </Paper>

            <Paper sx={{ p: 4, bgcolor: '#fdfdfd' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Homepage
              </Typography>
              <Button variant="contained" color="secondary" onClick={handleAddSection}>
                Thêm chuyên mục
              </Button>
            </Box>

            {homeSections.map((section, index) => (
              <Box key={section.id} sx={{ mb: 4, p: 3, border: '1px solid #eee', borderRadius: 2, bgcolor: 'white', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
                  <IconButton color="primary" size="small" title="Đưa chuyên mục lên trên" disabled={index === 0} onClick={() => handleMoveSection(index, 'up')}>
                    <KeyboardArrowUpIcon />
                  </IconButton>
                  <IconButton color="primary" size="small" title="Đưa chuyên mục xuống dưới" disabled={index === homeSections.length - 1} onClick={() => handleMoveSection(index, 'down')}>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </Box>
                <IconButton color="error" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => handleRemoveSection(section.id)}>
                  <DeleteIcon />
                </IconButton>

                <Typography variant="h6" sx={{ mb: 2, mt: 0, fontWeight: 'bold', color: '#555', textAlign: 'center' }}>
                  Chuyên mục {index + 1}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                  <Box>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Nguồn dữ liệu</InputLabel>
                      <Select
                        value={section.dataSource || 'bestseller'}
                        label="Nguồn dữ liệu"
                        onChange={(e) => handleUpdateSection(section.id, 'dataSource', e.target.value)}
                      >
                        <MenuItem value="bestseller">Sách bán chạy nhất</MenuItem>
                        <MenuItem value="newest">Sách mới nhất</MenuItem>
                        <MenuItem value="promotion">Sách khuyến mại</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Tiêu đề hiển thị"
                      value={section.title}
                      onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                      sx={{ mb: 3 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={section.disablePagination} onChange={(e) => handleUpdateSection(section.id, 'disablePagination', e.target.checked)} />}
                      label="Tắt phân trang trượt (Hiển thị dạng lưới tĩnh)"
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tổng số sách lấy ra (Top X)"
                      value={section.topX}
                      onChange={(e) => handleUpdateSection(section.id, 'topX', parseInt(e.target.value) || 0)}
                      sx={{ mb: 3 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số cột"
                        value={section.columns}
                        onChange={(e) => handleUpdateSection(section.id, 'columns', parseInt(e.target.value) || 1)}
                      />
                      {section.disablePagination && (
                        <TextField
                          fullWidth
                          type="number"
                          label="Số hàng"
                          value={section.rows || 1}
                          onChange={(e) => handleUpdateSection(section.id, 'rows', parseInt(e.target.value) || 1)}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button variant="contained" color="primary" size="large" onClick={handleSaveHomepage}>
                Lưu cấu hình homepage
              </Button>
            </Box>
          </Paper>
          </>
        )}

        {tabValue === 1 && (
          <Paper sx={{ p: 4, bgcolor: '#fdfdfd' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Sách
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <TextField
                type="number"
                label="Số dòng"
                value={paginationConfig.booksRows}
                onChange={(e) => setPaginationConfig((prev) => ({ ...prev, booksRows: e.target.value }))}
                inputProps={{ min: 1 }}
                helperText="Số dòng hiển thị ở 1 trang"
              />
              <TextField
                type="number"
                label="Số cột"
                value={paginationConfig.booksColumns}
                onChange={(e) => setPaginationConfig((prev) => ({ ...prev, booksColumns: e.target.value }))}
                inputProps={{ min: 1 }}
                helperText="Số cột hiển thị ở 1 trang"
              />
              <TextField
                type="number"
                label="Tổng số sách hiển thị"
                value={paginationConfig.booksPerPage}
                onChange={(e) => setPaginationConfig((prev) => ({ ...prev, booksPerPage: e.target.value }))}
                inputProps={{ min: 1 }}
                helperText="Có thể nhập số lẻ theo nhu cầu hiển thị"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button variant="contained" color="primary" size="large" onClick={handleSaveBooks}>
                Lưu cấu hình trang sách
              </Button>
            </Box>
          </Paper>
        )}

        <Dialog open={openDialog} onClose={handleCloseBannerDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {isEditing ? 'Sửa Banner' : 'Thêm Banner'}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
              Chọn ảnh banner
              <input hidden type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
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
                  sx={{ maxWidth: '100%', height: 200, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseBannerDialog}>Hủy</Button>
            <Button variant="contained" onClick={handleSaveBanner} disabled={!imageFile || !displayOrder}>
              {isEditing ? 'Cập nhật' : 'Tạo'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default InterfaceManagement