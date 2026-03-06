import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export default function ContactPage() {
  return (
    <section className="flex w-full justify-center bg-[#F4F4F4] px-5 py-20 md:px-8 md:py-28">
      <div className="flex w-full max-w-262.5 flex-col items-center text-center">
        <h1 className="max-w-140 text-5xl font-bold leading-[1.2] text-[#252B42] md:text-[58px] md:leading-[1.3]">
          Get answers to all your questions.
        </h1>

        <p className="mt-8 max-w-155 text-3xl leading-[1.35] text-[#737373] md:text-[32px] md:leading-[1.4]">
          Problems trying to resolve the conflict between the two major realms
          of Classical physics:
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex h-14.5 items-center justify-center rounded-[5px] bg-[#23A6F0] px-10 text-sm font-bold tracking-[0.2px] text-white transition-colors hover:bg-[#1B8FD8]"
        >
          CONTACT OUR COMPANY
        </Link>

        <div className="mt-12 flex items-center gap-6 text-[#BDBDBD]">
          <Link
            to="/"
            aria-label="Twitter"
            className="transition-colors hover:text-[#23A6F0]"
          >
            <Twitter size={32} strokeWidth={1.8} />
          </Link>
          <Link
            to="/"
            aria-label="Facebook"
            className="transition-colors hover:text-[#23A6F0]"
          >
            <Facebook size={32} strokeWidth={1.8} />
          </Link>
          <Link
            to="/"
            aria-label="Instagram"
            className="transition-colors hover:text-[#23A6F0]"
          >
            <Instagram size={32} strokeWidth={1.8} />
          </Link>
          <Link
            to="/"
            aria-label="LinkedIn"
            className="transition-colors hover:text-[#23A6F0]"
          >
            <Linkedin size={32} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </section>
  );
}