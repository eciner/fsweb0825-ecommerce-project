import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  decrementCartItem,
  incrementCartItem,
  removeCartItem,
  toggleCartItem,
} from "../store/actions";
import { getProductImage } from "../utils/productModel";
import { getCartLineTotal } from "../utils/cart";
import OrderSummary from "../components/OrderSummary";

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function productName(product) {
  return product?.name || product?.title || "Product";
}

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.shoppingCart.cart);

  if (!cart.length) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#252B42]">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm text-[#737373]">
          Choose products from the shop to start an order.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded bg-[#23A6F0] px-6 py-3 text-sm font-semibold text-white"
        >
          Go to Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-bold text-[#252B42]">Shopping Cart</h1>
        <div className="mt-6 overflow-x-auto rounded-md bg-white shadow-sm">
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="border-b border-[#E8E8E8] text-xs uppercase text-[#737373]">
              <tr>
                <th className="p-4">Select</th>
                <th className="p-4">Product</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Total</th>
                <th className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1F1]">
              {cart.map((item) => (
                <tr key={item.product.id}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => dispatch(toggleCartItem(item.product.id))}
                      aria-label={`Select ${productName(item.product)}`}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImage(item.product)}
                        alt={productName(item.product)}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <span className="font-semibold text-[#252B42]">
                        {productName(item.product)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[#737373]">
                    {formatCurrency(item.product.price)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(decrementCartItem(item.product.id))
                        }
                        aria-label={`Decrease ${productName(item.product)}`}
                        className="rounded border border-[#DDDDDD] p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-6 text-center">{item.count}</span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(incrementCartItem(item.product.id))
                        }
                        aria-label={`Increase ${productName(item.product)}`}
                        className="rounded border border-[#DDDDDD] p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-[#252B42]">
                    {formatCurrency(getCartLineTotal(item))}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => dispatch(removeCartItem(item.product.id))}
                      aria-label={`Remove ${productName(item.product)}`}
                      className="text-[#E74040]"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <OrderSummary cart={cart} />
    </section>
  );
}
