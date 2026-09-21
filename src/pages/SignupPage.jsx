import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { fetchRolesIfNeeded, signupUser } from "../store/actions";
import { getSafeReturnPath } from "../utils/navigation";
import {
  isValidStoreTaxNumber,
  isValidTurkishIban,
  isValidTurkishMobilePhone,
  normalizeIban,
  normalizeTaxNumber,
  normalizeTurkishPhone,
  trimText,
} from "../utils/signupValidation";

function resolveRoleByCode(roles, code) {
  return roles.find((role) => String(role?.code || "").toLowerCase() === code);
}

export default function SignupPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const roles = useSelector((state) => state.client.roles);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    shouldUnregister: true,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role_id: "",
      storeName: "",
      storePhone: "",
      storeTaxNo: "",
      storeBankAccount: "",
    },
  });

  const loadRoles = useCallback(({ force = false } = {}) => {
    Promise.resolve().then(() => {
      setRolesLoading(true);
      setRolesError(null);

      dispatch(fetchRolesIfNeeded({ force }))
        .catch((error) => {
          setRolesError(error?.message || "Roles could not be loaded.");
        })
        .finally(() => {
          setRolesLoading(false);
        });
    });
  }, [dispatch]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const customerRole = useMemo(
    () => resolveRoleByCode(roles, "customer"),
    [roles],
  );
  const storeRole = useMemo(() => resolveRoleByCode(roles, "store"), [roles]);
  const roleId = useWatch({ control, name: "role_id" });
  const password = useWatch({ control, name: "password" });

  useEffect(() => {
    if (customerRole && !roleId) {
      setValue("role_id", String(customerRole.id));
    }
  }, [customerRole, roleId, setValue]);

  const isStoreSelected = storeRole && String(storeRole.id) === String(roleId);

  const onSubmit = async (values) => {
    const payload = {
      name: trimText(values.name),
      email: trimText(values.email).toLowerCase(),
      password: values.password,
      role_id: Number(values.role_id),
    };

    if (isStoreSelected) {
      payload.store = {
        name: trimText(values.storeName),
        phone: normalizeTurkishPhone(values.storePhone),
        tax_no: normalizeTaxNumber(values.storeTaxNo),
        bank_account: normalizeIban(values.storeBankAccount),
      };
    }

    try {
      await Promise.resolve(dispatch(signupUser(payload)));
      toast.warning(
        "You need to click link in email to activate your account!",
      );

      const fallbackPath = "/";
      const nextPath = getSafeReturnPath(location.state?.from, fallbackPath);
      history.push(nextPath);
    } catch (error) {
      toast.error(
        error?.message || "Sign up failed. Please check your inputs.",
      );
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-md bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-[#252B42]">Create Account</h1>
        <p className="mt-2 text-sm text-[#737373]">
          Sign up to continue your shopping journey.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-[#252B42]"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name", {
                required: "Name is required.",
                validate: (value) =>
                  trimText(value).length >= 3 ||
                  "Name must be at least 3 characters.",
              })}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-[#E74040]">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-[#252B42]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /.+@.+\..+/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-[#E74040]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#252B42]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password", {
                required: "Password is required.",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
                  message:
                    "Password must be 8+ chars and include upper, lower, number and special character.",
                },
              })}
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-[#E74040]">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="passwordConfirm"
              className="text-sm font-semibold text-[#252B42]"
            >
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
              aria-invalid={Boolean(errors.passwordConfirm)}
              aria-describedby={
                errors.passwordConfirm ? "passwordConfirm-error" : undefined
              }
              {...register("passwordConfirm", {
                required: "Please confirm your password.",
                validate: (value) =>
                  value === password || "Passwords do not match.",
              })}
            />
            {errors.passwordConfirm && (
              <p id="passwordConfirm-error" className="text-xs text-[#E74040]">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="role_id"
              className="text-sm font-semibold text-[#252B42]"
            >
              Role
            </label>
            <select
              id="role_id"
              disabled={rolesLoading || roles.length === 0}
              className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
              aria-invalid={Boolean(errors.role_id)}
              aria-describedby={errors.role_id ? "role-error" : undefined}
              {...register("role_id", {
                required: "Please select a role.",
              })}
            >
              {!roles.length && (
                <option value="">
                  {rolesLoading ? "Loading roles..." : "No roles available"}
                </option>
              )}
              {roles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p id="role-error" className="text-xs text-[#E74040]">
                {errors.role_id.message}
              </p>
            )}
            {rolesError && (
              <div className="flex items-center justify-between gap-3 rounded border border-[#FFE9EA] bg-[#FFF6F6] px-3 py-2">
                <p className="text-xs text-[#E74040]">{rolesError}</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#23A6F0]"
                  onClick={() => loadRoles({ force: true })}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {isStoreSelected && (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="storeName"
                  className="text-sm font-semibold text-[#252B42]"
                >
                  Store Name
                </label>
                <input
                  id="storeName"
                  type="text"
                  className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
                  aria-invalid={Boolean(errors.storeName)}
                  aria-describedby={
                    errors.storeName ? "storeName-error" : undefined
                  }
                  {...register("storeName", {
                    required: "Store name is required.",
                    validate: (value) =>
                      trimText(value).length >= 3 ||
                      "Store name must be at least 3 characters.",
                  })}
                />
                {errors.storeName && (
                  <p id="storeName-error" className="text-xs text-[#E74040]">
                    {errors.storeName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="storePhone"
                  className="text-sm font-semibold text-[#252B42]"
                >
                  Store Phone
                </label>
                <input
                  id="storePhone"
                  type="tel"
                  className="h-11 rounded border border-[#DDDDDD] px-3 text-sm text-[#252B42] outline-none focus:border-[#23A6F0]"
                  aria-invalid={Boolean(errors.storePhone)}
                  aria-describedby={
                    errors.storePhone ? "storePhone-error" : undefined
                  }
                  {...register("storePhone", {
                    required: "Store phone is required.",
                    validate: (value) =>
                      isValidTurkishMobilePhone(value) ||
                      "Please enter a valid Turkish mobile number.",
                  })}
                />
                {errors.storePhone && (
                  <p id="storePhone-error" className="text-xs text-[#E74040]">
                    {errors.storePhone.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="storeTaxNo"
                  className="text-sm font-semibold text-[#252B42]"
                >
                  Store Tax Number
                </label>
                <input
                  id="storeTaxNo"
                  type="text"
                  className="h-11 rounded border border-[#DDDDDD] px-3 text-sm uppercase text-[#252B42] outline-none focus:border-[#23A6F0]"
                  aria-invalid={Boolean(errors.storeTaxNo)}
                  aria-describedby={
                    errors.storeTaxNo ? "storeTaxNo-error" : undefined
                  }
                  {...register("storeTaxNo", {
                    required: "Store tax number is required.",
                    validate: (value) =>
                      isValidStoreTaxNumber(value) ||
                      "Tax number must match TXXXXVXXXXXX.",
                  })}
                />
                {errors.storeTaxNo && (
                  <p id="storeTaxNo-error" className="text-xs text-[#E74040]">
                    {errors.storeTaxNo.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="storeBankAccount"
                  className="text-sm font-semibold text-[#252B42]"
                >
                  Store Bank Account (IBAN)
                </label>
                <input
                  id="storeBankAccount"
                  type="text"
                  className="h-11 rounded border border-[#DDDDDD] px-3 text-sm uppercase text-[#252B42] outline-none focus:border-[#23A6F0]"
                  aria-invalid={Boolean(errors.storeBankAccount)}
                  aria-describedby={
                    errors.storeBankAccount
                      ? "storeBankAccount-error"
                      : undefined
                  }
                  {...register("storeBankAccount", {
                    required: "Store bank account is required.",
                    validate: (value) =>
                      isValidTurkishIban(value) ||
                      "Please enter a valid Turkish IBAN (TR + 24 digits).",
                  })}
                />
                {errors.storeBankAccount && (
                  <p
                    id="storeBankAccount-error"
                    className="text-xs text-[#E74040]"
                  >
                    {errors.storeBankAccount.message}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded bg-[#23A6F0] px-4 text-sm font-semibold text-white transition hover:bg-[#1B8FD8] disabled:cursor-not-allowed disabled:bg-[#8EC2F2]"
            disabled={isSubmitting || rolesLoading || roles.length === 0}
          >
            {isSubmitting && (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? "Submitting..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#737373]">
          Already have an account?{" "}
          <Link
            to={{
              pathname: "/login",
              state: { from: getSafeReturnPath(location.state?.from, "/") },
            }}
            className="font-semibold text-[#23A6F0] hover:text-[#1B8FD8]"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
