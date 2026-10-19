import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import BlogCard from "./BlogCard";

export default function FeaturedPosts() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <header className="mb-10 text-center">
        <p className="text-sm font-bold text-action">THE WiT JOURNAL</p>
        <h2 className="mt-3 text-3xl font-bold">Featured Posts</h2>
        <p className="mt-3 text-muted">
          Demo editorial guides to shopping and the project.
        </p>
      </header>
      <div className="flex flex-wrap gap-6">
        {blogPosts.map((post) => (
          <div key={post.slug} className="w-full md:w-[calc(33.333%-16px)]">
            <BlogCard post={post} />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center">
        <Link to="/blog" className="font-bold text-action">
          Browse the journal
        </Link>
      </p>
    </section>
  );
}
