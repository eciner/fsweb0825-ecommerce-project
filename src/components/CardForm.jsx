import { useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createCreditCard, updateCreditCard } from "../store/actions";
import { isCardExpired } from "../utils/card";

export default function CardForm({ card, onDone }) {
  const dispatch = useDispatch();
  const uncertain = useSelector(
    (state) => state.client.resourceStatus.cards?.mutation === "UNKNOWN",
  );
  const now = new Date();
  const year = now.getFullYear();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...card,
      card_no: "",
      expire_month: card?.expire_month || "",
      expire_year: card?.expire_year || year,
    },
  });
  const [month, selectedYear] = useWatch({
    control,
    name: ["expire_month", "expire_year"],
  });
  const years = [
    ...new Set([
      ...(card?.expire_year ? [card.expire_year] : []),
      ...Array.from({ length: 16 }, (_, i) => year + i),
    ]),
  ].sort();
  const submit = async (values) => {
    try {
      if (isCardExpired(values.expire_month, values.expire_year))
        throw new Error("Choose a current or future expiration date.");
      const payload = {
        ...(card ? { id: card.id } : {}),
        name_on_card: values.name_on_card.trim(),
        expire_month: Number(values.expire_month),
        expire_year: Number(values.expire_year),
        ...(values.card_no ? { card_no: values.card_no } : {}),
      };
      await dispatch(
        card ? updateCreditCard(payload) : createCreditCard(payload),
      );
      onDone();
    } catch (error) {
      setError("root", { message: error.message });
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-5 flex flex-col gap-4"
      aria-label={card ? "Edit card" : "Add card"}
    >
      <p className="text-sm text-muted">
        Demo only. Use synthetic card data. No real payment is processed.
      </p>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        {card
          ? `Replacement card number (optional; keep ${card.card_no})`
          : "Card number"}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={19}
          {...register("card_no", {
            required: card ? false : "Card number is required.",
            pattern: { value: /^\d{12,19}$/, message: "Enter 12–19 digits." },
          })}
          aria-invalid={Boolean(errors.card_no)}
          aria-describedby={errors.card_no ? "card-number-error" : undefined}
          className="rounded-control border border-outline px-3 py-2"
        />
        {errors.card_no && (
          <span id="card-number-error" className="text-danger-text">
            {errors.card_no.message}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Name on card
        <input
          {...register("name_on_card", {
            required: "Name is required.",
            validate: (v) => Boolean(v.trim()) || "Name is required.",
          })}
          aria-invalid={Boolean(errors.name_on_card)}
          aria-describedby={errors.name_on_card ? "card-name-error" : undefined}
          maxLength={150}
          className="rounded-control border border-outline px-3 py-2"
        />
        {errors.name_on_card && (
          <span id="card-name-error" className="text-danger-text">
            {errors.name_on_card.message}
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
          Expiration month
          <select
            aria-invalid={Boolean(errors.expire_month)}
            aria-describedby="card-expiry-help"
            {...register("expire_month", {
              required: "Choose an expiration month.",
            })}
            className="rounded-control border border-outline px-3 py-2"
          >
            <option value="">Select month</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option
                key={m}
                value={m}
                disabled={
                  Number(selectedYear) === year && m < now.getMonth() + 1
                }
              >
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
          Expiration year
          <select
            aria-invalid={Boolean(errors.expire_year)}
            aria-describedby="card-expiry-help"
            {...register("expire_year", {
              required: "Choose an expiration year.",
            })}
            className="rounded-control border border-outline px-3 py-2"
          >
            {years.map((y) => (
              <option key={y} value={y} disabled={y < year}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p id="card-expiry-help" className="text-sm text-muted">
        Choose a current or future month and year.
      </p>
      {errors.expire_month && (
        <p role="alert" className="text-danger-text">
          {errors.expire_month.message}
        </p>
      )}
      {month && isCardExpired(month, selectedYear) && (
        <p className="text-danger-text">This expiration date is not valid.</p>
      )}
      {errors.root && (
        <p role="alert" className="text-danger-text">
          {errors.root.message}
        </p>
      )}
      <div className="flex gap-3">
        <button
          disabled={isSubmitting || uncertain}
          className="rounded-control bg-action px-5 py-3 font-semibold text-white"
        >
          {isSubmitting ? "Saving…" : "Save Card"}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onDone}
          className="rounded-control border border-outline px-5 py-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
