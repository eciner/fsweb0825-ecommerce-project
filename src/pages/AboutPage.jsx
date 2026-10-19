import { Link } from "react-router-dom";
import { teamMembers } from "../data/teamMembers";
import TeamCard from "../components/TeamCard";
import hero from "../assets/hero-woman.jpg";

export default function AboutPage() {
  return (
    <div className="w-full bg-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 py-16 md:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <p className="text-sm font-bold tracking-widest text-action">
            ABOUT WiT
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Thoughtful shopping.
            <br />
            Built to learn.
          </h1>
          <p className="text-lg text-muted">
            A WorkinTech full-stack capstone connecting a responsive storefront
            with secure accounts, a real catalog and persistent demo orders.
          </p>
          <Link
            to="/shop"
            className="w-fit rounded-control bg-action px-8 py-3 font-bold text-white hover:bg-ink"
          >
            Explore the collection
          </Link>
        </div>
        <img
          src={hero}
          alt="Editorial fashion collection"
          className="w-full max-w-md rounded-control object-cover md:w-1/2"
        />
      </section>
      <section className="bg-surface px-5 py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Clear choices for shoppers</h2>
            <p className="mt-4 text-muted">
              Search the catalog, compare current prices and stock, save
              favorites to an account and choose delivery and billing addresses.
              Orders use prices calculated by the API.
            </p>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              A practical learning platform
            </h2>
            <p className="mt-4 text-muted">
              React and Redux power the storefront; Java, Spring Security,
              PostgreSQL and Flyway support its data. Customer and Store
              registration are available. Store accounts manage only verified owned shipment groups;
              a complete seller dashboard is not offered.
            </p>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Honest about the demo</h2>
            <p className="mt-4 text-muted">
              Checkout records a demonstration order. No card is charged and no
              shipment is arranged. Use synthetic data. This project is not a
              production payment service.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <header className="text-center">
          <h2 className="text-3xl font-bold">People, design and engineering</h2>
          <p className="mt-3 text-muted">
            Meet the contributors behind the capstone.
          </p>
        </header>
        <div className="mt-10 flex flex-wrap gap-6">
          {teamMembers.slice(0, 3).map((member) => (
            <div key={member.id} className="w-full md:w-[calc(33.333%-16px)]">
              <TeamCard member={member} />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/team" className="font-bold text-action">
            Meet all seven team members
          </Link>
        </div>
      </section>
      <section className="bg-action px-5 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Questions about the project?</h2>
        <p className="mt-4">
          Tell us which part of the experience you would like to understand.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex rounded-control border border-white px-8 py-3 font-bold hover:bg-white/10"
        >
          Contact us
        </Link>
      </section>
    </div>
  );
}
