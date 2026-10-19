import { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";

const BlogPage = lazy(() => import("../pages/BlogPage"));
const BlogArticlePage = lazy(() => import("../pages/BlogArticlePage"));
const InformationPage = lazy(() => import("../pages/InformationPage"));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage"));
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
const FulfillmentPage = lazy(() => import("../pages/FulfillmentPage"));
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
    <main
      id="main-content"
      className="flex w-full flex-1 flex-col"
      tabIndex={-1}
    >
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
          <Route
            exact
            path={[
              "/careers",
              "/privacy",
              "/terms",
              "/cookies",
              "/license",
              "/partners",
              "/how-it-works",
              "/faq",
              "/apps",
              "/demo",
              "/customer-stories",
              "/developers",
            ]}
            component={InformationPage}
          />
          <Route exact path="/blog" component={BlogPage} />
          <Route exact path="/blog/:slug" component={BlogArticlePage} />
          <Route exact path="/favorites" component={FavoritesPage} />
          <Route exact path="/about" component={AboutPage} />
          <Route exact path="/team" component={TeamPage} />
          <Route exact path="/contact" component={ContactPage} />
          <Route exact path="/cart" component={CartPage} />
          <ProtectedRoute exact path="/order" component={OrderPage} />
          <ProtectedRoute exact path="/orders" component={OrdersPage} />
          <ProtectedRoute exact path="/fulfillment" component={FulfillmentPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </main>
  );
}
