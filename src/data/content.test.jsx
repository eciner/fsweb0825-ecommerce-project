import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import FeaturedPosts from "../components/FeaturedPosts";
import Footer from "../layout/Footer";
import { blogPosts } from "./blogPosts";
import { informationPages, footerSections } from "./informationPages";

it("links home editorial cards to the same unique articles as the journal", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <FeaturedPosts />
    </MemoryRouter>,
  );
  expect(new Set(blogPosts.map((post) => post.slug)).size).toBe(3);
  for (const post of blogPosts) {
    expect(post.demo).toBe(true);
    expect(post.sections.length).toBeGreaterThanOrEqual(3);
    expect(post.readingMinutes).toBeGreaterThan(0);
    expect(html).toContain(`href="/blog/${post.slug}"`);
  }
  expect(html).not.toContain("10 comments");
});
it("renders every retained footer destination and has content for each information route", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
  const established = new Set(["/about", "/team", "/blog", "/faq"]);
  for (const { links } of footerSections)
    for (const [, href] of links) {
      expect(html).toContain(`href="${href}"`);
      const path = href.split("#")[0];
      expect(
        established.has(path) || Boolean(informationPages[path.slice(1)]),
      ).toBe(true);
    }
  expect(html).not.toContain("Coming Soon");
  expect(html).not.toContain("facebook.com");
});
