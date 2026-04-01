package com.pthttmdt.bookstore.controller;

import com.pthttmdt.bookstore.dto.GenreDto;
import com.pthttmdt.bookstore.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @GetMapping
    public ResponseEntity<List<GenreDto.Response>> getGenres() {
        return ResponseEntity.ok(genreService.getActiveGenres());
    }
}