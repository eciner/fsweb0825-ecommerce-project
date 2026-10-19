import { useEffect, useId, useState } from "react";
import { popularCities as popular, orderedProvinces, foldCity, matchingCities } from "../utils/city";

export default function CityCombobox({ value = "", onChange, onBlur, error, inputRef }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [id, open, active]);
  const matches = matchingCities(query);
  const manual = query.trim() && !orderedProvinces.some(city => foldCity(city) === foldCity(query));
  const options = manual ? [...matches, query.trim()] : matches;
  const choose = city => { onChange(city); setOpen(false); setActive(-1); };
  const keyDown = event => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault(); setOpen(true);
      setActive(index => event.key === "ArrowDown" ? Math.min(options.length - 1, index + 1) : Math.max(0, index < 0 ? options.length - 1 : index - 1));
    } else if (open && ["Home", "End"].includes(event.key)) {
      event.preventDefault(); setActive(event.key === "Home" ? 0 : options.length - 1);
    } else if (open && event.key === "Enter" && active >= 0) {
      event.preventDefault(); choose(options[active]);
    } else if (open && event.key === "Escape") { event.preventDefault(); setOpen(false); }
  };
  return <div className="relative min-w-0 flex-1" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); onBlur?.(); }}>
    <label htmlFor={id} className="mb-1 block text-sm font-semibold">City / province</label>
    <input id={id} ref={inputRef} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`}
      aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
      aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : `${id}-help`}
      value={value} maxLength={100} autoComplete="address-level1" className="control-input"
      onFocus={() => { setQuery(""); setActive(-1); setOpen(true); }} onKeyDown={keyDown}
      onChange={event => { onChange(event.target.value); setQuery(event.target.value); setActive(-1); setOpen(true); }} />
    {open && <ul id={`${id}-options`} role="listbox" aria-label="Turkish provinces" className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-control border border-outline bg-white py-1 shadow-lg">
      {options.map((city, index) => <li key={city} role="presentation">
        {(index === 0 || (popular.includes(options[index - 1]) && !popular.includes(city))) && <span className="block bg-surface px-3 py-2 text-xs font-bold text-muted">{popular.includes(city) ? "Popular cities" : city === query.trim() && manual ? "Manual entry" : "All other provinces · A–Z"}</span>}
        <div role="option" id={`${id}-option-${index}`} aria-selected={active === index} onMouseDown={event => event.preventDefault()}
          onClick={() => choose(city)} className={`cursor-pointer px-3 py-2 text-sm hover:bg-brand/10 ${active === index ? "bg-brand/10 text-action" : ""}`}>
          {city}{manual && index === options.length - 1 ? " (manual city)" : ""}
        </div>
      </li>)}
    </ul>}
    <p id={`${id}-help`} className="mt-1 text-xs text-muted">Search 81 provinces. İstanbul, Ankara and İzmir appear first. Manual city entry remains available.</p>
    {error && <p id={`${id}-error`} className="text-sm text-danger-text">{error.message}</p>}
  </div>;
}
