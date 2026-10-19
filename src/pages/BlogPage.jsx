import { useEffect } from "react";
import { blogPosts } from "../data/blogPosts";
import BlogCard from "../components/BlogCard";

export default function BlogPage() {
  useEffect(() => {
    document.title = "Journal | WiT";
    return () => {
      document.title = "WiT E-Commerce";
    };
  }, []);
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm font-bold tracking-widest text-action">
          THE WiT JOURNAL
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">
          Good choices start with clear information.
        </h1>
        <p className="mt-5 text-lg text-muted">
          Shopping and project guides written as demo editorial content. No
          customer stories, engagement counts or external endorsements are
          implied.
        </p>
      </header>
      <div className="flex flex-wrap gap-6">
        {blogPosts.map((post) => (
          <div key={post.slug} className="w-full md:w-[calc(33.333%-16px)]">
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
