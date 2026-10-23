import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import api from "../services/api";
import { ShipmentCard } from "../components/ShipmentDetails";
import { shipmentLabel, shipmentStates } from "../utils/shipment";

function ShipmentEditor({ shipment, admin, onSaved }) {
  const [intent, setIntent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const payload = intent || { ...fields, request_id: crypto.randomUUID(), version: shipment.version };
    setIntent(payload); setBusy(true); setError("");
    try { const updated = await api.put(`/fulfillment/shipments/${shipment.id}`, payload); onSaved(updated); }
    catch (reason) {
      if (!reason.status || reason.status >= 500 || uncertain) {
        setUncertain(true); setError("Outcome uncertain. Retry this same update, or refresh shipments and review the recorded history before another change.");
      } else { setIntent(null); setError(reason.message); }
    } finally { setBusy(false); }
  };
  const index = shipmentStates.indexOf(shipment.status);
  return <form aria-label={`Manage shipment ${shipment.id}`} onSubmit={submit} className="flex flex-col gap-3 border-t border-outline pt-4">
    <fieldset disabled={busy || uncertain || (!admin && shipment.status === "DELIVERED")} className="flex flex-col gap-3 disabled:opacity-70">
      <legend className="mb-2 font-semibold">Update fulfillment</legend>
      <label className="text-sm font-semibold">Status<select name="status" className="control-input mt-1" defaultValue={shipment.status}>
        {shipmentStates.slice(index, index + 2).map(state => <option key={state} value={state}>{shipmentLabel(state)}</option>)}
      </select></label>
      <label className="text-sm font-semibold">Carrier<input name="carrier" maxLength={100} className="control-input mt-1" defaultValue={shipment.carrier || ""} /></label>
      <label className="text-sm font-semibold">Tracking number<input name="tracking_number" maxLength={100} className="control-input mt-1" defaultValue={shipment.tracking_number || ""} /></label>
    </fieldset>
    <p className="text-xs text-muted">Move one step forward. Shipping requires actual carrier and tracking details. Reversals are forbidden; tracking corrections are recorded in history.</p>
    {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
    <button disabled={busy || (!admin && shipment.status === "DELIVERED")} className="control-button w-fit bg-action text-white hover:bg-ink">{busy ? "Saving…" : uncertain ? "Retry same update" : "Save shipment"}</button>
  </form>;
}

function OwnershipPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/fulfillment/products?page=${page}&size=10`), api.get("/fulfillment/stores")])
      .then(([products, stores]) => { if (active) { setData({ ...products, stores, attempt }); setError(""); setUncertain(false); } })
      .catch(reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [page, attempt]);
  const assign = async (event, product) => {
    event.preventDefault(); if (busy || uncertain) return; setBusy(true); setError("");
    const store = new FormData(event.currentTarget).get("store_id");
    try {
      const updated = await api.put(`/fulfillment/products/${product.id}/store`, { store_id: store ? Number(store) : null });
      setData(current => ({ ...current, products: current.products.map(item => item.id === product.id ? updated : item) }));
    } catch (reason) { const unknown = !reason.status || reason.status >= 500; setUncertain(unknown); setError(unknown ? "Assignment outcome is unknown. Refresh ownership before another change." : reason.message); }
    finally { setBusy(false); }
  };
  return <section className="mt-4 flex flex-col gap-4" aria-label="Verified product ownership">
    <p className="text-sm text-muted">Admin assignment establishes ownership for future orders only. Legacy numeric store IDs and historical shipments are never reassigned by this operation. Every change is audited.</p>
    {error && <p role="alert" className="text-danger-text">{error}</p>}
    <button className="control-button w-fit border border-outline" onClick={() => setAttempt(value => value + 1)}>Refresh ownership</button>
    {!data || data.page !== page || data.attempt !== attempt ? <p role="status">Loading verified ownership…</p> : <>
      {data.products.map(product => <form key={`${product.id}-${product.store_id}-${page}`} onSubmit={event => assign(event, product)} className="flex flex-col gap-3 border-t border-outline pt-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-sm font-semibold">#{product.id} · {product.name}
          <select name="store_id" className="control-input mt-1" defaultValue={product.store_id || ""} disabled={busy || uncertain}>
            <option value="">Unassigned · Admin managed</option>{data.stores.map(store => <option key={store.id} value={store.id}>{store.name} · #{store.id}</option>)}
          </select>
        </label><button disabled={busy || uncertain} className="control-button border border-outline hover:bg-surface">Save verified owner</button>
      </form>)}
      <div className="flex gap-3"><button className="control-button border border-outline" disabled={!page || busy} onClick={() => setPage(value => value - 1)}>Previous products</button>
        <button className="control-button border border-outline" disabled={(page + 1) * 10 >= data.total || busy} onClick={() => setPage(value => value + 1)}>Next products</button></div>
    </>}
  </section>;
}

export default function FulfillmentPage() {
  const user = useSelector(state => state.client.user);
  const revision = useSelector(state => state.client.sessionRevision);
  return <Management key={`${user.id || user.email}:${revision}`} user={user} />;
}
function Management({ user }) {
  const role = user.role_code || user.roleCode;
  const allowed = ["admin", "store"].includes(role);
  const history = useHistory(), location = useLocation();
  const search = new URLSearchParams(location.search);
  const status = shipmentStates.includes(search.get("status")) ? search.get("status") : "";
  const page = Math.max(0, Math.min(1000000, Number.parseInt(search.get("page"), 10) || 0));
  const [result, setResult] = useState(null), [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState(""), [ownership, setOwnership] = useState(false);
  const key = `${status}:${page}:${attempt}`;
  const readState = result?.key === key ? result : { status: "loading" };
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    api.get(`/fulfillment/shipments?page=${page}&size=10${status ? `&status=${status}` : ""}`).then(data => { if (active) { setResult({ data, key, status: "success" }); } })
      .catch(reason => { if (active) setResult({ key, status: "error", error: reason.message || "Shipments could not be loaded." }); });
    return () => { active = false; };
  }, [allowed, page, status, key, attempt]);
  const navigate = (nextStatus, nextPage) => history.push(`/fulfillment?${new URLSearchParams({ ...(nextStatus ? { status: nextStatus } : {}), ...(nextPage ? { page: nextPage } : {}) })}`);
  const saved = updated => {
    setMessage(`Shipment #${updated.id} updated.`);
    setResult(current => current?.key !== key ? current : ({ ...current, data: { ...current.data,
      total: current.data.total - (status && status !== updated.status ? 1 : 0),
      shipments: current.data.shipments.map(row => row.id === updated.id ? updated : row).filter(row => !status || row.status === status) } }));
  };
  return <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
    <h1 className="text-3xl font-bold">{role === "admin" ? "Admin" : "Store"} fulfillment</h1>
    {!allowed ? <p role="alert">Shipment management is restricted to authorized Store and Admin accounts.</p> : <>
      <p className="text-muted">{role === "admin" ? "Manage all shipment groups, including unassigned historical orders." : "Only shipment groups assigned to your verified store are available. Other stores' order lines are excluded."}</p>
      <div className="flex flex-wrap items-end gap-3"><label className="text-sm font-semibold">Shipment status<select value={status} className="control-input mt-1" onChange={event => navigate(event.target.value, 0)}><option value="">All statuses</option>{shipmentStates.map(value => <option key={value} value={value}>{shipmentLabel(value)}</option>)}</select></label>
        <button className="control-button border border-outline bg-white" onClick={() => setAttempt(value => value + 1)}>Refresh shipments</button></div>
      {message && <p role="status" className="text-success">{message}</p>}
      {readState.status === "error" && <p role="alert" className="text-danger-text">{readState.error}</p>}
      {readState.status === "loading" ? <p role="status">Loading shipments…</p> : readState.status === "success" ? <>
        {!result.data.shipments.length && <p>No shipments match this account and filter.</p>}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">{result.data.shipments.map(shipment => <ShipmentCard key={`${shipment.id}-${shipment.version}-${attempt}`} shipment={shipment}>
          <ShipmentEditor shipment={shipment} admin={role === "admin"} onSaved={saved} />
        </ShipmentCard>)}</div>
        <nav aria-label="Shipment pagination" className="flex items-center gap-3"><button className="control-button border border-outline" disabled={!page} onClick={() => navigate(status, page - 1)}>Previous shipments</button><span className="text-sm">Page {page + 1}</span>
          <button className="control-button border border-outline" disabled={(page + 1) * 10 >= result.data.total} onClick={() => navigate(status, page + 1)}>Next shipments</button></nav>
      </> : null}
      {role === "admin" && <details className="panel" onToggle={event => setOwnership(event.currentTarget.open)}><summary className="font-semibold text-action">Verified store ownership for future orders</summary>{ownership && <OwnershipPanel />}</details>}
      <p className="text-xs text-muted">Demo fulfillment only. No carrier integration or real payment capture is configured.</p>
    </>}
  </section>;
}
