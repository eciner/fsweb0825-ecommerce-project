package com.eciner.ecommerce.order;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/** Canonical typed order intent only; never includes ignored payment fields or CCV. */
final class OrderIntentFingerprint {
    private OrderIntentFingerprint() {}
    static String of(OrderRequest request) {
        try {
            var bytes = new ByteArrayOutputStream();
            var data = new DataOutputStream(bytes);
            data.writeLong(request.addressId());
            data.writeLong(request.receiptAddressId() == null ? request.addressId() : request.receiptAddressId());
            text(data, request.orderDate() == null ? null : request.orderDate().toString());
            text(data, request.price() == null ? null : request.price().stripTrailingZeros().toPlainString());
            data.writeInt(request.products().size());
            for (var line : request.products()) {
                data.writeLong(line.productId()); data.writeInt(line.count()); text(data, line.detail());
            }
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes.toByteArray()));
        } catch (java.io.IOException | java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Order intent could not be identified.", exception);
        }
    }
    private static void text(DataOutputStream data, String value) throws java.io.IOException {
        if (value == null) { data.writeInt(-1); return; }
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        data.writeInt(bytes.length); data.write(bytes);
    }
}
