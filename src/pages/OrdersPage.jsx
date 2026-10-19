import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { fetchOrders } from "../store/actions";
import OrderDetails from "../components/OrderDetails";
import { formatOrderPrice } from "../utils/order";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const revision = useSelector((state) => state.client.sessionRevision);
  const [snapshot, setSnapshot] = useState({
    revision: -1,
    orders: [],
    error: "",
    loaded: false,
  });
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    let active = true;
    dispatch(fetchOrders())
      .then((orders) => {
        if (active) setSnapshot({ revision, orders, loaded: true, error: "" });
      })
      .catch((reason) => {
        if (active)
          setSnapshot({
            revision,
            orders: [],
            loaded: true,
            error: reason.message,
          });
      });
    return () => {
      active = false;
    };
  }, [dispatch, revision, attempt]);
  const ready = snapshot.revision === revision && snapshot.loaded;
  const selected = new URLSearchParams(location.search).get("order");
  const orders = ready
    ? snapshot.orders.filter((order) =>
        `${order.id} ${(order.products || []).map((line) => line.product_name || "").join(" ")}`
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : [];
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold">Previous Orders</h1>
      {!ready && <p role="status">Loading orders...</p>}
      {ready && snapshot.error && (
        <div role="alert">
          <p>{snapshot.error}</p>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="mt-3 font-bold text-action"
          >
            Retry
          </button>
        </div>
      )}
      {ready && !snapshot.error && (
        <>
          <label className="flex max-w-md flex-col gap-1 text-sm font-semibold">
            Search loaded orders by number or product
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-control border border-outline px-3 py-2"
            />
          </label>
          {!orders.length && (
            <p>
              {snapshot.orders.length
                ? "No matching orders."
                : "You have no previous orders."}{" "}
              <Link to="/shop" className="text-action">
                Browse products
              </Link>
            </p>
          )}
          {orders.map((order) => (
            <details
              key={`${order.id}-${selected}`}
              open={selected === String(order.id) ? true : undefined}
              className="rounded-control border border-outline bg-white p-4 shadow-sm"
            >
              <summary className="flex flex-wrap items-center justify-between gap-3 font-semibold">
                <span>Order #{order.id}</span>
                <span className="text-sm text-muted">
                  {order.order_date
                    ? new Date(order.order_date).toLocaleString()
                    : "Date not recorded"}
                </span>
                <span>{formatOrderPrice(order.price, order.currency)}</span>
                <span className="text-sm text-action">View details</span>
              </summary>
              <div className="mt-6">
                <OrderDetails order={order} />
              </div>
            </details>
          ))}
        </>
      )}
    </section>
  );
}
