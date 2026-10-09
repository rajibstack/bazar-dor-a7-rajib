"use client";

import Link from "next/link";

const toBanglaDigits = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "০";
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return val.toString().replace(/\d/g, (x) => banglaDigits[x]);
};

export default function ProductCard({ product }) {
  if (!product) return null;

  const numChange = isNaN(Number(product.change)) ? 0 : Number(product.change);
  const isUp = numChange >= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition">
            {product.emoji || "🧺"}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500">প্রতি {product.unit || "কেজি"}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50 flex items-end justify-between">
        <div>
          <span className="text-xs text-gray-400 block mb-0.5">আজকের দাম</span>
          <span className="text-lg font-bold text-gray-900">
            {toBanglaDigits(product.price)} টাকা
          </span>
        </div>

        <div
          className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${
            isUp ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
          }`}
        >
          {isUp ? "▲" : "▼"} {toBanglaDigits(Math.abs(numChange))}%
        </div>
      </div>
    </Link>
  );
}