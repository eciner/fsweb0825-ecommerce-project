import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  createAddress,
  createCreditCard,
  createOrder,
  deleteAddress,
  deleteCreditCard,
  fetchAddresses,
  fetchCreditCards,
  resetCart,
  setCheckoutAddress,
  setCheckoutPayment,
  updateAddress,
  updateCreditCard,
} from "../store/actions";
import { buildOrderPayload, calculateCartTotals } from "../utils/cart";

function Input({ label, name, register, rules, type = "text" }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-[#252B42]">
      <span>{label}</span>
      <input
        type={type}
        className="h-10 rounded border border-[#DDDDDD] px-3 font-normal outline-none focus:border-[#23A6F0]"
        {...register(name, rules)}
      />
    </label>
  );
}

function AddressDetailsField({ register, rules }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-[#252B42] sm:col-span-2">
      <span>Neighborhood / Address Details</span>
      <textarea
        rows="3"
        className="rounded border border-[#DDDDDD] px-3 py-2 font-normal outline-none focus:border-[#23A6F0]"
        {...register("neighborhood", rules)}
      />
    </label>
  );
}

function AddressForm({ address, onDone }) {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: address || {} });
  const submit = async (values) => {
    try {
      const payload = { ...values, id: address?.id };
      await dispatch(address ? updateAddress(payload) : createAddress(payload));
      toast.success(address ? "Address updated." : "Address saved.");
      onDone();
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <Input
        label="Address Title"
        name="title"
        register={register}
        rules={{ required: true }}
      />
      <Input
        label="Name"
        name="name"
        register={register}
        rules={{ required: true }}
      />
      <Input
        label="Surname"
        name="surname"
        register={register}
        rules={{ required: true }}
      />
      <Input
        label="Phone"
        name="phone"
        register={register}
        rules={{ required: true }}
      />
      <label className="flex flex-col gap-1 text-sm font-semibold text-[#252B42]">
        <span>City</span>
        <select
          className="h-10 rounded border border-[#DDDDDD] px-3 font-normal outline-none focus:border-[#23A6F0]"
          {...register("city", { required: true })}
        >
          <option value="">Select a city</option>
          <option value="istanbul">Istanbul</option>
          <option value="ankara">Ankara</option>
          <option value="izmir">Izmir</option>
          <option value="bursa">Bursa</option>
          <option value="antalya">Antalya</option>
        </select>
      </label>
      <Input
        label="District"
        name="district"
        register={register}
        rules={{ required: true }}
      />
      <AddressDetailsField register={register} rules={{ required: true }} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 rounded bg-[#23A6F0] px-4 text-sm font-semibold text-white sm:col-span-2"
      >
        {isSubmitting ? "Saving..." : "Save Address"}
      </button>
    </form>
  );
}

function CardForm({ card, onDone }) {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: card || {} });
  const submit = async (values) => {
    try {
      const payload = {
        ...values,
        id: card?.id,
        expire_month: Number(values.expire_month),
        expire_year: Number(values.expire_year),
      };
      await dispatch(
        card ? updateCreditCard(payload) : createCreditCard(payload),
      );
      toast.success(card ? "Card updated." : "Card saved.");
      onDone();
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <Input
        label="Card Number"
        name="card_no"
        register={register}
        type="text"
        rules={{ required: true, pattern: /^\d{12,19}$/ }}
      />
      <Input
        label="Name on Card"
        name="name_on_card"
        register={register}
        rules={{ required: true }}
      />
      <Input
        label="Expiration Month"
        name="expire_month"
        register={register}
        type="number"
        rules={{ required: true, min: 1, max: 12 }}
      />
      <Input
        label="Expiration Year"
        name="expire_year"
        register={register}
        type="number"
        rules={{ required: true, min: new Date().getFullYear() }}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 rounded bg-[#23A6F0] px-4 text-sm font-semibold text-white sm:col-span-2"
      >
        {isSubmitting ? "Saving..." : "Save Card"}
      </button>
    </form>
  );
}

export default function OrderPage() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.shoppingCart.cart);
  const addresses = useSelector((state) => state.client.addressList);
  const cards = useSelector((state) => state.client.creditCards);
  const [step, setStep] = useState(1);
  const [addressForm, setAddressForm] = useState(null);
  const [cardForm, setCardForm] = useState(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedReceiptAddress, setSelectedReceiptAddress] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [ccv, setCcv] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses()).catch((error) => toast.error(error.message));
    dispatch(fetchCreditCards()).catch(() => {});
  }, [dispatch]);
  useEffect(() => {
    if (selectedShippingAddress) {
      setSelectedShippingAddress(
        addresses.find(
          (address) => address.id === selectedShippingAddress.id,
        ) || null,
      );
    }
    if (selectedReceiptAddress) {
      setSelectedReceiptAddress(
        addresses.find((address) => address.id === selectedReceiptAddress.id) ||
          null,
      );
    }
    if (selectedCard) {
      setSelectedCard(
        cards.find((card) => card.id === selectedCard.id) || null,
      );
    }
  }, [
    addresses,
    cards,
    selectedCard,
    selectedReceiptAddress,
    selectedShippingAddress,
  ]);
  const totals = calculateCartTotals(cart);

  if (!cart.length) {
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
          className="mt-6 rounded bg-[#23A6F0] px-6 py-3 text-sm font-semibold text-white"
        >
          Go to Shop
        </Link>
      </section>
    );
  }

  const completeOrder = async (event) => {
    event.preventDefault();
    if (
      !selectedShippingAddress?.id ||
      !selectedReceiptAddress?.id ||
      !selectedCard ||
      !/^\d{3,4}$/.test(ccv) ||
      !cart.some((item) => item.checked)
    ) {
      toast.error(
        "Select shipping and receipt addresses, a card, products, and a valid CCV.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildOrderPayload({
        addressId: selectedShippingAddress.id,
        card: selectedCard,
        ccv,
        cart,
        price: totals.grandTotal,
      });
      await dispatch(createOrder(payload));
      dispatch(resetCart());
      setCcv("");
      toast.success("Your order was completed successfully.");
      setStep(3);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10">
      <h1 className="text-3xl font-bold text-[#252B42]">Create Order</h1>
      <div className="mt-6 flex gap-3 text-sm font-semibold">
        <span className={step === 1 ? "text-[#23A6F0]" : "text-[#737373]"}>
          1. Address
        </span>
        <span className="text-[#BDBDBD]">/</span>
        <span className={step === 2 ? "text-[#23A6F0]" : "text-[#737373]"}>
          2. Payment
        </span>
      </div>
      {step === 3 ? (
        <div className="mt-10 rounded-md bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-[#23856D]">Order completed</h2>
          <p className="mt-3 text-sm text-[#737373]">
            Thank you. Your selected products have been removed from the cart.
          </p>
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
                  onClick={() => setAddressForm({})}
                  className="rounded bg-[#23A6F0] px-3 py-2 text-xs font-semibold text-white"
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
                  {addresses.length ? (
                    <>
                      {["shipping", "receipt"].map((kind) => (
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
                      ))}
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
                        disabled={
                          !selectedShippingAddress || !selectedReceiptAddress
                        }
                        onClick={() => setStep(2)}
                        className="mt-3 h-11 rounded bg-[#23A6F0] px-5 text-sm font-semibold text-white disabled:bg-[#BDBDBD]"
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
                        onClick={() => setAddressForm(address)}
                        className="text-xs font-semibold text-[#23A6F0]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedShippingAddress?.id === address.id)
                            setSelectedShippingAddress(null);
                          if (selectedReceiptAddress?.id === address.id)
                            setSelectedReceiptAddress(null);
                          dispatch(deleteAddress(address.id));
                        }}
                        className="text-xs font-semibold text-[#E74040]"
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
                  onClick={() => setCardForm({})}
                  className="rounded bg-[#23A6F0] px-3 py-2 text-xs font-semibold text-white"
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
                  {cards.length ? (
                    cards.map((card) => (
                      <div
                        key={card.id || card.card_no}
                        className="flex items-center justify-between gap-3 rounded border border-[#E8E8E8] p-3"
                      >
                        <label className="flex items-center gap-3 text-sm text-[#252B42]">
                          <input
                            type="radio"
                            name="card"
                            checked={selectedCard?.id === card.id}
                            onChange={() => {
                              setSelectedCard(card);
                              dispatch(setCheckoutPayment(card));
                            }}
                          />
                          **** {String(card.card_no).slice(-4)}
                          <span className="text-xs text-[#737373]">
                            {card.name_on_card}
                          </span>
                        </label>
                        <span className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCardForm(card)}
                            className="text-xs font-semibold text-[#23A6F0]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(deleteCreditCard(card.id))}
                            className="text-xs font-semibold text-[#E74040]"
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#737373]">
                      No saved cards yet.
                    </p>
                  )}
                  <label className="mt-3 flex max-w-xs flex-col gap-1 text-sm font-semibold text-[#252B42]">
                    CCV
                    <input
                      value={ccv}
                      onChange={(event) =>
                        setCcv(
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      inputMode="numeric"
                      maxLength={4}
                      className="h-10 rounded border border-[#DDDDDD] px-3"
                    />
                  </label>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-11 rounded border border-[#23A6F0] px-5 text-sm font-semibold text-[#23A6F0]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={completeOrder}
                      disabled={submitting}
                      className="inline-flex h-11 items-center gap-2 rounded bg-[#23A6F0] px-5 text-sm font-semibold text-white disabled:bg-[#BDBDBD]"
                    >
                      {submitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      Complete Order
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
