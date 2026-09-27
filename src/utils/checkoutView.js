export function getCheckoutView(step, cartCount) {
  if (step === 3) return "success";
  if (cartCount === 0) return "empty";
  return "form";
}
