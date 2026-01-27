import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 py-20">
      <h1 className="text-4xl font-bold text-[#252B42]">404</h1>
      <p className="text-base text-[#737373]">Page not found.</p>
      <Link
        to="/"
        className="rounded-md bg-[#23A6F0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#23A6F0]-dark"
      >
        Back to Home
      </Link>
    </div>
  );
}
