import { memo } from "react";
import post1 from "../assets/posts/post-1.jpg";
import post2 from "../assets/posts/post-2.jpg";
import post3 from "../assets/posts/post-3.jpg";

import { Clock, LineChart } from "lucide-react";

const posts = [
  {
    img: post1,
    title: "Loudest à la Madison #1",
    alt: "Featured post: Loudest à la Madison #1",
  },
  {
    img: post2,
    title: "Loudest à la Madison #1",
    alt: "Featured post: Loudest à la Madison #2",
  },
  {
    img: post3,
    title: "Loudest à la Madison #1",
    alt: "Featured post: Loudest à la Madison #3",
  },
];

function FeaturedPosts() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-20">
      <div className="mb-14 text-center">
        <p className="text-sm font-semibold text-[#23A6F0]">Practice Advice</p>
        <h2 className="text-3xl font-bold text-[#252B42]">Featured Posts</h2>
        <p className="mt-2 text-sm text-[#737373]">
          Stories on style, sustainability, and how we build pieces that last
        </p>
      </div>

      <div className="flex flex-wrap gap-8">
        {posts.map((post, index) => (
          <div
            key={index}
            className="w-full overflow-hidden rounded-xl border bg-white md:w-[calc(33.333%-21.333px)]"
          >
            <div className="relative">
              <img
                src={post.img}
                alt={post.alt}
                loading="lazy"
                className="h-[300px] w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded bg-red-500 px-3 py-1 text-xs font-bold text-white">
                NEW
              </span>
            </div>

            <div className="flex flex-col gap-4 p-6">
              <div className="flex gap-3 text-xs text-[#737373]">
                <span className="text-[#23A6F0]">Google</span>
                <span>Trending</span>
                <span>New</span>
              </div>

              <h3 className="text-xl font-semibold text-[#252B42]">
                {post.title}
              </h3>

              <p className="text-sm text-[#737373]">
                We focus on ergonomics and meeting you where you work. It's only
                a keystroke away.
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-[#737373]">
                <div className="flex items-center gap-2 text-[#23A6F0]">
                  <Clock size={16} />
                  <span>22 April 2021</span>
                </div>

                <div className="flex items-center gap-2 text-[#23856D]">
                  <LineChart size={16} />
                  <span>10 comments</span>
                </div>
              </div>

              <a
                href="#"
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#23A6F0]"
              >
                Learn More <span>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(FeaturedPosts);
