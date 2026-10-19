import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ContactForm() {
  const [reference, setReference] = useState(null);
  const [submissionId] = useState(() => crypto.randomUUID());
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  const submit = async (values) => {
    try {
      const result = await api.post("/contact", {
        ...values,
        submission_id: submissionId,
      });
      setReference(result.reference);
    } catch (reason) {
      setError("root", { message: reason.message });
    }
  };
  if (reference)
    return (
      <div
        role="status"
        className="rounded-control border border-success bg-white p-6 text-left"
      >
        <h2 className="text-xl font-bold text-success">Message received</h2>
        <p className="mt-3">
          Reference: <span className="break-all font-mono">{reference}</span>
        </p>
        <p className="mt-3 text-sm text-muted">
          Your message was stored by this demo API. No email delivery or reply
          time is promised.
        </p>
      </div>
    );
  const input = (name, label, maxLength, type = "text") => (
    <label className="flex flex-col gap-1 text-left text-sm font-semibold">
      {label}
      <input
        {...register(name, {
          required: `${label} is required.`,
          validate: (value) => Boolean(value.trim()) || `${label} is required.`,
        })}
        maxLength={maxLength}
        type={type}
        autoComplete={name}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
        className="rounded-control border border-outline px-3 py-2"
      />
      {errors[name] && (
        <span id={`contact-${name}-error`} className="text-danger-text">
          {errors[name].message}
        </span>
      )}
    </label>
  );
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex flex-col gap-4 rounded-control border border-outline bg-white p-5"
      aria-label="Contact form"
    >
      <h2 className="text-left text-xl font-bold">Send a message</h2>
      {input("name", "Name", 150)}
      {input("email", "Email", 254, "email")}
      {input("subject", "Subject", 150)}
      <label className="flex flex-col gap-1 text-left text-sm font-semibold">
        Message
        <textarea
          {...register("message", {
            required: "Message is required.",
            validate: (value) =>
              value.trim().length >= 10 || "Enter at least ten characters.",
          })}
          minLength={10}
          maxLength={3000}
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className="rounded-control border border-outline px-3 py-2"
        />
        {errors.message && (
          <span id="contact-message-error" className="text-danger-text">
            {errors.message.message}
          </span>
        )}
      </label>
      <div hidden aria-hidden="true">
        <label>
          Website
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="text-left text-sm text-muted">
        Use synthetic data only. Name, email and message are stored until the
        demo database is cleared; automatic deletion and email notification are
        not implemented. Read the{" "}
        <Link to="/privacy" className="underline">
          sample privacy notice
        </Link>
        .
      </p>
      <label className="flex items-start gap-3 text-left text-sm">
        <input
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={
            errors.consent ? "contact-consent-error" : undefined
          }
          {...register("consent", { required: "Consent is required." })}
          className="mt-1"
        />
        I understand and agree to this demo submission storage.
      </label>
      {errors.consent && (
        <p
          id="contact-consent-error"
          className="text-left text-sm text-danger-text"
        >
          {errors.consent.message}
        </p>
      )}
      {errors.root && (
        <p role="alert" className="text-left text-danger-text">
          {errors.root.message}
        </p>
      )}
      <button
        disabled={isSubmitting}
        className="rounded-control bg-action px-5 py-3 font-bold text-white hover:bg-ink"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
