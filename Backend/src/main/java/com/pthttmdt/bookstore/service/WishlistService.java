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
                .filter(item -> item.getActive() == null || Boolean.TRUE.equals(item.getActive()))
                .map(WishlistDto.ItemResponse::fromEntity)
                .toList();
    }

    public WishlistDto.ItemResponse addToWishlist(Long userId, Long bookId) {
        return wishlistRepository.findByUserIdAndBookId(userId, bookId)
                .map(item -> {
                    if (!Boolean.TRUE.equals(item.getActive())) {
                        item.setActive(true);
                        item = wishlistRepository.save(item);
                    }
                    return WishlistDto.ItemResponse.fromEntity(item);
                })
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

                    Book book = bookRepository.findById(bookId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách!"));

                    WishlistItem item = WishlistItem.builder()
                            .user(user)
                            .book(book)
                            .active(true)
                            .build();

                    return WishlistDto.ItemResponse.fromEntity(wishlistRepository.save(item));
                });
    }

    public void removeFromWishlist(Long userId, Long bookId) {
        wishlistRepository.findByUserIdAndBookId(userId, bookId).ifPresent(item -> {
            item.setActive(false);
            wishlistRepository.save(item);
        });
    }

    public boolean isInWishlist(Long userId, Long bookId) {
        return wishlistRepository.findByUserIdAndBookId(userId, bookId)
                .map(item -> item.getActive() == null || Boolean.TRUE.equals(item.getActive()))
                .orElse(false);
    }

    public void clearWishlist(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        items.forEach(item -> item.setActive(false));
        wishlistRepository.saveAll(items);
    }
}
