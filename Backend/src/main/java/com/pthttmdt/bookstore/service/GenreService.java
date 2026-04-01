package com.pthttmdt.bookstore.service;

import com.pthttmdt.bookstore.dto.GenreDto;
import com.pthttmdt.bookstore.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    public List<GenreDto.Response> getActiveGenres() {
        return genreRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(GenreDto.Response::fromEntity)
                .toList();
    }
}