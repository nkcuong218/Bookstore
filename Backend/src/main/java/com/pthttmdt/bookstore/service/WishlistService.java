package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.WishlistDto;
import com.pthttmdt.bookstore.entity.Book;
import com.pthttmdt.bookstore.entity.User;
import com.pthttmdt.bookstore.entity.WishlistItem;
import com.pthttmdt.bookstore.repository.BookRepository;
import com.pthttmdt.bookstore.repository.UserRepository;
import com.pthttmdt.bookstore.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public List<WishlistDto.ItemResponse> getMyWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(WishlistDto.ItemResponse::fromEntity)
                .toList();
    }

    public WishlistDto.ItemResponse addToWishlist(Long userId, Long bookId) {
        return wishlistRepository.findByUserIdAndBookId(userId, bookId)
                .map(WishlistDto.ItemResponse::fromEntity)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

                    Book book = bookRepository.findById(bookId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách!"));

                    WishlistItem item = WishlistItem.builder()
                            .user(user)
                            .book(book)
                            .build();

                    return WishlistDto.ItemResponse.fromEntity(wishlistRepository.save(item));
                });
    }

    public void removeFromWishlist(Long userId, Long bookId) {
        if (!wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new RuntimeException("Sách chưa có trong danh sách yêu thích!");
        }
        wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    public boolean isInWishlist(Long userId, Long bookId) {
        return wishlistRepository.existsByUserIdAndBookId(userId, bookId);
    }

    public void clearWishlist(Long userId) {
        wishlistRepository.deleteAllByUserId(userId);
    }
}
