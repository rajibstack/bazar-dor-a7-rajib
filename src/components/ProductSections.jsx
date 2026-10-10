"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { parseApiProduct, formatBanglaNumber } from "@/lib/parser";

const PRODUCTS_API = "/api/bazardor/products";

export default function ProductSections() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const url = activeCategory
          ? `${PRODUCTS_API}?category=${encodeURIComponent(activeCategory)}`
          : PRODUCTS_API;

        const res = await fetch(url).catch(() => null);
        let data = null;
        if (res && res.ok) {
          data = await res.json();
        }

        const list = Array.isArray(data)
          ? data
          : data?.products || data?.data || data?.result || [];

        const parsed = list.map((item, idx) => parseApiProduct(item, idx)).filter(Boolean);
        setAllProducts(parsed);
      } catch (err) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory]);

  const displayedProducts = allProducts;

  let topRisers = [...allProducts]
    .filter((p) => p.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 6);

  if (topRisers.length === 0 && allProducts.length > 0) {
    topRisers = allProducts.slice(0, 6);
  }

  let topFallers = [...allProducts]
    .filter((p) => p.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 6);

  if (topFallers.length === 0 && allProducts.length > 6) {
    topFallers = allProducts.slice(6, 12);
  } else if (topFallers.length === 0 && allProducts.length > 0) {
    topFallers = allProducts.slice(0, 6);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
        <p className="mt-3 text-sm font-medium text-gray-500">
          এপিআই থেকে তথ্য লোড হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {!activeCategory && topRisers.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-red-600 text-lg font-bold">▲</span>
            <h2 className="text-2xl font-bold text-gray-900">আজ দাম বেড়েছে</h2>
          </div>
          <div className="grid grid-cols-1 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topRisers.map((product) => (
              <ProductCard key={`riser-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {!activeCategory && topFallers.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-emerald-600 text-lg font-bold">▼</span>
            <h2 className="text-2xl font-bold text-gray-900">আজ দাম কমেছে</h2>
          </div>
          <div className="grid grid-cols-1 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topFallers.map((product) => (
              <ProductCard key={`faller-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      <section id="sob-ponno" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {activeCategory ? "ক্যাটাগরির পণ্য" : "সব পণ্য"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            মোট {formatBanglaNumber(displayedProducts.length)}টি পণ্য দেখানো হচ্ছে
          </p>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProducts.map((product) => (
              <ProductCard key={`all-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
            এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
          </div>
        )}
      </section>
    </div>
  );
}