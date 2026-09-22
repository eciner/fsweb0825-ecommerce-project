package com.eciner.ecommerce.category;

import java.math.BigDecimal;

/** Matches the category shape used for gender/category shop routing (slug.js) and shop banners. */
public record CategoryResponse(
        Long id,
        String title,
        String img,
        String gender,
        String code,
        BigDecimal rating) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getTitle(),
                category.getImg(),
                category.getGender(),
                category.getCode(),
                category.getRating());
    }

}
