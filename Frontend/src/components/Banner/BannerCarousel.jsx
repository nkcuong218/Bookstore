import { useEffect, useState } from 'react'
import { Box, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import bannerService from '../../apis/bannerService'

const BannerCarousel = () => {
  const [banners, setBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  const fetchBanners = async () => {
    try {
      const data = await bannerService.getBanners()
      setBanners(Array.isArray(data) ? data : [])
    } catch {
      setBanners([])
    }
  }

  useEffect(() => {
    fetchBanners()

    const interval = setInterval(() => {
      fetchBanners()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    if (banners.length === 0) {
      setCurrentBannerIndex(0)
      return
    }

    setCurrentBannerIndex((prev) => (prev >= banners.length ? 0 : prev))
  }, [banners.length])

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  }

  if (banners.length === 0) return null

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${banners[currentBannerIndex]?.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out'
        }}
      />

      {banners.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevBanner}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={handleNextBanner}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}
          >
            {banners.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: index === currentBannerIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

export default BannerCarousel