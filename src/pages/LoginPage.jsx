import { Link, useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { loginUser } from "../store/actions";
import { getSafeReturnPath } from "../utils/navigation";

export default function LoginPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(
        loginUser({
          email: values.email.trim().toLowerCase(),
          password: values.password,
          rememberMe: Boolean(values.remember),
        }),
      );

      toast.success("Logged in successfully.");
      const nextPath = getSafeReturnPath(location.state?.from, "/");
      history.push(nextPath);
    } catch (error) {
      toast.error(error?.message || "Login failed. Please try again.");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-md bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-[#252B42]">Login</h1>
        <p className="mt-2 text-sm text-[#737373]">
          Welcome back. Continue where you left off.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
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
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
              })}
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-[#E74040]">
                {errors.password.message}
              </p>
            )}
          </div>

          <label className="mt-1 inline-flex items-center gap-2 text-sm text-[#737373]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#BDBDBD] text-[#23A6F0]"
              {...register("remember")}
            />
            Remember me
          </label>

          <button
            type="submit"
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded bg-[#23A6F0] px-4 text-sm font-semibold text-white transition hover:bg-[#1B8FD8] disabled:cursor-not-allowed disabled:bg-[#8EC2F2]"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#737373]">
          New here?{" "}
          <Link
            to={{
              pathname: "/signup",
              state: { from: getSafeReturnPath(location.state?.from, "/") },
            }}
            className="font-semibold text-[#23A6F0] hover:text-[#1B8FD8]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
