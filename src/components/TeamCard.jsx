export default function TeamCard({ member }) {
  const initials = member.name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  return (
    <article className="flex h-full flex-col items-center rounded-control border border-outline bg-white p-7 text-center shadow-sm">
      <div
        aria-hidden="true"
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-3xl font-bold text-action"
      >
        {initials}
      </div>
      <h2 className="text-xl font-bold">{member.name}</h2>
      <p className="mt-2 text-sm font-semibold text-success">{member.role}</p>
      <p className="mt-4 text-sm text-muted">{member.responsibility}</p>
    </article>
  );
}
