import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import BlogCard from "../components/BlogCard";
import NotFound from "./NotFound";

export default function BlogArticlePage() {
  const { slug } = useParams();
  const post = blogPosts.find((article) => article.slug === slug);
  useEffect(() => {
    document.title = post
      ? `${post.title} | WiT Journal`
      : "Article not found | WiT";
    return () => {
      document.title = "WiT E-Commerce";
    };
  }, [post]);
  if (!post) return <NotFound />;
  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-14">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <Link to="/" className="hover:text-action">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/blog" className="hover:text-action">
          Journal
        </Link>
      </nav>
      <header className="max-w-3xl">
        <p className="text-sm font-bold text-action">
          {post.category} · Demo editorial
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-5 text-lg text-muted">{post.excerpt}</p>
        <p className="mt-5 text-sm text-muted">
          {post.byline} · Demo edition{" "}
          <time dateTime={post.date}>{post.date}</time> · {post.readingMinutes}{" "}
          min read
        </p>
      </header>
      <img
        src={post.image}
        alt={post.imageAlt}
        width="480"
        height="440"
        className="my-10 max-h-96 w-full rounded-control bg-surface object-contain"
      />
      <div className="flex max-w-3xl flex-col gap-9">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-bold">{section.heading}</h2>
            <p className="mt-4 leading-8 text-muted">{section.text}</p>
          </section>
        ))}
      </div>
      <ul aria-label="Article tags" className="mt-8 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
      <aside className="mt-16 border-t border-outline pt-10">
        <h2 className="mb-6 text-2xl font-bold">Keep reading</h2>
        <div className="flex flex-wrap gap-6">
          {blogPosts
            .filter((article) => article.slug !== slug)
            .map((article) => (
              <div key={article.slug} className="w-full md:w-[calc(50%-12px)]">
                <BlogCard post={article} />
              </div>
            ))}
        </div>
      </aside>
    </article>
  );
}
