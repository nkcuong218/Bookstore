export const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CREDIT_CARD: 'Thẻ tín dụng',
  E_WALLET: 'Ví điện tử'
}

const env = import.meta?.env ?? {}

export const BANK_TRANSFER_INFO = {
  bankName: env.VITE_BANK_TRANSFER_BANK_NAME || '',
  accountName: env.VITE_BANK_TRANSFER_ACCOUNT_NAME || '',
  accountNumber: env.VITE_BANK_TRANSFER_ACCOUNT_NUMBER || '',
  transferContentPrefix: env.VITE_BANK_TRANSFER_TRANSFER_PREFIX || 'DH'
}

export const hasBankTransferInfo = Boolean(
  BANK_TRANSFER_INFO.bankName && BANK_TRANSFER_INFO.accountName && BANK_TRANSFER_INFO.accountNumber
)

export const formatPaymentMethodLabel = (paymentMethod) => {
  if (!paymentMethod) return ''
  return PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod
}

export const isBankTransferPayment = (paymentMethod) => paymentMethod === 'BANK_TRANSFER'

export const getBankTransferContent = (orderCode) => {
  const suffix = orderCode ? ` ${orderCode}` : ''
  return `${BANK_TRANSFER_INFO.transferContentPrefix}${suffix}`.trim()
}