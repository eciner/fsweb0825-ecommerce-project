import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { fetchOrders } from "../store/actions";

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function OrdersPage() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [openOrder, setOpenOrder] = useState(null);
  const load = () => {
    setState("loading");
    dispatch(fetchOrders())
      .then((items) => {
        setOrders(items);
        setState(items.length ? "success" : "empty");
      })
      .catch((reason) => {
        setError(reason.message);
        setState("failure");
      });
  };
  useEffect(() => {
    dispatch(fetchOrders())
      .then((items) => {
        setOrders(items);
        setState(items.length ? "success" : "empty");
      })
      .catch((reason) => {
        setError(reason.message);
        setState("failure");
      });
  }, [dispatch]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10">
      <h1 className="text-3xl font-bold text-[#252B42]">Previous Orders</h1>
      {state === "loading" && (
        <output className="mt-6 text-sm text-[#737373]">
          Loading orders...
        </output>
      )}
      {state === "failure" && (
        <div
          className="mt-6 flex items-center gap-3 text-sm text-[#E74040]"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1 font-semibold"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}
      {state === "empty" && (
        <p className="mt-6 text-sm text-[#737373]">
          You have no previous orders.
        </p>
      )}
      {state === "success" && (
        <div className="mt-6 overflow-x-auto rounded-md bg-white shadow-sm">
          <table className="w-full min-w-155 text-left text-sm">
            <thead className="border-b border-[#E8E8E8] text-xs uppercase text-[#737373]">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1F1]">
              {orders.map((order, index) => {
                const id = order.id || index;
                const lines = order.products || [];
                return (
                  <>
                    <tr key={id}>
                      <td className="p-4 font-semibold text-[#252B42]">
                        #{id}
                      </td>
                      <td className="p-4 text-[#737373]">
                        {order.order_date
                          ? new Date(order.order_date).toLocaleString()
                          : "-"}
                      </td>
                      <td className="p-4 font-semibold">
                        {formatCurrency(order.price)}
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenOrder(openOrder === id ? null : id)
                          }
                          aria-expanded={openOrder === id}
                          className="inline-flex items-center gap-1 text-[#23A6F0]"
                        >
                          {openOrder === id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          View items
                        </button>
                      </td>
                    </tr>
                    {openOrder === id && (
                      <tr key={`${id}-details`}>
                        <td colSpan="4" className="bg-[#FAFAFA] p-4">
                          <ul className="flex flex-col gap-2 text-sm text-[#737373]">
                            {lines.length ? (
                              lines.map((line) => (
                                <li key={`${line.product_id}-${line.count}`}>
                                  Product #{line.product_id} - {line.count}{" "}
                                  item(s)
                                </li>
                              ))
                            ) : (
                              <li>No product details available.</li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
