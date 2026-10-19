import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { revalidateCart } from "../store/cartActions";

export default function CartValidation() {
  const dispatch = useDispatch();
  const { cart, cartOwner, cartValidating, cartError } = useSelector(state => state.shoppingCart);
  const initialized = useSelector(state => state.client.authInitialized);
  const needsRefresh = cart.some(line => line.needsRefresh);
  useEffect(() => {
    if (initialized && needsRefresh) dispatch(revalidateCart()).catch(() => {});
  }, [dispatch, initialized, needsRefresh, cartOwner]);
  if (cartError) return <div role="alert" className="mx-auto w-full max-w-6xl px-4 py-3 text-sm text-danger-text">
    {cartError} <button className="font-semibold underline" onClick={() => dispatch(revalidateCart()).catch(() => {})}>Retry cart check</button>
  </div>;
  if (cartValidating || needsRefresh) return <p role="status" className="px-4 py-2 text-center text-sm text-muted">Checking saved cart prices and availability…</p>;
  return null;
}
