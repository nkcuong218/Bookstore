package com.pthttmdt.bookstore.dto;

import com.pthttmdt.bookstore.entity.Genre;
import lombok.Data;

public class GenreDto {

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String slug;

        public static Response fromEntity(Genre genre) {
            Response res = new Response();
            res.id = genre.getId();
            res.name = genre.getName();
            res.slug = genre.getSlug();
            return res;
        }
    }
}