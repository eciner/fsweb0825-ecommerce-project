import { Link } from "react-router-dom";
import { teamMembers } from "../data/teamMembers";
import TeamCard from "../components/TeamCard";

export default function TeamPage() {
  return (
    <section className="w-full bg-surface px-4 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-widest text-action">
            THE PEOPLE BEHIND THE PROJECT
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">Meet our team</h1>
          <p className="mt-5 text-lg text-muted">
            Seven complementary roles, working toward a coherent shopping
            experience. Descriptions below explain each role's contribution; no
            personal biographies or unverified profiles are implied.
          </p>
        </header>
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <TeamCard member={member} />
            </div>
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link to="/about" className="font-bold text-action">
            About the project
          </Link>
        </p>
      </div>
    </section>
  );
}
