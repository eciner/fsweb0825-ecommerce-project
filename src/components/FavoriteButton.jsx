import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { changeFavorite } from "../store/actions";

export default function FavoriteButton({ productId, name }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const user = useSelector((state) => state.client.user);
  const favorites = useSelector((state) => state.client.favorites);
  const saved = favorites.some(
    (product) => String(product.id) === String(productId),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const toggle = async () => {
    if (!user?.email) {
      history.push("/login", {
        from: `${location.pathname}${location.search}`,
      });
      return;
    }
    setPending(true);
    setError("");
    try {
      await dispatch(changeFavorite(productId, !saved));
    } catch (reason) {
      setError(reason.message);
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="mt-3 flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        aria-label={`${saved ? "Remove" : "Save"} ${name || "product"} ${saved ? "from" : "to"} favorites`}
        className="inline-flex items-center gap-2 rounded-control border border-outline px-3 py-2 text-sm font-semibold text-action hover:bg-surface"
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
        {pending ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}
