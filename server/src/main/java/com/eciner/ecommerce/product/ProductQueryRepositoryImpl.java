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
    public ProductPage search(Long categoryId, String filter, ProductSort sort, int limit, int offset) {
        long total = countMatches(categoryId, filter);

        if (total == 0) {
            return new ProductPage(List.of(), 0);
        }

        List<Product> items = findPage(categoryId, filter, sort, limit, offset);
        return new ProductPage(items, total);
    }

    private long countMatches(Long categoryId, String filter) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Product> root = countQuery.from(Product.class);

        countQuery.select(cb.count(root)).where(buildPredicates(cb, root, categoryId, filter));

        return entityManager.createQuery(countQuery).getSingleResult();
    }

    private List<Product> findPage(Long categoryId, String filter, ProductSort sort, int limit, int offset) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> root = query.from(Product.class);

        query.select(root).where(buildPredicates(cb, root, categoryId, filter));

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

    private Predicate[] buildPredicates(CriteriaBuilder cb, Root<Product> root, Long categoryId, String filter) {
        List<Predicate> predicates = new ArrayList<>();

        if (categoryId != null) {
            predicates.add(cb.equal(root.get("category").get("id"), categoryId));
        }

        if (filter != null && !filter.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("name")), "%" + filter.toLowerCase(Locale.ROOT) + "%"));
        }

        return predicates.toArray(new Predicate[0]);
    }

}
