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
import { isCardExpired } from "../utils/card";

function Input({ label, name, register, rules, error, type = "text" }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-[#252B42]">
      <span>{label}</span>
      <input
        type={type}
        className="h-10 rounded border border-[#DDDDDD] px-3 font-normal outline-none focus:border-[#23A6F0]"
        {...register(name, rules)}
      />
      {error && (
        <span className="text-xs font-normal text-[#E74040]">
          {error.message}
        </span>
      )}
    </label>
  );
}

function AddressDetailsField({ register, rules, error }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-[#252B42] sm:col-span-2">
      <span>Neighborhood / Address Details</span>
      <textarea
        rows="3"
        className="rounded border border-[#DDDDDD] px-3 py-2 font-normal outline-none focus:border-[#23A6F0]"
        {...register("neighborhood", rules)}
      />
      {error && (
        <span className="text-xs font-normal text-[#E74040]">
          {error.message}
        </span>
      )}
    </label>
  );
}

function AddressForm({ address, onDone }) {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
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
        rules={{ required: "Address title is required." }}
        error={errors.title}
      />
      <Input
        label="Name"
        name="name"
        register={register}
        rules={{ required: "Name is required." }}
        error={errors.name}
      />
      <Input
        label="Surname"
        name="surname"
        register={register}
        rules={{ required: "Surname is required." }}
        error={errors.surname}
      />
      <Input
        label="Phone"
        name="phone"
        register={register}
        rules={{ required: "Phone is required." }}
        error={errors.phone}
      />
      <label className="flex flex-col gap-1 text-sm font-semibold text-[#252B42]">
        <span>City</span>
        <select
          className="h-10 rounded border border-[#DDDDDD] px-3 font-normal outline-none focus:border-[#23A6F0]"
          {...register("city", { required: "City is required." })}
        >
          <option value="">Select a city</option>
          <option value="istanbul">Istanbul</option>
          <option value="ankara">Ankara</option>
          <option value="izmir">Izmir</option>
          <option value="bursa">Bursa</option>
          <option value="antalya">Antalya</option>
        </select>
      </label>
      {errors.city && (
        <span className="text-xs font-normal text-[#E74040]">
          {errors.city.message}
        </span>
      )}
      <Input
        label="District"
        name="district"
        register={register}
        rules={{ required: "District is required." }}
        error={errors.district}
      />
      <AddressDetailsField
        register={register}
        rules={{ required: "Address details are required." }}
        error={errors.neighborhood}
      />
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
    getValues,
    formState: { isSubmitting, errors },
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
        rules={{
          required: "Card number is required.",
          pattern: {
            value: /^\d{12,19}$/,
            message: "Enter a valid card number.",
          },
        }}
        error={errors.card_no}
      />
      <Input
        label="Name on Card"
        name="name_on_card"
        register={register}
        rules={{ required: "Cardholder name is required." }}
        error={errors.name_on_card}
      />
      <Input
        label="Expiration Month"
        name="expire_month"
        register={register}
        type="number"
        rules={{
          required: "Expiration month is required.",
          min: { value: 1, message: "Enter a month from 1 to 12." },
          max: { value: 12, message: "Enter a month from 1 to 12." },
          validate: (value) => {
            return !isCardExpired(value, getValues("expire_year")) || "This card is expired.";
          },
        }}
        error={errors.expire_month}
      />
      <Input
        label="Expiration Year"
        name="expire_year"
        register={register}
        type="number"
        rules={{
          required: "Expiration year is required.",
          validate: (value) => {
            return !isCardExpired(getValues("expire_month"), value) || "This card is expired.";
          },
        }}
        error={errors.expire_year}
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
  const [addressLoadError, setAddressLoadError] = useState("");
  const [cardLoadError, setCardLoadError] = useState("");

  useEffect(() => {
    dispatch(fetchAddresses()).catch((error) => {
      setAddressLoadError(error.message);
      toast.error(error.message);
    });
    dispatch(fetchCreditCards()).catch((error) => {
      setCardLoadError(error.message);
      toast.error(error.message);
    });
  }, [dispatch]);
  useEffect(() => {
    if (selectedShippingAddress) {
      const nextShipping = addresses.find(
        (address) => address.id === selectedShippingAddress.id,
      );
      setSelectedShippingAddress(nextShipping || null);
    }
    if (selectedReceiptAddress) {
      const nextReceipt = addresses.find(
        (address) => address.id === selectedReceiptAddress.id,
      );
      setSelectedReceiptAddress(nextReceipt || null);
    }
    if (selectedCard) {
      const nextCard = cards.find((card) => card.id === selectedCard.id);
      setSelectedCard(nextCard || null);
    }
  }, [
    addresses,
    cards,
    selectedCard,
    selectedReceiptAddress,
    selectedShippingAddress,
  ]);
  useEffect(() => {
    dispatch(
      setCheckoutAddress(
        selectedShippingAddress || selectedReceiptAddress
          ? { shipping: selectedShippingAddress, receipt: selectedReceiptAddress }
          : {},
      ),
    );
  }, [dispatch, selectedReceiptAddress, selectedShippingAddress]);
  useEffect(() => {
    dispatch(setCheckoutPayment(selectedCard || {}));
  }, [dispatch, selectedCard]);
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
                  {addressLoadError ? (
                    <div className="flex items-center justify-between text-sm text-[#E74040]" role="alert">
                      <span>{addressLoadError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressLoadError("");
                          dispatch(fetchAddresses()).catch((error) => {
                            setAddressLoadError(error.message);
                          });
                        }}
                        className="font-semibold"
                      >
                        Retry
                      </button>
                    </div>
                  ) : addresses.length ? (
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
                          dispatch(deleteAddress(address.id)).catch((error) =>
                            toast.error(error.message),
                          );
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
                  {cardLoadError ? (
                    <div className="flex items-center justify-between text-sm text-[#E74040]" role="alert">
                      <span>{cardLoadError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCardLoadError("");
                          dispatch(fetchCreditCards()).catch((error) => {
                            setCardLoadError(error.message);
                          });
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
                            onClick={() =>
                              dispatch(deleteCreditCard(card.id)).catch((error) =>
                                toast.error(error.message),
                              )
                            }
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
