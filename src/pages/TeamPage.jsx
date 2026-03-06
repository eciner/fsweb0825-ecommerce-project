import { Facebook, Instagram, Twitter } from "lucide-react";
import { teamMembers } from "../data/teamMembers";

export default function TeamPage() {
  return (
    <section className="w-full bg-[#F4F4F4] px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-[520px] text-center">
          <h1 className="text-5xl font-bold leading-[1.2] text-[#252B42] md:text-[58px] md:leading-[1.2]">
            Meet Our Team
          </h1>
          <p className="mt-5 text-[20px] leading-[1.4] text-[#737373] md:text-[32px] md:leading-[1.35]">
            Problems trying to resolve the conflict between the two major
            realms of Classical physics: Newtonian mechanics
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-[370px] grid-cols-1 gap-8 md:mt-20 md:max-w-none md:grid-cols-3 md:gap-6">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="overflow-hidden bg-[#F8F8F8] text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="h-60 w-full object-cover md:h-57.75"
              />
              <div className="px-6 py-7 md:py-8">
                <h2 className="text-[30px] font-bold leading-[1.2] text-[#252B42]">
                  {member.name}
                </h2>
                <p className="mt-3 text-[24px] font-bold leading-[1.3] text-[#737373]">
                  {member.role}
                </p>

                <div className="mt-5 flex items-center justify-center gap-5 text-[#23A6F0]">
                  <a href="#" aria-label={`${member.name} Facebook`}>
                    <Facebook size={30} />
                  </a>
                  <a href="#" aria-label={`${member.name} Instagram`}>
                    <Instagram size={30} />
                  </a>
                  <a href="#" aria-label={`${member.name} Twitter`}>
                    <Twitter size={30} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}