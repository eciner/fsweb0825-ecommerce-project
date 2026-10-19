package com.eciner.ecommerce.fulfillment;

import com.eciner.ecommerce.common.error.*;
import com.eciner.ecommerce.order.Order;
import com.eciner.ecommerce.order.OrderItem;
import com.eciner.ecommerce.order.OrderRepository;
import com.eciner.ecommerce.user.*;
import java.time.Instant;
import java.util.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShipmentService {
    private final ShipmentRepository shipments;
    private final UserRepository users;
    private final OrderRepository orders;
    public ShipmentService(ShipmentRepository shipments, UserRepository users, OrderRepository orders) {
        this.shipments=shipments;this.users=users;this.orders=orders;
    }
    public void initialize(Order order, long actorId) {
        if(!shipments.forOrder(order.getId()).isEmpty()) return;
        Map<Long,List<OrderItem>> groups=new LinkedHashMap<>();
        for(var item:order.getProducts()) groups.computeIfAbsent(item.getFulfillmentStoreId(),ignored->new ArrayList<>()).add(item);
        Instant now=Instant.now();
        groups.forEach((store,items)->{
            long id=shipments.insert(order.getId(),store,now);
            for(var item:items) shipments.attach(id,item.getId());
            shipments.event(id,null,"ORDER_PLACED",null,null,actorId,now,"ORDER_CREATED");
        });
    }
    @Transactional(readOnly=true, isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ShipmentView.OrderShipments owned(long userId,long orderId) {
        orders.findByIdAndOwner_Id(orderId,userId).orElseThrow(ShipmentService::notFound);
        var rows=shipments.forOrder(orderId);
        var statuses=rows.stream().map(ShipmentRepository.Row::status).distinct().toList();
        String aggregate=statuses.size()==1?statuses.getFirst().name():statuses.isEmpty()?"NOT_RECORDED":
            statuses.contains(ShipmentStatus.DELIVERED)?"PARTIALLY_DELIVERED":statuses.contains(ShipmentStatus.SHIPPED)?"PARTIALLY_SHIPPED":"PARTIALLY_PREPARING";
        return new ShipmentView.OrderShipments(aggregate,shipments.views(rows).stream().map(ShipmentView::forCustomer).toList());
    }
    User manager(long userId) {
        User actor=users.findById(userId).orElseThrow(ShipmentService::notFound);
        if(!Set.of("admin","store").contains(actor.getRole().getCode())) throw new AccessDeniedException("Fulfillment role required.");
        if(actor.getRole().getCode().equals("store") && actor.getStore()==null) throw new AccessDeniedException("Verified store required.");
        return actor;
    }
    @Transactional(readOnly=true, isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ShipmentView.Page list(long userId, ShipmentStatus status,int page,int size) {
        User actor=manager(userId);Long store=actor.getRole().getCode().equals("admin")?null:actor.getStore().getId();
        return new ShipmentView.Page(shipments.views(shipments.page(store,status,page,size)),shipments.count(store,status),page,size);
    }
    public ShipmentView update(long userId,long shipmentId,ShipmentUpdate request) {
        User actor=manager(userId);boolean admin=actor.getRole().getCode().equals("admin");
        var row=shipments.lock(shipmentId,admin?null:actor.getStore().getId()).orElseThrow(ShipmentService::notFound);
        String carrier=clean(request.carrier()),tracking=clean(request.trackingNumber());
        if(shipments.request(row.id(),request.requestId()).isPresent()) {
            if(!shipments.replayMatches(row.id(),request.requestId(),userId,request.status().name(),carrier,tracking))
                throw new ConflictException("SHIPMENT_REQUEST_CONFLICT","Request reference already belongs to another update.");
            return shipments.view(row);
        }
        if(row.version()!=request.version()) throw new ConflictException("SHIPMENT_VERSION_CONFLICT","Shipment changed. Refresh before updating.");
        int step=request.status().ordinal()-row.status().ordinal();
        if(step<0 || step>1) throw new ConflictException("INVALID_SHIPMENT_TRANSITION","Advance one lifecycle step at a time; reversals are not allowed.");
        if(row.status()==ShipmentStatus.DELIVERED && !admin) throw new ConflictException("SHIPMENT_FINAL","Delivered shipments are final for stores.");
        if(request.status().ordinal()>=ShipmentStatus.SHIPPED.ordinal() && (carrier==null || tracking==null))
            throw new InvalidRequestException("TRACKING_REQUIRED","Carrier and tracking number are required before shipping.");
        if(step==0 && Objects.equals(carrier,row.carrier()) && Objects.equals(tracking,row.tracking()))
            throw new ConflictException("NO_SHIPMENT_CHANGE","No change was requested. Refresh the shipment.");
        Instant now=Instant.now();
        shipments.update(row,request.status().name(),carrier,tracking,now);
        shipments.event(row.id(),request.requestId(),request.status().name(),carrier,tracking,userId,now,step==0?"METADATA_CORRECTION":"STATUS_CHANGED");
        return shipments.view(shipments.lock(row.id(),admin?null:actor.getStore().getId()).orElseThrow());
    }
    private String clean(String value) { return value==null || value.isBlank()?null:value.strip(); }
    static ResourceNotFoundException notFound() { return new ResourceNotFoundException("SHIPMENT_NOT_FOUND","Order or shipment was not found."); }
}
