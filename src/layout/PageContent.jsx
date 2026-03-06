import { Switch, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ShopPage from "../pages/ShopPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import ContactPage from "../pages/ContactPage";
import TeamPage from "../pages/TeamPage";
import AboutPage from "../pages/AboutPage";
import NotFound from "../pages/NotFound";

export default function PageContent() {
  return (
    <main className="flex w-full flex-col">
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/shop" component={ShopPage} />
        <Route exact path="/shop/:productId" component={ProductDetailPage} />
        <Route exact path="/about" component={AboutPage} />
        <Route exact path="/team" component={TeamPage} />
        <Route exact path="/contact" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </main>
  );
}
