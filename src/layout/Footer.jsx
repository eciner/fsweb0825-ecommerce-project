import { memo } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Company Info",
      links: [
        { label: "About Us", href: "/" },
        { label: "Carrier", href: "/" },
        { label: "We are hiring", href: "/" },
        { label: "Blog", href: "/" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/" },
        { label: "Terms of Service", href: "/" },
        { label: "Cookie Policy", href: "/" },
        { label: "License", href: "/" },
      ],
    },
    {
      title: "Features",
      links: [
        { label: "Business Marketing", href: "/" },
        { label: "User Analytic", href: "/" },
        { label: "Live Chat", href: "/" },
        { label: "Unlimited Support", href: "/" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "IOS & Android", href: "/" },
        { label: "Watch a Demo", href: "/" },
        { label: "Customers", href: "/" },
        { label: "API", href: "/" },
      ],
    },
  ];

  return (
    <footer className="flex w-full flex-col bg-white">
      {/* Main Footer Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        {/* Brand and Social Section */}
        <div className="mb-12 flex flex-col items-start gap-6 border-b border-[#E8E8E8] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <h3 className="text-2xl font-bold text-[#252B42]">WiT</h3>
            <p className="text-sm text-[#737373]">E-Commerce Solutions</p>
          </div>

          <div className="flex items-center gap-4 text-[#252B42]">
            <button
              type="button"
              className="transition-colors hover:text-[#23A6F0]"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </button>
            <button
              type="button"
              className="transition-colors hover:text-[#23A6F0]"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </button>
            <button
              type="button"
              className="transition-colors hover:text-[#23A6F0]"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </button>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="mb-12 flex flex-col gap-10 sm:gap-8">
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-8">
            {/* Column 1 & 2 */}
            {footerSections.slice(0, 2).map((section) => (
              <div
                key={section.title}
                className="flex flex-col gap-3 sm:flex-1"
              >
                <h4 className="font-bold text-[#252B42]">{section.title}</h4>
                <div className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-sm text-[#737373] transition-colors hover:text-[#252B42]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-8">
            {/* Column 3 & 4 */}
            {footerSections.slice(2, 4).map((section) => (
              <div
                key={section.title}
                className="flex flex-col gap-3 sm:flex-1"
              >
                <h4 className="font-bold text-[#252B42]">{section.title}</h4>
                <div className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-sm text-[#737373] transition-colors hover:text-[#252B42]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-8 flex flex-col gap-3 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-6 sm:p-8">
          <h4 className="font-bold text-[#252B42]">Get in Touch</h4>
          <p className="text-sm text-[#737373]">
            Subscribe to our newsletter for updates and exclusive offers.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row sm:gap-0">
            <div className="flex flex-1 overflow-hidden rounded border border-[#E8E8E8] bg-white">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-1 px-4 py-3 text-sm outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded bg-[#23A6F0] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1b8dd6] sm:rounded-none"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-[#737373]">
            Stay in touch for updates and special offers.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex w-full border-t border-[#E8E8E8] bg-[#FAFAFA]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs font-semibold text-[#737373]">
            © {currentYear} WiT. All rights reserved.
          </p>
          <p className="text-xs text-[#737373]">Made by Emre Ciner</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
