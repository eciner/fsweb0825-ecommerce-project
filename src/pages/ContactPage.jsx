import { useState } from "react";
import { Link } from "react-router-dom";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  const [open, setOpen] = useState(false);
  return (
    <section className="w-full bg-surface px-5 py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <p className="text-sm font-bold tracking-widest text-action">
          LET US HEAR FROM YOU
        </p>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Questions about your demo shopping experience?
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Tell us about the catalog, your account or the checkout flow. This is
          a capstone demonstration; use synthetic details and never include
          passwords or payment information.
        </p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="contact-form-panel"
          onClick={() => setOpen((value) => !value)}
          className="rounded-control bg-action px-8 py-4 font-bold text-white hover:bg-ink"
        >
          {open ? "Close form" : "CONTACT OUR COMPANY"}
        </button>
        {open && (
          <div id="contact-form-panel" className="w-full">
            <ContactForm />
          </div>
        )}
        <Link to="/faq" className="font-semibold text-action">
          Browse frequently asked questions
        </Link>
      </div>
    </section>
  );
}
