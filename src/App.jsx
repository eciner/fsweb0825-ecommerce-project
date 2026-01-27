import Header from "./layout/Header";
import PageContent from "./layout/PageContent";
import Footer from "./layout/Footer";

export default function App() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-gray-50">
      <Header />
      <PageContent />
      <Footer />
    </div>
  );
}
