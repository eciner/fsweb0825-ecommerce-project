import Slider from "../components/Slider";
import EditorsPick from "../components/EditorsPick";
import HeroProductSlider from "../components/HeroProductSlider";
import CatalogShowcase from "../components/CatalogShowcase";
import NeuralBanner from "../components/NeuralBanner";
import FeaturedPosts from "../components/FeaturedPosts";

export default function HomePage() {
  return (
    <div className="w-full">
      <Slider />
      <EditorsPick />

      <CatalogShowcase />

      <HeroProductSlider />
      <NeuralBanner />
      <FeaturedPosts />
    </div>
  );
}
