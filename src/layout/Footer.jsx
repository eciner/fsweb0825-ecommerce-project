import React from "react";

function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <span>© {new Date().getFullYear()} ShopSwift</span>
        <span className="text-gray-400">Built with React & Tailwind</span>
      </div>
    </footer>
  );
}

export default Footer;
