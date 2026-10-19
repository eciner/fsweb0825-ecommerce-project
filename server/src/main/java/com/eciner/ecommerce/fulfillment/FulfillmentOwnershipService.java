package com.eciner.ecommerce.fulfillment;

import com.eciner.ecommerce.product.ProductRepository;
import com.eciner.ecommerce.common.error.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FulfillmentOwnershipService {
    private final ShipmentService authorization;
    private final ProductRepository products;
    private final JdbcTemplate jdbc;
    public FulfillmentOwnershipService(ShipmentService authorization,ProductRepository products,JdbcTemplate jdbc) {
        this.authorization=authorization;this.products=products;this.jdbc=jdbc;
    }
    public record StoreChoice(long id,String name) {}
    public record ProductOwner(long id,String name,Long storeId) {}
    public record ProductPage(List<ProductOwner> products,long total,int page,int size) {}
    public record Assignment(@jakarta.validation.constraints.Positive Long storeId) {}
    private void admin(long userId) {
        if(!authorization.manager(userId).getRole().getCode().equals("admin")) throw new AccessDeniedException("Admin required.");
    }
    @Transactional(readOnly=true)
    public List<StoreChoice> stores(long userId) {
        admin(userId);
        return jdbc.query("select s.id,s.name from store s join app_user u on u.store_id=s.id join role r on r.id=u.role_id where r.code='store' order by s.id",
            (rs,n)->new StoreChoice(rs.getLong(1),rs.getString(2)));
    }
    @Transactional(readOnly=true)
    public ProductPage products(long userId,int page,int size) {
        admin(userId);
        return new ProductPage(jdbc.query("select id,name,fulfillment_store_id from product order by id limit ? offset ?",
            (rs,n)->new ProductOwner(rs.getLong(1),rs.getString(2),(Long)rs.getObject(3)),size,(long)page*size),
            jdbc.queryForObject("select count(*) from product",Long.class),page,size);
    }
    public ProductOwner assign(long userId,long productId,Long storeId) {
        admin(userId);
        if(storeId!=null && jdbc.queryForObject("select count(*) from app_user u join role r on r.id=u.role_id where u.store_id=? and r.code='store'",Long.class,storeId)!=1)
            throw new ResourceNotFoundException("STORE_NOT_FOUND","A registered Store account was not found.");
        var product=products.findByIdForUpdate(productId).orElseThrow(()->new ResourceNotFoundException("PRODUCT_NOT_FOUND","Product was not found."));
        if(!java.util.Objects.equals(storeId,product.getFulfillmentStoreId())) {
            jdbc.update("insert into product_fulfillment_audit(product_id,previous_store_id,store_id,actor_id,recorded_at) values(?,?,?,?,?)",
                productId,product.getFulfillmentStoreId(),storeId,userId,Timestamp.from(Instant.now()));
            product.assignFulfillmentStore(storeId);
        }
        return new ProductOwner(productId,product.getName(),storeId);
    }
}
