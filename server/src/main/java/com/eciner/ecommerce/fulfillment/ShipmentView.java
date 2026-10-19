package com.eciner.ecommerce.fulfillment;

import java.time.Instant;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

public record ShipmentView(long id, long orderId, Long storeId, String storeName,
        ShipmentStatus status, long version, String carrier, String trackingNumber,
        Instant createdAt, Instant updatedAt, boolean historical, String shippingAddress,
        List<Line> items, List<Event> history) {
    public record Line(long productId, String productName, int count) {}
    public record Event(long id, String status, String carrier, String trackingNumber,
            @JsonInclude(JsonInclude.Include.NON_NULL) Long actorId, Instant recordedAt, String kind) {}
    public ShipmentView forCustomer() {
        return new ShipmentView(id, orderId, storeId, storeName, status, version, carrier,
            trackingNumber, createdAt, updatedAt, historical, shippingAddress, items,
            history.stream().map(event -> new Event(event.id(), event.status(), event.carrier(),
                event.trackingNumber(), null, event.recordedAt(), event.kind())).toList());
    }
    public record OrderShipments(String status, List<ShipmentView> shipments) {}
    public record Page(List<ShipmentView> shipments, long total, int page, int size) {}
}
