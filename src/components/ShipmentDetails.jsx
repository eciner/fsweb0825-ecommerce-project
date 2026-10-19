import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";

import { shipmentStates, shipmentLabel } from "../utils/shipment";

export function ShipmentCard({ shipment, children }) {
  return <article className="panel flex min-w-0 flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Shipment #{shipment.id}</h3><span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-action">{shipmentLabel(shipment.status)}</span></div>
    <p className="text-sm text-muted">Order #{shipment.order_id} · {shipment.store_name || "Unassigned · Admin managed"}</p>
    {shipment.historical && <p className="text-sm text-muted">Historical order: store ownership was not verified. The initial event records import, not a reconstructed shipping date.</p>}
    <ul className="text-sm">{(shipment.items || []).map((line, index) => <li key={`${line.product_id}-${index}`} className="break-words">{line.product_name || `Product #${line.product_id}`} × {line.count}</li>)}</ul>
    <ol aria-label={`Shipment ${shipment.id} progress`} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {shipmentStates.map((state, index) => {
        const recorded = shipment.history?.find(event => event.status === state);
        const reached = index <= shipmentStates.indexOf(shipment.status);
        return <li key={state} aria-current={shipment.status === state ? "step" : undefined} className={`rounded-control border p-3 text-xs ${reached ? "border-action bg-brand/5" : "border-outline text-muted"}`}>
          <p className="font-semibold">{shipmentLabel(state)}</p>
          {recorded ? <time className="mt-1 block" dateTime={recorded.recorded_at}>{new Date(recorded.recorded_at).toLocaleString()}</time> : <p className="mt-1">Not recorded</p>}
        </li>;
      })}
    </ol>
    <dl className="flex flex-col gap-2 text-sm"><div><dt className="font-semibold">Carrier</dt><dd className="break-words">{shipment.carrier || "Not assigned"}</dd></div>
      <div><dt className="font-semibold">Tracking number</dt><dd className="break-all">{shipment.tracking_number || "Not assigned"}</dd></div></dl>
    <div><h4 className="text-sm font-semibold">Shipping address at purchase</h4><p className="whitespace-pre-line break-words text-sm">{shipment.shipping_address || "Historical address snapshot not recorded."}</p></div>
    <details className="text-sm"><summary className="font-semibold text-action">Recorded shipment history</summary><ol className="mt-3 flex flex-col gap-2">{(shipment.history || []).map(event => <li key={event.id}>
      {shipmentLabel(event.status)} · {event.kind === "METADATA_CORRECTION" ? "Tracking details corrected" : event.kind === "HISTORICAL_IMPORT" ? "Historical import" : "Status recorded"} · {new Date(event.recorded_at).toLocaleString()}{event.actor_id ? ` · Account #${event.actor_id}` : ""}
    </li>)}</ol></details>
    {children}
  </article>;
}

export default function ShipmentDetails({ orderId }) {
  const root = useRef(null);
  const [visible, setVisible] = useState(false);
  const revision = useSelector(state => state.client.sessionRevision);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    const details = root.current.closest("details");
    const update = () => setVisible(!details || details.open);
    update(); details?.addEventListener("toggle", update);
    return () => details?.removeEventListener("toggle", update);
  }, []);
  useEffect(() => {
    if (!visible) return;
    let active = true;
    api.get(`/order/${orderId}/shipments`).then(data => { if (active) setResult({ data, revision, orderId }); })
      .catch(error => { if (active) setResult({ error: error.message, revision, orderId }); });
    return () => { active = false; };
  }, [orderId, revision, attempt, visible]);
  const current = result?.revision === revision && result?.orderId === orderId ? result : null;
  return <section ref={root} aria-label="Shipment details" className="flex flex-col gap-4 border-t border-outline pt-5">
    <h2 className="text-xl font-bold">Shipment details</h2>
    {!current ? <p role="status">Loading shipments…</p> : current.error ? <div role="alert" className="text-sm text-danger-text">{current.error} <button className="underline" onClick={() => setAttempt(value => value + 1)}>Retry shipments</button></div> : <>
      <p className="font-semibold">Overall fulfillment: {shipmentLabel(current.data?.status)}</p>
      {!current.data?.shipments?.length && <p className="text-sm text-muted">Shipment information has not been recorded.</p>}
      {current.data?.shipments?.map(shipment => <ShipmentCard key={shipment.id} shipment={shipment} />)}
      <p className="text-xs text-muted">These are persisted demo fulfillment records. No carrier API, real dispatch, charge or delivery guarantee is represented.</p>
    </>}
  </section>;
}
