export function getProductDetailRouteState({
  routeProductId,
  selectedProductId,
  selectedProduct,
  fetchState,
  error,
}) {
  const validRouteId = Number.isSafeInteger(routeProductId) && routeProductId > 0;
  const identityMatches = validRouteId && selectedProductId === routeProductId;
  const currentProduct =
    identityMatches &&
    fetchState === "FETCHED" &&
    Number(selectedProduct?.id) === routeProductId
      ? selectedProduct
      : null;
  const isFailed =
    (identityMatches && fetchState === "FAILED") ||
    (!validRouteId &&
      selectedProductId === null &&
      fetchState === "FAILED" &&
      error?.code === "INVALID_PRODUCT_ID");

  return {
    currentProduct,
    isLoading: !currentProduct && !isFailed,
    isFailed,
    canCanonicalize: Boolean(currentProduct),
  };
}
