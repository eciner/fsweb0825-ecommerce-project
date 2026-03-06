import { memo } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Company Info",
      links: [
        { label: "About Us", href: "/about" },
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
      {/* Brand and Social Section */}
      <div className="w-full border-b border-[#E6E6E6] bg-[#FAFAFA]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-5 px-5 py-10 sm:flex-row sm:items-center md:px-0">
          <h3 className="text-2xl font-bold text-[#252B42]">WiT</h3>
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-[#23A6F0] transition-colors hover:text-[#1a8cd4]"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </Link>
            <Link
              to="/"
              className="text-[#23A6F0] transition-colors hover:text-[#1a8cd4]"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </Link>
            <Link
              to="/"
              className="text-[#23A6F0] transition-colors hover:text-[#1a8cd4]"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Links Grid */}
      <div className="w-full py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:flex-row md:justify-between md:gap-7.5 md:px-0">
          {/* Footer Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-5">
              <h5 className="text-base font-bold text-[#252B42]">
                {section.title}
              </h5>
              <nav className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-sm font-bold text-[#737373] transition-colors hover:text-[#252B42]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="flex flex-col gap-5">
            <h5 className="text-base font-bold text-[#252B42]">Get In Touch</h5>
            <form
              className="flex flex-col gap-2.5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex h-14.5 overflow-hidden rounded-[5px] border border-[#E6E6E6] bg-[#F9F9F9]">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="flex-1 bg-transparent px-5 text-sm text-[#737373] outline-none placeholder:text-[#737373]"
                  required
                />
                <button
                  type="submit"
                  className="border-l border-[#E6E6E6] bg-[#23A6F0] px-[22.5px] text-sm text-white transition-colors hover:bg-[#1a8cd4]"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-[#737373]">Lore imp sum dolor Amit</p>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-[#FAFAFA] py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-5 text-center sm:flex-row sm:justify-between md:px-0">
          <h6 className="text-sm font-bold text-[#737373]">
            © {currentYear} WiT. All rights reserved.
          </h6>
          <p className="text-sm font-bold text-[#737373]">Made by Emre Ciner</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
