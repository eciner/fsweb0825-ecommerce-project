import { useHistory, useLocation } from "react-router-dom";
import { buildShopSearch, readShopSearch } from "../utils/query";

export default function HeaderSearch({ onDone }) {
  const history = useHistory();
  const location = useLocation();
  const current = readShopSearch(location.search);
  const submit = (event) => {
    event.preventDefault();
    const filter = new FormData(event.currentTarget).get("filter");
    history.push(
      `/shop${buildShopSearch({ filter, page: 1 })}`,
    );
    onDone();
  };
  return (
    <form
      key={`${location.pathname}${location.search}`}
      role="search"
      onSubmit={submit}
      className="mx-auto flex w-full max-w-6xl flex-wrap items-end gap-3 px-4 py-4"
    >
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold">
        Search products
        <input
          name="filter"
          autoFocus
          defaultValue={current.filter || ""}
          type="search"
          maxLength={200}
          placeholder="Name or description"
          className="rounded-control border border-outline px-3 py-2"
        />
      </label>
      <button className="rounded-control bg-action px-4 py-2 font-bold text-white">
        Search
      </button>
      <button
        type="button"
        className="rounded-control border border-outline px-4 py-2"
        onClick={() => {
          history.push(
            "/shop",
          );
          onDone();
        }}
      >
        Clear
      </button>
    </form>
  );
}
