import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-control border border-outline bg-white shadow-sm">
      <Link to={`/blog/${post.slug}`}>
        <img
          src={post.image}
          alt={post.imageAlt}
          loading="lazy"
          width="480"
          height="440"
          className="h-56 w-full object-contain"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-action">
          {post.category} · Demo editorial
        </p>
        <h2 className="text-xl font-bold">
          <Link to={`/blog/${post.slug}`} className="hover:text-action">
            {post.title}
          </Link>
        </h2>
        <p className="text-sm text-muted">{post.excerpt}</p>
        <p className="mt-auto text-xs text-muted">
          <time dateTime={post.date}>{post.date}</time> · {post.readingMinutes}{" "}
          min read
        </p>
        <Link to={`/blog/${post.slug}`} className="w-fit font-bold text-action">
          Read article →
        </Link>
      </div>
    </article>
  );
}
