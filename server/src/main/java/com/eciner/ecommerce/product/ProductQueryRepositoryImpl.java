package com.eciner.ecommerce.product;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Repository;

/**
 * Supports arbitrary (non page-aligned) limit/offset pagination combined with optional category
 * and free-text filters and an optional sort, using the criteria API directly rather than
 * Spring Data's page-number-based {@code Pageable}.
 */
@Repository
public class ProductQueryRepositoryImpl implements ProductQueryRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public ProductPage search(Long categoryId, String gender, String filter, ProductSort sort, int limit, int offset, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, boolean inStock) {
        long total = countMatches(categoryId, gender, filter, minPrice, maxPrice, inStock);

        if (total == 0) {
            return new ProductPage(List.of(), 0);
        }

        List<Product> items = findPage(categoryId, gender, filter, sort, limit, offset, minPrice, maxPrice, inStock);
        return new ProductPage(items, total);
    }

    private long countMatches(Long categoryId, String gender, String filter, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, boolean inStock) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Product> root = countQuery.from(Product.class);

        countQuery.select(cb.count(root)).where(buildPredicates(cb, root, categoryId, gender, filter, minPrice, maxPrice, inStock));

        return entityManager.createQuery(countQuery).getSingleResult();
    }

    private List<Product> findPage(Long categoryId, String gender, String filter, ProductSort sort, int limit, int offset, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, boolean inStock) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> root = query.from(Product.class);

        query.select(root).where(buildPredicates(cb, root, categoryId, gender, filter, minPrice, maxPrice, inStock));

        if (sort != null) {
            Order order = sort.ascending() ? cb.asc(root.get(sort.field())) : cb.desc(root.get(sort.field()));
            query.orderBy(order, cb.asc(root.get("id")));
        } else {
            query.orderBy(cb.asc(root.get("id")));
        }

        return entityManager.createQuery(query)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    private Predicate[] buildPredicates(CriteriaBuilder cb, Root<Product> root, Long categoryId, String gender, String filter, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, boolean inStock) {
        List<Predicate> predicates = new ArrayList<>();

        if (categoryId != null) {
            predicates.add(cb.equal(root.get("category").get("id"), categoryId));
        }

        if (gender != null) predicates.add(cb.equal(root.get("category").get("gender"), gender));

        if (filter != null && !filter.isBlank()) {
            String term = "%" + fold(filter).replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
            predicates.add(cb.or(cb.like(folded(cb, root.get("name")), term, '!'),
                    cb.like(folded(cb, root.get("description")), term, '!')));
        }

        if (minPrice != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        if (inStock) predicates.add(cb.greaterThan(root.get("stock"), 0));
        return predicates.toArray(new Predicate[0]);
    }

    private String fold(String value) {
        return java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").replace('\u0131', 'i').toLowerCase(Locale.ROOT);
    }
    private jakarta.persistence.criteria.Expression<String> folded(CriteriaBuilder cb, jakarta.persistence.criteria.Expression<String> value) {
        return cb.function("translate", String.class, cb.lower(value),
                cb.literal("\u0131\u0130\u015f\u015e\u011f\u011e\u00fc\u00dc\u00f6\u00d6\u00e7\u00c7\u0307"), cb.literal("iissgguuoocc"));
    }
}
