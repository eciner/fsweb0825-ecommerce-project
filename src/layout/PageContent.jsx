import React from "react";

function PageContent({ children }) {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-10">{children}</div>
    </main>
  );
}

export default PageContent;
