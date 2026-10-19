import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, fetchCreditCards } from "../store/actions";

export default function ResourceNotice({ resource }) {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.client.resourceStatus[resource]);
  if (
    !status ||
    (status.refresh !== "FAILED" &&
      !["UNKNOWN", "FAILED"].includes(status.mutation))
  )
    return null;
  return (
    <div
      role="status"
      className="mt-4 rounded-control border border-outline p-4 text-sm"
    >
      <p>
        {status.mutation === "FAILED"
          ? status.error || "The change was rejected."
          : status.mutation === "UNKNOWN"
            ? "The change outcome is unknown. Review saved records before another change. Repeated writes are blocked for this session; sign out only after reconciliation."
            : status.mutation === "CONFIRMED"
              ? "Change saved successfully. The list could not be refreshed; do not repeat the change."
              : "The saved collection could not be refreshed."}
      </p>
      <button
        type="button"
        disabled={status.refresh === "LOADING"}
        className="mt-2 font-bold text-action"
        onClick={() =>
          dispatch(
            resource === "addresses" ? fetchAddresses() : fetchCreditCards(),
          ).catch(() => {})
        }
      >
        {status.refresh === "LOADING"
          ? "Refreshing..."
          : "Refresh saved records"}
      </button>
    </div>
  );
}
