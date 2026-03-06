import { Facebook, Instagram, Play, Twitter } from "lucide-react";
import { teamMembers } from "../data/teamMembers";

import heroWoman from "../assets/hero-woman-2.png";
import ctaImage from "../assets/hero-woman.jpg";

const stats = [
  { value: "15K", label: "Happy Customers" },
  { value: "150K", label: "Monthly Visitors" },
  { value: "15", label: "Countries Worldwide" },
  { value: "100+", label: "Top Partners" },
];

const logos = ["Hooli", "Lyft", "Stripe", "AWS", "Reddit", "Wave"];

export default function AboutPage() {
  return (
    <section className="w-full bg-[#F6F6F6]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-6">
          <div className="max-w-[420px] text-center md:text-left">
            <p className="text-sm font-bold tracking-[0.2px] text-[#252B42]">
              ABOUT COMPANY
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-[0.2px] text-[#252B42] md:text-[58px] md:leading-[80px]">
              ABOUT US
            </h1>
            <p className="mt-6 text-xl leading-[30px] text-[#737373] md:text-2xl md:leading-[36px]">
              We know how large objects will act, but things on a small scale
            </p>
            <button
              type="button"
              className="mt-8 inline-flex h-13 items-center justify-center rounded-[5px] bg-[#23A6F0] px-10 text-sm font-bold text-white"
            >
              Get Quote Now
            </button>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] md:max-w-none">
            <div className="absolute -left-3 top-5 h-6 w-6 rounded-full bg-[#E77C8D] opacity-30" />
            <div className="absolute right-4 top-16 h-4 w-4 rounded-full bg-[#977DF4] opacity-50" />
            <div className="absolute right-0 top-40 h-5 w-5 rounded-full bg-[#E77C8D] opacity-20" />
            <img
              src={heroWoman}
              alt="Woman holding shopping bags"
              className="relative z-10 w-full object-contain"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 md:items-start">
          <div className="max-w-[380px]">
            <p className="text-sm font-semibold text-[#E74040]">
              Problems trying
            </p>
            <h2 className="mt-3 text-[24px] font-bold leading-[32px] text-[#252B42] md:text-[28px] md:leading-[40px]">
              Met minim Mollie non desert Alamo est sit cliquey dolor do met
              sent.
            </h2>
          </div>
          <p className="text-sm leading-5 text-[#737373] md:max-w-[460px] md:text-base md:leading-6">
            Problems trying to resolve the conflict between the two major realms
            of Classical physics: Newtonian mechanics
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-y-9 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label}>
              <h3 className="text-[40px] font-bold leading-[1.4] text-[#252B42]">
                {stat.value}
              </h3>
              <p className="text-sm font-bold text-[#737373]">{stat.label}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[20px]">
          <div className="relative h-75 w-full md:h-130">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80"
              alt="Mountain view"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Play intro video"
              className="absolute left-1/2 top-1/2 flex h-18 w-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#23A6F0] text-white"
            >
              <Play size={26} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[700px] text-center md:mt-24">
          <h2 className="text-[40px] font-bold text-[#252B42] md:text-5xl">
            Meet Our Team
          </h2>
          <p className="mt-3 text-sm leading-5 text-[#737373]">
            Problems trying to resolve the conflict between the two major realms
            of Classical physics: Newtonian mechanics
          </p>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {teamMembers.map((member) => (
            <article key={member.id} className="overflow-hidden text-center">
              <img
                src={member.image}
                alt={member.name}
                className="h-75 w-full object-cover md:h-57.75"
              />
              <div className="py-8">
                <h3 className="text-base font-bold text-[#252B42]">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-[#737373]">
                  {member.role}
                </p>
                <div className="mt-3 flex items-center justify-center gap-5 text-[#23A6F0]">
                  <a href="#" aria-label={`${member.name} Facebook`}>
                    <Facebook size={20} />
                  </a>
                  <a href="#" aria-label={`${member.name} Instagram`}>
                    <Instagram size={20} />
                  </a>
                  <a href="#" aria-label={`${member.name} Twitter`}>
                    <Twitter size={20} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="w-full bg-[#FAFAFA] px-5 py-16">
        <div className="mx-auto w-full max-w-6xl text-center">
          <h2 className="text-[40px] font-bold text-[#252B42] md:text-5xl">
            Big Companies Are Here
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-5 text-[#737373]">
            Problems trying to resolve the conflict between the two major realms
            of Classical physics: Newtonian mechanics
          </p>
          <div className="mt-10 grid grid-cols-2 gap-8 text-4xl font-bold text-[#8C8C8C] md:grid-cols-6 md:text-[46px]">
            {logos.map((logo) => (
              <span key={logo} className="opacity-80">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid w-full md:grid-cols-2">
        <div className="bg-[#2A7CC7] px-8 py-16 text-white md:px-20 md:py-24">
          <p className="text-sm font-bold">WORK WITH US</p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.3] md:text-5xl">
            Now Let&apos;s grow Yours
          </h2>
          <p className="mt-4 max-w-[430px] text-sm leading-5 text-[#DCEEFF] md:text-base md:leading-6">
            The gradual accumulation of information about atomic and small-scale
            behavior during the first quarter of the 20th
          </p>
          <button
            type="button"
            className="mt-8 inline-flex h-13 items-center justify-center rounded-[5px] border border-white px-10 text-sm font-bold"
          >
            Button
          </button>
        </div>

        <div className="min-h-90 bg-[#EDEDED]">
          <img
            src={ctaImage}
            alt="Model portrait"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
