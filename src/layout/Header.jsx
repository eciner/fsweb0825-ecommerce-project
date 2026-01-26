import React from "react";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-indigo-700">
          <ShoppingBag className="w-6 h-6" />
          <span>ShopSwift</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-indigo-700">Home</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Cart</span>
        </nav>
      </div>
    </header>
  );
}

export default Header;
