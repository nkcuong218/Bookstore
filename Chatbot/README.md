# Chatbot Service (Python RAG)

Python microservice cho chatbot RAG, chạy độc lập và được Backend Java gọi qua HTTP.

## 1) Setup

1. Tạo virtual env và cài package:

```powershell
cd Chatbot
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Tạo file `.env` từ `.env.example` và điền thông tin DB/OpenAI.

## 2) Run

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8008 --reload
```

## 3) API

- `GET /health`
- `POST /reindex`
- `POST /chat`

Ví dụ body `/chat`:

```json
{
  "userId": 1,
  "orderId": null,
  "message": "tư vấn sách spring boot"
}
```

## 4) Notes

- Nếu có `OPENAI_API_KEY`, service dùng embedding + chat completion.
- Nếu không có key, retrieval fallback lexical vẫn hoạt động.
