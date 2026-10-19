import { recoverOrder } from "../store/pendingOrder";
import { checkoutBusy } from "../store/checkoutState";
import { revalidateCart } from "../store/cartActions";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  createOrder,
  deleteAddress,
  deleteCreditCard,
  fetchAddresses,
  fetchCreditCards,
  restorePendingCheckout,
  dismissCheckoutResult,
  setCheckoutAddress,
  setCheckoutPayment,
} from "../store/actions";
import { buildOrderPayload, calculateCartTotals } from "../utils/cart";
import { isCardExpired } from "../utils/card";
import { isCheckoutReady } from "../utils/checkout";
import ResourceNotice from "../components/ResourceNotice";
import OrderDetails from "../components/OrderDetails";
import CardForm from "../components/CardForm";
import AddressForm from "../components/AddressForm";
import { getCheckoutView } from "../utils/checkoutView";

export default function OrderPage() {
  const account = useSelector((state) => state.client.user?.email);
  const revision = useSelector((state) => state.client.sessionRevision);
  return <CheckoutPage key={`${account}:${revision}`} />;
}

function CheckoutPage() {
  const dispatch = useDispatch();
  const [checkingCart, setCheckingCart] = useState(false);
  const [cartCheckError, setCartCheckError] = useState("");
  const account = useSelector((state) => state.client.user?.email);
  const revision = useSelector((state) => state.client.sessionRevision);
  const orderIntent = useSelector((state) => state.shoppingCart.orderIntent);
  const result = useSelector((state) => state.shoppingCart.checkoutResult);
  const orderError =
    orderIntent?.error ||
    (result?.visible !== false ? result?.error : "") ||
    cartCheckError;
  const cart = useSelector((state) => state.shoppingCart.cart);
  const addresses = useSelector((state) => state.client.addressList);
  const cards = useSelector((state) => state.client.creditCards);
  const completedOrder = result?.visible !== false ? result?.order : null;
  const [requestedStep, setStep] = useState(
    orderIntent || recoverOrder(account) ? 2 : 1,
  );
  const step = completedOrder ? 3 : orderIntent ? 2 : requestedStep;
  const [addressForm, setAddressForm] = useState(null);
  const [cardForm, setCardForm] = useState(null);
  const [shippingId, setShippingId] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const selectedShippingAddress =
    addresses.find((address) => address.id === shippingId) || null;
  const selectedReceiptAddress =
    addresses.find((address) => address.id === receiptId) || null;
  const setSelectedShippingAddress = (address) =>
    setShippingId(address?.id ?? null);
  const setSelectedReceiptAddress = (address) =>
    setReceiptId(address?.id ?? null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const receiptAddress = sameAsShipping
    ? selectedShippingAddress
    : selectedReceiptAddress;
  const [cardId, setCardId] = useState(null);
  const selectedCard = cards.find((card) => card.id === cardId) || null;
  const setSelectedCard = (card) => setCardId(card?.id ?? null);
  const [ccv, setCcv] = useState("");
  const submitting = checkoutBusy(orderIntent) || checkingCart;
  useEffect(() => {
    dispatch(dismissCheckoutResult());
    dispatch(restorePendingCheckout());
  }, [dispatch, account, revision]);
  const resourceStatus = useSelector((state) => state.client.resourceStatus);
  const addressLoadError =
    resourceStatus.addresses?.refresh === "FAILED" &&
    resourceStatus.addresses?.mutation !== "CONFIRMED"
      ? resourceStatus.addresses.refreshError
      : "";
  const cardLoadError =
    resourceStatus.cards?.refresh === "FAILED" &&
    resourceStatus.cards?.mutation !== "CONFIRMED"
      ? resourceStatus.cards.refreshError
      : "";

  useEffect(() => {
    dispatch(fetchAddresses()).catch(() => {});
    dispatch(fetchCreditCards()).catch(() => {});
  }, [dispatch]);
  useEffect(() => {
    dispatch(
      setCheckoutAddress(
        selectedShippingAddress || receiptAddress
          ? { shipping: selectedShippingAddress, receipt: receiptAddress }
          : {},
      ),
    );
  }, [dispatch, receiptAddress, selectedShippingAddress]);
  useEffect(() => {
    dispatch(setCheckoutPayment(selectedCard || {}));
  }, [dispatch, selectedCard]);
  const checkoutView = getCheckoutView(step, cart.length);
  const checkoutReady = orderIntent
    ? /^\d{3}$/.test(ccv) &&
      !submitting &&
      !["AUTH_REQUIRED", "UNRESOLVED"].includes(orderIntent.status)
    : isCheckoutReady({
        shippingAddress: selectedShippingAddress,
        receiptAddress,
        card:
          selectedCard &&
          !isCardExpired(selectedCard.expire_month, selectedCard.expire_year)
            ? selectedCard
            : null,
        ccv,
        cart,
        submitting,
      });

  if (checkoutView === "empty" && !orderIntent) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#252B42]">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm text-[#737373]">
          Add at least one product before creating an order.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded bg-action px-6 py-3 text-sm font-semibold text-white"
        >
          Go to Shop
        </Link>
      </section>
    );
  }

  const completeOrder = async (event) => {
    event.preventDefault();
    if (!checkoutReady) {
      toast.error(
        "Select shipping and receipt addresses, a card, products, and a valid CCV.",
      );
      return;
    }
    let validatedCart = cart;
    if (!orderIntent) {
      setCheckingCart(true);
      setCartCheckError("");
      try {
        validatedCart = await dispatch(revalidateCart());
        if (!validatedCart.some(item => item.checked) || validatedCart.some(item => item.checked && (item.product.unavailable || item.count > item.product.stock)))
          throw new Error("Availability changed. Review quantities in your cart before placing an order.");
      } catch (error) {
        setCcv(""); setCartCheckError(error.message); setCheckingCart(false); return;
      }
      setCheckingCart(false);
    }
    const payload = orderIntent?.payload || {
      ...buildOrderPayload({
        addressId: selectedShippingAddress.id,
        receiptAddressId: receiptAddress.id,
        cart: validatedCart,
        price: calculateCartTotals(validatedCart).grandTotal,
      }),
      request_id: crypto.randomUUID(),
    };
    const purchased = validatedCart
      .filter((item) => item.checked)
      .map((item) => ({ productId: item.product.id, count: item.count }));
    setCcv("");
    // All asynchronous state, storage, cart and inventory settlement is scoped in Redux.
    dispatch(createOrder(payload, { purchased })).catch(() => {});
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10">
      <h1 className="text-3xl font-bold text-[#252B42]">Create Order</h1>
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        <span className={step === 1 ? "text-action" : "text-[#737373]"}>
          1. Address
        </span>
        <span className="text-[#BDBDBD]">/</span>
        <span className={step === 2 ? "text-action" : "text-[#737373]"}>
          2. Payment
        </span>
        <span className="text-[#737373]">/</span>
        <span className={step === 3 ? "text-action" : "text-[#737373]"}>
          3. Confirmation
        </span>
      </div>
      {orderError && (
        <p
          id="checkout-recovery-message"
          role="alert"
          className="mt-5 text-danger-text"
        >
          {orderError}{" "}
          <Link to="/orders" className="underline">
            Previous Orders
          </Link>
        </p>
      )}
      {orderIntent?.status === "AUTH_REQUIRED" && (
        <Link
          to={{ pathname: "/login", state: { from: "/order" } }}
          className="mt-3 font-bold text-action underline"
        >
          Sign in to reconcile the original purchase
        </Link>
      )}
      {orderIntent && (
        <p className="mt-3 text-sm text-muted">
          This purchase stays bound to its original account. Tab recovery
          requires browser storage; if storage is unavailable, keep this session
          open and check history before leaving. A different account cannot
          resolve this purchase.
        </p>
      )}
      {orderIntent && !submitting && !orderError && (
        <p role="status" className="mt-4">
          A pending purchase is retained. Retry the same order safely or check
          Previous Orders before starting another purchase.
        </p>
      )}
      <ResourceNotice resource="addresses" />
      <ResourceNotice resource="cards" />
      {checkoutView === "success" ? (
        <div className="mt-10 rounded-md bg-white p-5 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-[#23856D]">Order completed</h2>
          <p className="mt-3">
            Order #{completedOrder?.id} |{" "}
            {completedOrder?.order_date
              ? new Date(completedOrder.order_date).toLocaleString()
              : "Date not recorded"}
          </p>
          {completedOrder && (
            <div className="mt-6 text-left">
              <OrderDetails order={completedOrder} />
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-5">
            <Link
              to={`/orders?order=${completedOrder?.id}`}
              className="font-bold text-action"
            >
              View order details
            </Link>
            <Link to="/orders" className="font-bold text-action">
              Previous Orders
            </Link>
            <Link to="/shop" className="font-bold text-action">
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md bg-white p-5 shadow-sm">
          {step === 1 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#252B42]">
                  Shipping and receipt address
                </h2>
                <button
                  type="button"
                  disabled={Boolean(orderIntent)}
                  onClick={() => setAddressForm({})}
                  className="rounded bg-action px-3 py-2 text-xs font-semibold text-white"
                >
                  Add Address
                </button>
              </div>
              {addressForm ? (
                <AddressForm
                  address={addressForm.id ? addressForm : null}
                  onDone={() => setAddressForm(null)}
                />
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {addressLoadError ? (
                    <div
                      className="flex items-center justify-between text-sm text-danger-text"
                      role="alert"
                    >
                      <span>{addressLoadError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(fetchAddresses()).catch(() => {});
                        }}
                        className="font-semibold"
                      >
                        Retry
                      </button>
                    </div>
                  ) : addresses.length ? (
                    <>
                      <label className="flex items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(event) =>
                            setSameAsShipping(event.target.checked)
                          }
                        />
                        Billing / receipt address is the same as shipping
                      </label>
                      {["shipping", ...(sameAsShipping ? [] : ["receipt"])].map(
                        (kind) => (
                          <fieldset
                            key={kind}
                            className="rounded border border-[#E8E8E8] p-3"
                          >
                            <legend className="px-1 text-sm font-bold text-[#252B42]">
                              {kind === "shipping"
                                ? "Shipping address"
                                : "Receipt address"}
                            </legend>
                            {addresses.map((address) => (
                              <label
                                key={`${kind}-${address.id}`}
                                className="flex items-center gap-3 py-2 text-sm text-[#252B42]"
                              >
                                <input
                                  type="radio"
                                  name={`${kind}-address`}
                                  checked={
                                    (kind === "shipping"
                                      ? selectedShippingAddress
                                      : selectedReceiptAddress
                                    )?.id === address.id
                                  }
                                  onChange={() => {
                                    if (kind === "shipping")
                                      setSelectedShippingAddress(address);
                                    else setSelectedReceiptAddress(address);
                                    dispatch(
                                      setCheckoutAddress({
                                        shipping:
                                          kind === "shipping"
                                            ? address
                                            : selectedShippingAddress,
                                        receipt:
                                          kind === "receipt"
                                            ? address
                                            : selectedReceiptAddress,
                                      }),
                                    );
                                  }}
                                />
                                {address.title ||
                                  `${address.name} ${address.surname}`}
                                <span className="text-xs text-[#737373]">
                                  {address.city}, {address.district}
                                </span>
                              </label>
                            ))}
                          </fieldset>
                        ),
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#737373]">
                      No saved addresses yet.
                    </p>
                  )}
                  {addresses.length > 0 && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={!selectedShippingAddress || !receiptAddress}
                        onClick={() => setStep(2)}
                        className="mt-3 h-11 rounded bg-action px-5 text-sm font-semibold text-white disabled:bg-[#BDBDBD]"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  )}
                  {addresses.map((address) => (
                    <div
                      key={`manage-${address.id}`}
                      className="flex justify-end gap-3"
                    >
                      <button
                        type="button"
                        disabled={Boolean(orderIntent)}
                        onClick={() => setAddressForm(address)}
                        aria-label={`Edit address ${address.title}`}
                        className="text-xs font-semibold text-action"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(deleteAddress(address.id)).catch(() => {});
                        }}
                        disabled={Boolean(orderIntent)}
                        aria-label={`Delete address ${address.title}`}
                        className="text-xs font-semibold text-danger-text"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#252B42]">Payment</h2>
                <button
                  type="button"
                  disabled={Boolean(orderIntent)}
                  onClick={() => {
                    setCcv("");
                    setCardForm({});
                  }}
                  className="rounded bg-action px-3 py-2 text-xs font-semibold text-white"
                >
                  Add Card
                </button>
              </div>
              {cardForm ? (
                <CardForm
                  card={cardForm.id ? cardForm : null}
                  onDone={() => setCardForm(null)}
                />
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {cardLoadError ? (
                    <div
                      className="flex items-center justify-between text-sm text-danger-text"
                      role="alert"
                    >
                      <span>{cardLoadError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(fetchCreditCards()).catch(() => {});
                        }}
                        className="font-semibold"
                      >
                        Retry
                      </button>
                    </div>
                  ) : cards.length ? (
                    cards.map((card) => (
                      <div
                        key={card.id || card.card_no}
                        className="flex items-center justify-between gap-3 rounded border border-[#E8E8E8] p-3"
                      >
                        <label className="flex items-center gap-3 text-sm text-[#252B42]">
                          <input
                            type="radio"
                            name="card"
                            disabled={
                              Boolean(orderIntent) ||
                              isCardExpired(card.expire_month, card.expire_year)
                            }
                            checked={selectedCard?.id === card.id}
                            onChange={() => {
                              setCcv("");
                              setSelectedCard(card);
                              dispatch(setCheckoutPayment(card));
                            }}
                          />
                          {card.card_no}{" "}
                          {isCardExpired(card.expire_month, card.expire_year)
                            ? "(expired)"
                            : ""}
                          <span className="text-xs text-[#737373]">
                            {card.name_on_card}
                          </span>
                        </label>
                        <span className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCcv("");
                              setCardForm(card);
                            }}
                            disabled={Boolean(orderIntent)}
                            aria-label={`Edit card ending ${String(card.card_no).slice(-4)}`}
                            className="text-xs font-semibold text-action"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCcv("");
                              if (selectedCard?.id === card.id)
                                setSelectedCard(null);
                              dispatch(deleteCreditCard(card.id)).catch(
                                () => {},
                              );
                            }}
                            disabled={Boolean(orderIntent)}
                            aria-label={`Delete card ending ${String(card.card_no).slice(-4)}`}
                            className="text-xs font-semibold text-danger-text"
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#737373]">
                      No saved cards yet. Choose Add Card to save a synthetic
                      demo card.
                    </p>
                  )}
                  {(orderIntent ||
                    (selectedCard &&
                      !isCardExpired(
                        selectedCard.expire_month,
                        selectedCard.expire_year,
                      ))) && (
                    <label className="mt-3 flex max-w-xs flex-col gap-1 text-sm font-semibold text-[#252B42]">
                      CCV
                      <input
                        type="password"
                        autoComplete="off"
                        value={ccv}
                        onChange={(event) =>
                          setCcv(
                            event.target.value.replace(/\D/g, "").slice(0, 3),
                          )
                        }
                        inputMode="numeric"
                        maxLength={3}
                        className="h-10 rounded border border-[#DDDDDD] px-3"
                      />
                    </label>
                  )}
                  <p className="text-sm text-muted">
                    Demo checkout: no real charge or payment authorization.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      disabled={Boolean(orderIntent)}
                      onClick={() => {
                        setCcv("");
                        setStep(1);
                      }}
                      className="h-11 rounded border border-[#23A6F0] px-5 text-sm font-semibold text-action"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={completeOrder}
                      aria-describedby={
                        orderError ? "checkout-recovery-message" : undefined
                      }
                      disabled={!checkoutReady}
                      className="inline-flex h-11 items-center gap-2 rounded bg-action px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#BDBDBD]"
                    >
                      {submitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {orderIntent
                        ? "Retry same order safely"
                        : "Complete Order"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
