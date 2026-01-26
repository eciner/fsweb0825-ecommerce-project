import React from "react";

function ProductCard({ product }) {
  if (!product) return null;

  const { name, price, image, badge } = product;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-150 flex flex-col">
      {image ? (
        <img src={image} alt={name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          {badge && (
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-indigo-700 font-bold">${price.toFixed(2)}</p>
        <div className="flex-1" />
        <button className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-150">
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
