from pydantic import BaseModel
from typing import List, Optional


class ChatRequest(BaseModel):
    userId: Optional[int] = None
    orderId: Optional[int] = None
    message: str


class ProductCard(BaseModel):
    id: int
    name: str
    price: Optional[int] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None


class OrderSummary(BaseModel):
    id: int
    orderCode: Optional[str] = None
    status: Optional[str] = None
    totalAmount: Optional[int] = None
    createdAt: Optional[str] = None


class RagSource(BaseModel):
    id: int
    sourceType: str
    title: str
    score: float


class ChatResponse(BaseModel):
    intent: str
    reply: str
    usedAi: bool
    products: List[ProductCard] = []
    orders: List[OrderSummary] = []
    ragSources: List[RagSource] = []
