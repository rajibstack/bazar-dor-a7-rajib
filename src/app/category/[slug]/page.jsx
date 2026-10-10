"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { parseApiProduct, formatBanglaNumber } from "@/lib/parser";

const PRODUCTS_API = "https://api.api-store.workers.dev/api/bazardor/products";

function CategoryPageContent() {
  const params = useParams();
  const slug = params?.slug || params?.category;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      setLoading(true);
      try {
        const res = await fetch(PRODUCTS_API);
        const data = await res.json();
        const rawList = Array.isArray(data)
          ? data
          : data?.products || data?.data || data?.result || [];

        const parsedList = rawList.map((item, idx) => parseApiProduct(item, idx)).filter(Boolean);

        if (slug && slug !== "sob" && slug !== "all") {
          const filtered = parsedList.filter(
            (p) => 
              p.category?.toLowerCase() === slug?.toLowerCase() ||
              p.categorySlug?.toLowerCase() === slug?.toLowerCase()
          );
          setProducts(filtered);
        } else {
          setProducts(parsedList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
        <p className="mt-3 text-sm font-medium text-gray-500">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          ক্যাটাগরির পণ্য
        </h1>
        <Link href="/" className="text-sm font-medium text-emerald-600 hover:underline">
          হোম পেজে ফিরে যান
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const isIncrease = product.change >= 0;
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition block"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 shadow-inner">
                  {product.emoji}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-500">প্রতি {product.unit}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-between items-end">
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">আজকের দাম</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatBanglaNumber(product.price)} টাকা
                  </span>
                </div>
                <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${isIncrease ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"}`}>
                  <span>{isIncrease ? "▲" : "▼"}</span>
                  <span>{formatBanglaNumber(Math.abs(product.change))}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
        <p className="mt-3 text-sm font-medium text-gray-500">লোড হচ্ছে...</p>
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}