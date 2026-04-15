package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.ChatDto;
import com.pthttmdt.bookstore.service.ChatbotService;
import com.pthttmdt.bookstore.service.PythonChatbotClient;
import com.pthttmdt.bookstore.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatbotService chatbotService;
    private final RagService ragService;
    private final PythonChatbotClient pythonChatbotClient;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatDto.Request request) {
        try {
            return ResponseEntity.ok(chatbotService.chat(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/rag/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reindexRagKnowledgeBase() {
        Integer pythonTotal = pythonChatbotClient.reindex();
        int total = ragService.rebuildKnowledgeBase();
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Reindex RAG thành công",
            "totalDocuments", total,
            "pythonTotalDocuments", pythonTotal == null ? -1 : pythonTotal
        ));
    }
}
