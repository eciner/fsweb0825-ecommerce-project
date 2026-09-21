import { Link } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";

import { getCartLineTotal } from "../utils/cart";
import { getProductImage } from "../utils/productModel";

function productName(product) {
  return product?.name || product?.title || "Product";
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function CartDropdown({ cart, onClose }) {
  return (
    <div className="absolute right-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-[#E8E8E8] bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
        <h2 className="text-sm font-bold text-[#252B42]">Shopping Cart</h2>
        <button type="button" onClick={onClose} aria-label="Close cart">
          <X size={18} className="text-[#737373]" />
        </button>
      </div>
      {cart.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <ShoppingCart size={28} className="text-[#BDBDBD]" />
          <p className="text-sm text-[#737373]">Your cart is empty.</p>
          <Link
            to="/shop"
            onClick={onClose}
            className="text-sm font-semibold text-[#23A6F0]"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="max-h-72 divide-y divide-[#F1F1F1] overflow-y-auto">
            {cart.map((item) => (
              <li key={item.product.id} className="flex gap-3 py-3">
                <img
                  src={getProductImage(item.product)}
                  alt={productName(item.product)}
                  className="h-14 w-14 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#252B42]">
                    {productName(item.product)}
                  </p>
                  <p className="mt-1 text-xs text-[#737373]">
                    {item.count} x {formatCurrency(item.product.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#252B42]">
                  {formatCurrency(getCartLineTotal(item))}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/cart"
            onClick={onClose}
            className="mt-3 flex h-10 items-center justify-center rounded bg-[#23A6F0] text-sm font-semibold text-white hover:bg-[#1B8FD8]"
          >
            View cart
          </Link>
        </>
      )}
    </div>
  );
}
