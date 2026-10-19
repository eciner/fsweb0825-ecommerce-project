import { Controller, useForm, useWatch } from "react-hook-form";
import CityCombobox from "./CityCombobox";
import { useDispatch, useSelector } from "react-redux";
import { createAddress, updateAddress } from "../store/actions";
import { addressPayload } from "../utils/address";
import {
  dialingCodes,
  suggestedDistricts,
  suggestedNeighborhoods,
} from "../data/locations";

export default function AddressForm({ address, onDone }) {
  const dispatch = useDispatch();
  const uncertain = useSelector(
    (state) => state.client.resourceStatus.addresses?.mutation === "UNKNOWN",
  );
  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { dialCode: "+90", ...address } });
  const [city, district, dialCode] = useWatch({
    control,
    name: ["city", "district", "dialCode"],
  });
  const submit = async (values) => {
    try {
      const payload = addressPayload(values, address?.id);
      await dispatch(address ? updateAddress(payload) : createAddress(payload));
      onDone();
    } catch (error) {
      setError("root", { message: error.message });
    }
  };
  const field = (name, label, maxLength, props = {}) => (
    <label
      key={name}
      className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold"
    >
      {label}
      <input
        {...register(name, {
          required: `${label} is required.`,
          maxLength,
          validate: (v) => Boolean(v.trim()) || `${label} is required.`,
        })}
        {...props}
        maxLength={maxLength}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="rounded-control border border-outline px-3 py-2 font-normal"
      />
      {errors[name] && (
        <span id={`${name}-error`} className="text-danger-text">
          {errors[name].message}
        </span>
      )}
    </label>
  );
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-5 flex flex-col gap-4"
      aria-label={address ? "Edit address" : "Add address"}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {field("title", "Address title", 150)}
        {field("name", "Name", 150)}
        {field("surname", "Surname", 150)}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Telephone country code
          <select
            {...register("dialCode")}
            className="rounded-control border border-outline px-3 py-2"
          >
            {dialingCodes.map(([code, name]) => (
              <option key={code} value={code}>
                {name} {code === "other" ? "" : code}
              </option>
            ))}
          </select>
        </label>
        {dialCode === "other" &&
          field("customDialCode", "Dialing code (+…)", 5)}
        {field("phone", "Phone", 30, {
          type: "tel",
          autoComplete: "tel",
          placeholder: "Local number or full + international number",
        })}
      </div>
      <p className="text-sm text-muted">
        Location suggestions are partial. Type any city, district or
        neighborhood when a suggestion is missing or your address is outside
        Türkiye.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        {dialCode === "+90" ? <Controller name="city" control={control}
          rules={{ required: "City / province is required.", validate: value => Boolean(value?.trim()) || "City / province is required." }}
          render={({ field }) => <CityCombobox value={field.value} inputRef={field.ref} onBlur={field.onBlur} error={errors.city}
            onChange={value => { field.onChange(value); setValue("district", ""); setValue("neighborhoodName", ""); }} />} /> : field("city", "City / province", 100, {
          onChange: (e) => {
            setValue("city", e.target.value);
            setValue("district", "");
            setValue("neighborhoodName", "");
          },
        })}
        {field("district", "District", 100, {
          list: "district-list",
          onChange: (e) => {
            setValue("district", e.target.value);
            setValue("neighborhoodName", "");
          },
        })}
      </div>
      <datalist id="district-list">
        {suggestedDistricts(city).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Neighborhood (optional separate name)
        <input
          {...register("neighborhoodName")}
          list="neighborhood-list"
          maxLength={100}
          className="rounded-control border border-outline px-3 py-2"
        />
      </label>
      <datalist id="neighborhood-list">
        {suggestedNeighborhoods(city, district).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Neighborhood / street, building, apartment and postal details
        <textarea
          {...register("neighborhood", {
            required: "Address details are required.",
            maxLength: 500,
            validate: (v) =>
              Boolean(v.trim()) || "Address details are required.",
          })}
          rows={3}
          maxLength={500}
          aria-invalid={Boolean(errors.neighborhood)}
          aria-describedby={
            errors.neighborhood ? "address-details-error" : undefined
          }
          className="rounded-control border border-outline px-3 py-2 font-normal"
        />
        {errors.neighborhood && (
          <span id="address-details-error" className="text-danger-text">
            {errors.neighborhood.message}
          </span>
        )}
      </label>
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
          {isSubmitting ? "Saving…" : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={isSubmitting}
          className="rounded-control border border-outline px-5 py-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
