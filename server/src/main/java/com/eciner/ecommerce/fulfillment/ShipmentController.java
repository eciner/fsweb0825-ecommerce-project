package com.eciner.ecommerce.fulfillment;

import com.eciner.ecommerce.auth.AuthPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
public class ShipmentController {
    private final ShipmentService shipments;
    private final FulfillmentOwnershipService ownership;
    public ShipmentController(ShipmentService shipments,FulfillmentOwnershipService ownership) { this.shipments=shipments;this.ownership=ownership; }
    @GetMapping("/order/{orderId}/shipments")
    public ShipmentView.OrderShipments owned(@AuthenticationPrincipal AuthPrincipal user,@PathVariable @Positive long orderId) { return shipments.owned(user.getUserId(),orderId); }
    @GetMapping("/fulfillment/shipments")
    public ShipmentView.Page list(@AuthenticationPrincipal AuthPrincipal user,@RequestParam(required=false) ShipmentStatus status,
            @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int page,@RequestParam(defaultValue="25") @Min(1) @Max(100) int size) {
        return shipments.list(user.getUserId(),status,page,size);
    }
    @PutMapping("/fulfillment/shipments/{id}")
    public ShipmentView update(@AuthenticationPrincipal AuthPrincipal user,@PathVariable @Positive long id,@Valid @RequestBody ShipmentUpdate request) { return shipments.update(user.getUserId(),id,request); }
    @GetMapping("/fulfillment/stores")
    public java.util.List<FulfillmentOwnershipService.StoreChoice> stores(@AuthenticationPrincipal AuthPrincipal user) { return ownership.stores(user.getUserId()); }
    @GetMapping("/fulfillment/products")
    public FulfillmentOwnershipService.ProductPage products(@AuthenticationPrincipal AuthPrincipal user,
            @RequestParam(defaultValue="0") @Min(0) @Max(1000000) int page,@RequestParam(defaultValue="25") @Min(1) @Max(100) int size) { return ownership.products(user.getUserId(),page,size); }
    @PutMapping("/fulfillment/products/{id}/store")
    public FulfillmentOwnershipService.ProductOwner assign(@AuthenticationPrincipal AuthPrincipal user,@PathVariable @Positive long id,
            @Valid @RequestBody FulfillmentOwnershipService.Assignment request) { return ownership.assign(user.getUserId(),id,request.storeId()); }
}
