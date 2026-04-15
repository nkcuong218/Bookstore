import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import CloseIcon from '@mui/icons-material/Close'
import chatService from '~/apis/chatService'

const BOT_WELCOME = {
  role: 'bot',
  text: 'Xin chào. Mình là trợ lý CSKH, bạn cần tư vấn sản phẩm, FAQ hay tra cứu đơn hàng?'
}

function formatPrice(price) {
  if (price === null || price === undefined) return 'Liên hệ'
  return `${Number(price).toLocaleString('vi-VN')} đ`
}

function ProductCards({ products = [] }) {
  if (!products.length) return null

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {products.map((item) => (
        <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
            <Typography fontWeight={700}>{item.name}</Typography>
            <Typography variant="body2" color="primary.main" fontWeight={700}>
              {formatPrice(item.price)}
            </Typography>
            {item.description && (
              <Typography variant="caption" color="text.secondary">
                {item.description.length > 120 ? `${item.description.slice(0, 120)}...` : item.description}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

function OrderList({ orders = [] }) {
  if (!orders.length) return null

  return (
    <Stack spacing={0.75} sx={{ mt: 1 }}>
      {orders.map((order) => (
        <Card key={`${order.orderCode}-${order.id}`} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
            <Typography variant="body2" fontWeight={700}>Mã đơn: {order.orderCode || `#${order.id}`}</Typography>
            <Typography variant="caption" color="text.secondary">Trạng thái: {order.status}</Typography>
            <Typography variant="caption" display="block" color="text.secondary">Tổng tiền: {formatPrice(order.totalAmount)}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

function RagSources({ sources = [] }) {
  if (!sources.length) return null

  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>
        Nguồn RAG:
      </Typography>
      {sources.slice(0, 3).map((source, idx) => (
        <Typography key={`${source.id}-${idx}`} variant="caption" sx={{ opacity: 0.85 }}>
          [{source.sourceType}] {source.title} ({Number(source.score || 0).toFixed(2)})
        </Typography>
      ))}
    </Stack>
  )
}

function ChatBubble({ item }) {
  const isUser = item.role === 'user'

  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: '85%',
          px: 1.25,
          py: 0.9,
          borderRadius: 2,
          bgcolor: isUser ? '#1a8349' : '#f1f3f5',
          color: isUser ? '#fff' : '#1f2937'
        }}
      >
        <Typography variant="body2">{item.text}</Typography>
        {!isUser && <ProductCards products={item.products} />}
        {!isUser && <OrderList orders={item.orders} />}
        {!isUser && <RagSources sources={item.ragSources} />}
      </Box>
    </Box>
  )
}

function ChatBox() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([BOT_WELCOME])

  const canSend = useMemo(() => !loading && input.trim().length > 0, [loading, input])

  const handleSend = async () => {
    if (!canSend) return

    const text = input.trim()
    const userMessage = { role: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatService.sendMessage({ message: text })
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: response?.reply || 'Mình chưa có dữ liệu để phản hồi ngay lúc này.',
          products: response?.products || [],
          orders: response?.orders || [],
          ragSources: response?.ragSources || []
        }
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: error?.message || 'Có lỗi xảy ra khi gọi chatbot. Bạn thử lại sau nhé.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          startIcon={<SmartToyIcon />}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            borderRadius: 10,
            textTransform: 'none',
            zIndex: 1300,
            px: 2
          }}
        >
          Chat hỗ trợ
        </Button>
      )}

      {open && (
        <Box
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: { xs: 'calc(100vw - 24px)', sm: 380 },
            height: 540,
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 3,
            boxShadow: '0 20px 45px rgba(17, 24, 39, 0.22)',
            zIndex: 1300,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              bgcolor: '#1a8349',
              color: '#fff'
            }}
          >
            <Typography fontWeight={700} fontSize={14}>Hỗ trợ khách hàng</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider />

          <Stack spacing={1} sx={{ flex: 1, p: 1.2, overflowY: 'auto', bgcolor: '#fafafa' }}>
            {messages.map((item, idx) => (
              <ChatBubble key={`${item.role}-${idx}`} item={item} />
            ))}
          </Stack>

          <Divider />

          <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button variant="contained" disabled={!canSend} onClick={handleSend}>
              {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Gửi'}
            </Button>
          </Box>
        </Box>
      )}
    </>
  )
}

export default ChatBox
