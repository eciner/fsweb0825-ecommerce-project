import { useEffect } from "react";
import { useDispatch } from "react-redux";

import Header from "./layout/Header";
import PageContent from "./layout/PageContent";
import Footer from "./layout/Footer";
import { verifyStoredSession } from "./store/actions";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(verifyStoredSession());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-gray-50">
      <Header />
      <PageContent />
      <Footer />
    </div>
  );
}
