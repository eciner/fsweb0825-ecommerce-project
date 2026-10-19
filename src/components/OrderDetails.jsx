import { FALLBACK_PRODUCT_IMAGE } from "../utils/productModel";

import { formatOrderPrice } from "../utils/order";
import ShipmentDetails from "./ShipmentDetails";

export default function OrderDetails({ order }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Order placed in demo checkout. No real payment or shipping transaction
        is represented.
      </p>
      <ul className="flex flex-col divide-y divide-outline">
        {(order.products || []).map((line, i) => (
          <li
            key={`${line.product_id}-${i}`}
            className="flex flex-wrap items-center gap-4 py-4"
          >
            {line.image_url && (
              <img
                src={line.image_url}
                alt={line.product_name || `Product ${line.product_id}`}
                width="80"
                height="80"
                loading="lazy"
                className="h-20 w-20 rounded-control object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold">
                {line.product_name ||
                  `Product #${line.product_id} (historical name not recorded)`}
              </p>
              <p>Quantity: {line.count}</p>
              {line.detail && (
                <p className="break-words text-sm text-muted">{line.detail}</p>
              )}
            </div>
            <div className="w-full text-sm sm:w-auto">
              <p>Unit: {formatOrderPrice(line.unit_price, order.currency)}</p>
              <p className="font-bold">
                Line: {formatOrderPrice(line.line_total, order.currency)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xl font-bold">
        Total: {formatOrderPrice(order.price, order.currency)}
      </p>
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex-1">
          <h3 className="font-bold">Shipping address at purchase</h3>
          <p className="whitespace-pre-line break-words text-sm">
            {order.shipping_address ||
              "Historical address snapshot not recorded."}
          </p>
        </div>
        <div className="flex-1">
          <h3 className="font-bold">Billing / receipt address at purchase</h3>
          <p className="whitespace-pre-line break-words text-sm">
            {order.receipt_address ||
              "Historical receipt address not recorded."}
          </p>
        </div>
      </div>
      <ShipmentDetails orderId={order.id} />
    </div>
  );
}
