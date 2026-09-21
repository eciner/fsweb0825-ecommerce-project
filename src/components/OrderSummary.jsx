import { Link } from "react-router-dom";

import { calculateCartTotals } from "../utils/cart";

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function OrderSummary({
  cart,
  actionLabel = "Create Order",
  actionTo = "/order",
  onAction,
}) {
  const totals = calculateCartTotals(cart);

  return (
    <aside className="h-fit w-full rounded-md bg-white p-5 shadow-sm lg:w-80">
      <h2 className="text-lg font-bold text-[#252B42]">Order Summary</h2>
      <dl className="mt-5 flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[#737373]">Products Total</dt>
          <dd className="font-semibold text-[#252B42]">
            {formatCurrency(totals.productsTotal)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#737373]">Shipping</dt>
          <dd className="font-semibold text-[#252B42]">
            {formatCurrency(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#737373]">Discount</dt>
          <dd className="font-semibold text-[#252B42]">
            -{formatCurrency(totals.discount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-[#E8E8E8] pt-3">
          <dt className="font-bold text-[#252B42]">Grand Total</dt>
          <dd className="font-bold text-[#252B42]">
            {formatCurrency(totals.grandTotal)}
          </dd>
        </div>
      </dl>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 flex h-11 w-full items-center justify-center rounded bg-[#23A6F0] text-sm font-semibold text-white hover:bg-[#1B8FD8]"
        >
          {actionLabel}
        </button>
      ) : (
        <Link
          to={actionTo}
          className="mt-6 flex h-11 items-center justify-center rounded bg-[#23A6F0] text-sm font-semibold text-white hover:bg-[#1B8FD8]"
        >
          {actionLabel}
        </Link>
      )}
    </aside>
  );
}
