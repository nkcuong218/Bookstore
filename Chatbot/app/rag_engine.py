from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set
import math
import re
import unicodedata
import requests

from .config import settings
from .db_loader import fetch_books


@dataclass
class RagDoc:
    id: int
    source_type: str
    title: str
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None


class RagEngine:
    def __init__(self):
        self.docs: List[RagDoc] = []

    def _api_base_url(self) -> str:
        base_url = (settings.openai_base_url or "").strip().rstrip("/")
        if not base_url:
            return "https://api.openai.com/v1"

        if settings.openai_api_key.startswith("sk-or-v1") and base_url == "https://api.openai.com/v1":
            return "https://openrouter.ai/api/v1"

        return base_url

    def _api_headers(self) -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        }

        base_url = self._api_base_url()
        if "openrouter.ai" in base_url:
            if settings.openrouter_referer.strip():
                headers["HTTP-Referer"] = settings.openrouter_referer.strip()
            if settings.openrouter_title.strip():
                headers["X-Title"] = settings.openrouter_title.strip()

        return headers

    def reindex(self) -> int:
        docs: List[RagDoc] = []

        for row in fetch_books():
            content = (
                f"Tieu de: {row.get('title') or ''}\n"
                f"Tac gia: {row.get('author') or ''}\n"
                f"Gia: {row.get('price') or ''} VND\n"
                f"Ton kho: {row.get('stock') or 0}\n"
                f"Mo ta: {row.get('description') or ''}"
            )
            docs.append(
                RagDoc(
                    id=int(row["id"]),
                    source_type="BOOK",
                    title=f"Sach: {row.get('title') or ''}",
                    content=content,
                    metadata={
                        "book_id": int(row["id"]),
                        "name": row.get("title") or "",
                        "price": row.get("price"),
                        "description": row.get("description") or "",
                        "image_url": row.get("cover_url"),
                    },
                )
            )

        docs.extend(
            [
                RagDoc(
                    id=1000001,
                    source_type="FAQ",
                    title="FAQ: Phi van chuyen",
                    content="Phi van chuyen duoc tinh theo dia chi nhan hang va hien thi tai buoc checkout.",
                    metadata={"key": "shipping"},
                ),
                RagDoc(
                    id=1000002,
                    source_type="FAQ",
                    title="FAQ: Chinh sach doi tra",
                    content="Khach hang co the doi tra trong 7 ngay neu san pham con nguyen trang.",
                    metadata={"key": "return"},
                ),
                RagDoc(
                    id=1000003,
                    source_type="FAQ",
                    title="FAQ: Phuong thuc thanh toan",
                    content="He thong ho tro COD va chuyen khoan ngan hang.",
                    metadata={"key": "payment"},
                ),
            ]
        )

        if settings.openai_api_key:
            for doc in docs:
                doc.embedding = self._create_embedding(doc.content)

        self.docs = docs
        return len(self.docs)

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.docs:
            self.reindex()
        if not query.strip():
            return []

        query_embedding = self._create_embedding(query) if settings.openai_api_key else None
        results: List[Dict[str, Any]] = []

        if query_embedding:
            for doc in self.docs:
                if not doc.embedding:
                    continue
                score = self._cosine(query_embedding, doc.embedding)
                results.append({"doc": doc, "score": score})
        else:
            q_tokens = self._tokenize(query)
            for doc in self.docs:
                d_tokens = self._tokenize(doc.title + " " + doc.content)
                score = self._lexical_score(q_tokens, d_tokens)
                results.append({"doc": doc, "score": score})

        results = [r for r in results if r["score"] > 0]
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[: max(1, top_k)]

    def answer_with_context(self, query: str, contexts: List[Dict[str, Any]]) -> Optional[str]:
        if not settings.openai_api_key:
            return None

        if not contexts:
            return None

        if contexts[0]["score"] < 0.12:
            return None

        context_text = "\n\n".join(
            [
                f"[{idx + 1}] {c['doc'].source_type} | {c['doc'].title} | score={c['score']:.4f}\n{c['doc'].content}"
                for idx, c in enumerate(contexts)
            ]
        )

        system_prompt = (
            "Ban la tro ly cham soc khach hang cho website ban sach. "
            "Chi tra loi dua tren context truy xuat duoc. "
            "Khong duoc doan, khong duoc tu suy luan thong tin ngoai context. "
            "Neu context khong du thong tin, tra loi mot cau ngan: 'Mình chưa đủ dữ liệu để trả lời chính xác.'"
        )
        user_prompt = (
            f"Cau hoi: {query}\n\n"
            f"Context co thu tu do phu hop giam dan:\n{context_text}\n\n"
            "Chi tra ve cau tra loi trong tieng Viet, ngan gon, va chi neu co du thong tin trong context."
        )

        payload = {
            "model": settings.openai_chat_model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        try:
            res = requests.post(f"{self._api_base_url()}/chat/completions", json=payload, headers=self._api_headers(), timeout=30)
            if not res.ok:
                return None
            body = res.json()
            choices = body.get("choices") or []
            if not choices:
                return None
            return ((choices[0].get("message") or {}).get("content") or "").strip() or None
        except Exception:
            return None

    def _create_embedding(self, text: str) -> Optional[List[float]]:
        payload = {
            "model": settings.openai_embedding_model,
            "input": text,
        }
        try:
            res = requests.post(f"{self._api_base_url()}/embeddings", json=payload, headers=self._api_headers(), timeout=30)
            if not res.ok:
                return None
            body = res.json()
            data = body.get("data") or []
            if not data:
                return None
            emb = data[0].get("embedding")
            return [float(x) for x in emb] if isinstance(emb, list) else None
        except Exception:
            return None

    def _cosine(self, a: List[float], b: List[float]) -> float:
        n = min(len(a), len(b))
        if n == 0:
            return 0.0
        dot = 0.0
        norm_a = 0.0
        norm_b = 0.0
        for i in range(n):
            dot += a[i] * b[i]
            norm_a += a[i] * a[i]
            norm_b += b[i] * b[i]
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (math.sqrt(norm_a) * math.sqrt(norm_b))

    def _tokenize(self, text: str) -> Set[str]:
        normalized = self._normalize_text(text)
        return {tok for tok in normalized.split() if len(tok) > 1}

    def _lexical_score(self, q: Set[str], d: Set[str]) -> float:
        if not q or not d:
            return 0.0
        overlap = sum(1 for t in q if t in d)
        return overlap / float(len(q))

    def _normalize_text(self, text: str) -> str:
        normalized = unicodedata.normalize("NFD", text.lower())
        normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
        normalized = re.sub(r"[^a-z0-9\s]", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized


rag_engine = RagEngine()
