import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { buildShopSearch } from "../utils/query";

function FilterFields({ query, categories, onApply, onClear }) {
  const [gender, setGender] = useState(query.gender || "");
  const [category, setCategory] = useState(String(query.category || ""));
  const [error, setError] = useState("");
  const submit = event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.min_price && data.max_price && Number(data.min_price) > Number(data.max_price)) {
      setError("Minimum price must not exceed maximum price."); return;
    }
    setError("");
    onApply({ ...query, ...data, in_stock: data.in_stock === "on", page: 1 });
  };
  return <form aria-label="Shop filters" onSubmit={submit} className="flex flex-col gap-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">Collection
        <select name="gender" className="control-input" value={gender} onChange={event => { setGender(event.target.value); setCategory(""); }}>
          <option value="">All collections</option><option value="k">KADIN</option><option value="e">ERKEK</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Category
        <select name="category" className="control-input" value={category} onChange={event => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.filter(item => !gender || item.gender === gender).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Minimum price
        <input name="min_price" type="number" min="0" step="0.01" max="9999999999.99" className="control-input" defaultValue={query.min_price ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Maximum price
        <input name="max_price" type="number" min="0" step="0.01" max="9999999999.99" className="control-input" defaultValue={query.max_price ?? ""} />
      </label>
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="in_stock" defaultChecked={Boolean(query.in_stock)} /> In stock only</label>
    {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
    <div className="flex flex-wrap gap-3">
      <button className="control-button bg-action text-white hover:bg-ink">Apply filters</button>
      <button type="button" className="control-button border border-outline hover:bg-surface" onClick={onClear}>Clear filters</button>
    </div>
  </form>;
}

export default function ShopFilters({ query, categories, locationKey }) {
  const history = useHistory();
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  const apply = values => { history.push(`/shop${buildShopSearch(values)}`); setOpen(false); };
  // Keep independent search/sort and the current collection when clearing refinements.
  const clear = () => apply({ filter: query.filter, sort: query.sort, gender: query.gender });
  const chips = [
    ...(query.gender ? [["gender", query.gender === "k" ? "KADIN" : "ERKEK"]] : []),
    ...(query.category ? [["category", categories.find(item => item.id === query.category)?.title || `Category #${query.category}`]] : []),
    ...(query.min_price !== undefined ? [["min_price", `Min $${query.min_price}`]] : []),
    ...(query.max_price !== undefined ? [["max_price", `Max $${query.max_price}`]] : []),
    ...(query.in_stock ? [["in_stock", "In stock"]] : []),
  ];
  return <section aria-label="Product refinements" className="mx-auto w-full max-w-6xl px-4 pt-6">
    <button className="control-button border border-outline bg-white lg:hidden" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>Filters</button>
    <div className="panel hidden lg:block" key={locationKey}>
      <FilterFields query={query} categories={categories} onApply={apply} onClear={clear} />
    </div>
    <dialog ref={dialog} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} aria-labelledby="filter-dialog-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-control border border-outline bg-white p-5 text-ink shadow-xl backdrop:bg-ink/60">
      {open && <><div className="mb-5 flex items-center justify-between gap-3"><h2 id="filter-dialog-title" className="text-xl font-bold">Filter products</h2>
        <button className="control-button border border-outline" onClick={() => setOpen(false)} autoFocus>Close filters</button></div>
        <FilterFields key={locationKey} query={query} categories={categories} onApply={apply} onClear={clear} /></>}
    </dialog>
    {chips.length > 0 && <div aria-label="Active filters" className="mt-4 flex flex-wrap gap-2">
      {chips.map(([key, label]) => <button key={key} aria-label={`Remove filter ${label}`} className="rounded-full border border-outline bg-white px-3 py-2 text-xs font-semibold hover:bg-surface"
        onClick={() => apply({ ...query, [key]: null, page: 1 })}>{label} <span aria-hidden="true">×</span></button>)}
    </div>}
  </section>;
}
