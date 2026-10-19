import { useState } from "react";
import { useDispatch } from "react-redux";
import { addProductToCart } from "../store/cartActions";

export default function AddToCartButton({ product, detail = false }) {
  const dispatch = useDispatch();
  const [feedback, setFeedback] = useState({ loading: false, message: "", error: false });
  const add = async () => {
    setFeedback({ loading: true, message: "", error: false });
    try {
      await dispatch(addProductToCart(product.id));
      setFeedback({ loading: false, message: "Added to cart", error: false });
    } catch (error) {
      setFeedback({ loading: false, message: error.message, error: true });
    }
  };
  return <div className={`flex flex-col gap-1 ${detail ? "items-start" : "items-center"}`}>
    <button type="button" onClick={add} disabled={feedback.loading || product.stock <= 0}
      aria-label={detail ? undefined : `Add ${product.title} to cart`} className={`control-button bg-action text-white hover:bg-ink ${detail ? "h-11 px-6" : ""}`}>
      {feedback.loading ? "Adding…" : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
    </button>
    <p role={feedback.error ? "alert" : "status"} className={`min-h-12 text-xs ${detail ? "text-left" : "text-center"} ${feedback.error ? "text-danger-text" : "text-success"}`}>{feedback.message}</p>
  </div>;
}
