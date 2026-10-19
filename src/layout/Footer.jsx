import { memo } from "react";
import { Link } from "react-router-dom";
import { footerSections } from "../data/informationPages";

function Footer() {
  return (
    <footer className="w-full border-t border-outline bg-white">
      <div className="bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-5 py-9 sm:flex-row">
          <Link to="/" className="text-2xl font-bold">
            WiT
          </Link>
          <p className="text-sm text-muted">
            A WorkinTech capstone. Demo checkout, no real charges.
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-9 px-5 py-12">
        {footerSections.map((section) => (
          <div key={section.title} className="min-w-36 flex-1">
            <h2 className="mb-5 font-bold">{section.title}</h2>
            <nav
              aria-label={`Footer ${section.title}`}
              className="flex flex-col gap-3"
            >
              {section.links.map(([label, href]) => (
                <Link
                  key={href}
                  to={href}
                  className="w-fit text-sm font-semibold text-muted hover:text-action hover:underline"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
        <div className="min-w-48 flex-1">
          <h2 className="mb-5 font-bold">Get in touch</h2>
          <p className="text-sm text-muted">
            Questions about the demo? Submit a message to the project API.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex rounded-control bg-action px-5 py-3 text-sm font-bold text-white hover:bg-ink"
          >
            Contact us
          </Link>
        </div>
      </div>
      <div className="bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-5 py-6 text-sm text-muted sm:flex-row">
          <p>WiT - {new Date().getFullYear()} - Capstone demonstration</p>
          <p>Made by Emre Ciner</p>
        </div>
      </div>
    </footer>
  );
}
export default memo(Footer);
