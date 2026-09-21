import { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage"));
const ShopPage = lazy(() => import("../pages/ShopPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const NotFound = lazy(() => import("../pages/NotFound"));
const CartPage = lazy(() => import("../pages/CartPage"));
const OrderPage = lazy(() => import("../pages/OrderPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const ProtectedRoute = lazy(() => import("../components/ProtectedRoute"));

function RouteFallback() {
  return (
    <div className="flex min-h-80 w-full items-center justify-center px-4 py-16 text-sm font-semibold text-[#737373]">
      Loading page...
    </div>
  );
}

export default function PageContent() {
  return (
    <main className="flex w-full flex-col">
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/signup" component={SignupPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/shop" component={ShopPage} />
          <Route
            exact
            path="/shop/:gender/:categoryName/:categoryId/:productNameSlug/:productId"
            component={ProductDetailPage}
          />
          <Route
            exact
            path="/shop/:gender/:categoryName/:categoryId"
            component={ShopPage}
          />
          <Route exact path="/about" component={AboutPage} />
          <Route exact path="/team" component={TeamPage} />
          <Route exact path="/contact" component={ContactPage} />
          <Route exact path="/cart" component={CartPage} />
          <ProtectedRoute exact path="/order" component={OrderPage} />
          <ProtectedRoute exact path="/orders" component={OrdersPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </main>
  );
}
