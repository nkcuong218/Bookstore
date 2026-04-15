from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException

from .db_loader import fetch_orders
from .models import ChatRequest, ChatResponse, OrderSummary, ProductCard, RagSource
from .rag_engine import rag_engine

app = FastAPI(title="Bookstore Python RAG Chatbot", version="1.0.0")


@app.on_event("startup")
def startup_event():
    rag_engine.reindex()


@app.get("/health")
def health():
    return {"status": "ok", "documents": len(rag_engine.docs)}


@app.post("/reindex")
def reindex():
    total = rag_engine.reindex()
    return {"message": "Reindex success", "totalDocuments": total}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    user_message = (req.message or "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message không được để trống")

    intent = detect_intent(user_message, req.orderId)

    contexts = rag_engine.retrieve(user_message, top_k=5)
    rag_sources = [
        RagSource(id=c["doc"].id, sourceType=c["doc"].source_type, title=c["doc"].title, score=round(c["score"], 6))
        for c in contexts
    ]

    products: List[ProductCard] = []
    orders: List[OrderSummary] = []

    if intent == "ORDER":
        order_id_in_text = extract_order_id(user_message)
        order_code = extract_order_code(user_message)
        rows = fetch_orders(
            req.orderId or order_id_in_text,
            order_code,
            req.userId,
        )

        for row in rows:
            created_at = row.get("created_at")
            orders.append(
                OrderSummary(
                    id=int(row["id"]),
                    orderCode=row.get("order_code"),
                    status=row.get("status"),
                    totalAmount=row.get("total_amount"),
                    createdAt=created_at.isoformat() if created_at is not None else None,
                )
            )

        if not orders:
            reply = "Mình chưa tìm thấy đơn hàng. Bạn vui lòng cung cấp orderId, mã đơn hoặc userId nhé."
            return ChatResponse(intent=intent, reply=reply, usedAi=False, products=products, orders=orders, ragSources=rag_sources)

        reply = "Mình đã tìm thấy thông tin đơn hàng của bạn."
        return ChatResponse(intent=intent, reply=reply, usedAi=False, products=products, orders=orders, ragSources=rag_sources)

    if intent == "PRODUCT":
        for c in contexts:
            doc = c["doc"]
            if doc.source_type != "BOOK":
                continue
            products.append(
                ProductCard(
                    id=int(doc.metadata.get("book_id") or doc.id),
                    name=str(doc.metadata.get("name") or doc.title),
                    price=doc.metadata.get("price"),
                    description=doc.metadata.get("description"),
                    imageUrl=doc.metadata.get("image_url"),
                )
            )
            if len(products) >= 5:
                break

    ai_reply = rag_engine.answer_with_context(user_message, contexts)
    if ai_reply:
        return ChatResponse(intent=intent, reply=ai_reply, usedAi=True, products=products, orders=orders, ragSources=rag_sources)

    if intent == "PRODUCT" and products:
        return ChatResponse(
            intent=intent,
            reply="Mình tìm thấy một số sản phẩm liên quan, bạn xem danh sách bên dưới nhé.",
            usedAi=False,
            products=products,
            orders=orders,
            ragSources=rag_sources,
        )

    fallback = "Mình chưa đủ dữ liệu để trả lời chính xác. Bạn mô tả chi tiết hơn giúp mình nhé."
    return ChatResponse(intent=intent, reply=fallback, usedAi=False, products=products, orders=orders, ragSources=rag_sources)


def detect_intent(message: str, order_id: Optional[int]) -> str:
    text = normalize(message)

    if order_id is not None or has_any(text, ["don", "order", "ma don", "giao hang", "trang thai"]):
        return "ORDER"

    if has_any(text, ["san pham", "sach", "gia", "tu van", "goi y", "book"]):
        return "PRODUCT"

    if has_any(text, ["ship", "phi ship", "doi tra", "hoan tien", "thanh toan", "faq"]):
        return "FAQ"

    return "AI_FALLBACK"


def normalize(text: str) -> str:
    import unicodedata

    normalized = unicodedata.normalize("NFD", text.lower())
    normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", normalized).strip()


def has_any(text: str, keywords: List[str]) -> bool:
    return any(k in text for k in keywords)


def extract_order_id(message: str) -> Optional[int]:
    m = re.search(r"\b(\d{1,10})\b", message)
    if not m:
        return None
    try:
        return int(m.group(1))
    except Exception:
        return None


def extract_order_code(message: str) -> Optional[str]:
    m = re.search(r"\bORD\d+\b", message, flags=re.IGNORECASE)
    return m.group(0).upper() if m else None
