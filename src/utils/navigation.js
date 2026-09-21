export function getSafeReturnPath(stateValue, fallback = "/") {
  if (typeof stateValue !== "string") {
    return fallback;
  }

  if (!stateValue.startsWith("/")) {
    return fallback;
  }

  if (stateValue.startsWith("//")) {
    return fallback;
  }

  return stateValue;
}
