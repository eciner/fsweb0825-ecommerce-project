import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { informationPages, faqItems } from "../data/informationPages";
import NotFound from "./NotFound";

export default function InformationPage() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  }, [pathname, hash]);
  const slug = pathname.slice(1);
  const page = informationPages[slug];
  if (slug !== "faq" && !page) return <NotFound />;
  return (
    <article className="w-full bg-surface px-5 py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <Link to="/" className="hover:text-action">
            Home
          </Link>{" "}
          / {page?.title || "Frequently asked questions"}
        </nav>
        <p className="text-sm font-bold tracking-widest text-action">
          {page?.eyebrow || "HELP WITH THE DEMO"}
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">
          {page?.title || "Frequently asked questions"}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted">
          {page?.intro ||
            "Answers grounded in the current account and checkout flow."}
        </p>
        <div className="mt-10 flex flex-col gap-5">
          {page?.sections.map((section) => (
            <section
              key={section.title}
              id={section.id}
              tabIndex={section.id ? -1 : undefined}
              className="rounded-control border border-outline bg-white p-6"
            >
              <h2 className="text-xl font-bold">{section.title}</h2>
              <p className="mt-3 leading-7 text-muted">{section.text}</p>
            </section>
          ))}
          {slug === "faq" &&
            faqItems.map(([question, answer]) => (
              <details
                key={question}
                className="rounded-control border border-outline bg-white p-5"
              >
                <summary className="font-bold">{question}</summary>
                <p className="mt-4 leading-7 text-muted">{answer}</p>
              </details>
            ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-5">
          <Link
            to="/shop"
            className="rounded-control bg-action px-6 py-3 font-bold text-white hover:bg-ink"
          >
            Browse the catalog
          </Link>
          <Link
            to="/contact"
            className="rounded-control border border-action px-6 py-3 font-bold text-action"
          >
            Contact the project
          </Link>
        </div>
      </div>
    </article>
  );
}
