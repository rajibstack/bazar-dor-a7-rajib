"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const BASE_URL = "/api/bazardor";

const categoryMetaMap = {
  chal: { title: "চাল", icon: "🍚" },
  dal: { title: "ডাল", icon: "🍲" },
  tel: { title: "তেল", icon: "🥫" },
  sobji: { title: "সবজি", icon: "🥬" },
  mach: { title: "মাছ", icon: "🐟" },
  mangsho: { title: "মাংস", icon: "🍗" },
  "dim-dudh": { title: "ডিম-দুধ", icon: "🥛" },
  "dim-dud": { title: "ডিম-দুধ", icon: "🥛" },
  "dim-dui": { title: "ডিম-দুধ", icon: "🥛" },
  moshla: { title: "মসলা", icon: "🌶️" },
  mosla: { title: "মসলা", icon: "🌶️" },
};

const unitBanglaMap = {
  kg: "প্রতি কেজি",
  "per kg": "প্রতি কেজি",
  kilogram: "প্রতি কেজি",
  litre: "প্রতি লিটার",
  liter: "প্রতি লিটার",
  "per litre": "প্রতি লিটার",
  "per liter": "প্রতি লিটার",
  l: "প্রতি লিটার",
  dozen: "প্রতি ডজন",
  pcs: "প্রতি পিস",
  piece: "প্রতি পিস",
  gm: "প্রতি গ্রাম",
  gram: "প্রতি গ্রাম",
};

function parseNum(val) {
  if (val === null || val === undefined) return 0;
  const str = String(val).replace(/[^\d.-]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function CategoryContent() {
  const params = useParams();
  const rawSlug = params?.slug ? decodeURIComponent(params.slug).toLowerCase().trim() : "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const [categoryInfo, setCategoryInfo] = useState({
    title: categoryMetaMap[rawSlug]?.title || rawSlug,
    icon: categoryMetaMap[rawSlug]?.icon || "🛒",
  });

  useEffect(() => {
    async function fetchCategoryProducts() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${BASE_URL}/categories`).catch(() => null),
          fetch(`${BASE_URL}/products`).catch(() => null),
        ]);

        let categoriesList = [];
        if (catRes && catRes.ok) {
          const catJson = await catRes.json();
          categoriesList = Array.isArray(catJson) ? catJson : catJson.categories || catJson.data || [];
        }

        let allProductsList = [];
        if (prodRes && prodRes.ok) {
          const prodJson = await prodRes.json();
          allProductsList = Array.isArray(prodJson) ? prodJson : prodJson.products || prodJson.data || prodJson.items || [];
        }

        const matchedCat = categoriesList.find((cat) => {
          const attr = cat.attributes && typeof cat.attributes === "object" ? cat.attributes : cat;
          const catId = (attr.id || attr.slug || attr.key || attr.name || "").toString().toLowerCase().trim();
          return catId === rawSlug || attr.slug === rawSlug;
        });

        const mappedMeta = categoryMetaMap[rawSlug] || {};
        let catTitle = mappedMeta.title || rawSlug;
        let catIcon = mappedMeta.icon || "🛒";

        if (matchedCat) {
          const attr = matchedCat.attributes && typeof matchedCat.attributes === "object" ? matchedCat.attributes : matchedCat;
          catTitle = attr.nameBn || attr.name_bn || attr.titleBn || attr.title || attr.name || catTitle;
          catIcon = attr.emoji || attr.icon || catIcon;
        }

        setCategoryInfo({ title: catTitle, icon: catIcon });

        let categoryRawProducts = [];
        if (matchedCat) {
          const attr = matchedCat.attributes && typeof matchedCat.attributes === "object" ? matchedCat.attributes : matchedCat;
          categoryRawProducts = attr.products || attr.items || attr.data || attr.list || [];
        }

        if (categoryRawProducts.length === 0) {
          categoryRawProducts = allProductsList.filter((p) => {
            const attr = p.attributes && typeof p.attributes === "object" ? p.attributes : p;
            const pCat = (attr.category || attr.categorySlug || attr.cat || attr.categoryId || "").toString().toLowerCase().trim();
            return pCat === rawSlug || pCat.includes(rawSlug);
          });
        }

        const formattedProducts = categoryRawProducts.map((p) => {
          const prodAttr = p.attributes && typeof p.attributes === "object" ? p.attributes : p;
          const pName = prodAttr.nameBn || prodAttr.name_bn || prodAttr.titleBn || prodAttr.title || prodAttr.name || "";

          const globalMatch = allProductsList.find((gp) => {
            const gAttr = gp.attributes && typeof gp.attributes === "object" ? gp.attributes : gp;
            const gName = gAttr.nameBn || gAttr.name_bn || gAttr.titleBn || gAttr.title || gAttr.name || "";
            return (p.id && gp.id && p.id === gp.id) || (pName && gName && pName === gName);
          });

          const targetAttr = globalMatch
            ? (globalMatch.attributes && typeof globalMatch.attributes === "object" ? globalMatch.attributes : globalMatch)
            : prodAttr;

          const rawPrice = targetAttr.price ?? targetAttr.price_bn ?? targetAttr.priceBn ?? targetAttr.todayPrice ?? targetAttr.currentPrice ?? targetAttr.amount ?? targetAttr.rate ?? 0;
          const rawChange = targetAttr.change ?? targetAttr.change_bn ?? targetAttr.changeBn ?? targetAttr.priceChange ?? targetAttr.percentage ?? targetAttr.diff ?? 0;
          
          const rawUnit = (targetAttr.unit || targetAttr.unitBn || targetAttr.unit_bn || "kg").toString().toLowerCase().trim();
          const unit = unitBanglaMap[rawUnit] || targetAttr.unit || targetAttr.unitBn || targetAttr.unit_bn || "প্রতি কেজি";

          return {
            id: p.id || targetAttr.id || targetAttr._id || Math.random(),
            name: pName || "অজানা পণ্য",
            unit: unit,
            price: parseNum(rawPrice),
            change: parseNum(rawChange),
            icon: targetAttr.emoji || targetAttr.icon || catIcon,
          };
        });

        setProducts(formattedProducts);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (rawSlug) {
      fetchCategoryProducts();
    }
  }, [rawSlug]);

  const getSortedProducts = () => {
    if (!products || products.length === 0) return [];
    const list = [...products];

    if (sortOption === "lowToHigh") {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortOption === "highToLow") {
      return list.sort((a, b) => b.price - a.price);
    }
    return list;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="w-full h-24 bg-gray-200 animate-pulse rounded-2xl"></div>
        <div className="w-full h-14 bg-gray-200 animate-pulse rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const sortedProducts = getSortedProducts();

  if (!sortedProducts || sortedProducts.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি!
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          অনুগ্রহ করে অন্য কোনো ক্যাটাগরি নির্বাচন করুন অথবা হোম পেজে ফিরে যান।
        </p>
        <Link
          href="/"
          className="inline-block bg-[#108a00] hover:bg-[#0d7300] text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4 font-sans text-gray-800">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-3xl">
          {categoryInfo.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{categoryInfo.title}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {sortedProducts.length}টি পণ্যের আজকের দাম ও পরিবর্তন
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-end shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>সাজান</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="default">ডিফল্ট</option>
            <option value="lowToHigh">দাম: কম থেকে বেশি</option>
            <option value="highToLow">দাম: বেশি থেকে কম</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-gray-500 pl-1">
        মোট {sortedProducts.length}টি পণ্য দেখানো হচ্ছে
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedProducts.map((product) => {
          const isUp = product.change > 0 ? true : product.change < 0 ? false : null;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl shrink-0">
                  {product.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#108a00] transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-xs text-gray-500">{product.unit}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 block">আজকের দাম</span>
                  <span className="text-lg font-extrabold text-gray-900">
                    {product.price} টাকা
                  </span>
                </div>

                <div
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isUp === true
                      ? "bg-red-50 text-red-600"
                      : isUp === false
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isUp === true && "▲ "}
                  {isUp === false && "▼ "}
                  {isUp === null && "— "}
                  {Math.abs(product.change)}%
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
    <Suspense fallback={<div className="p-8 text-center text-gray-500">লোড হচ্ছে...</div>}>
      <CategoryContent />
    </Suspense>
  );
}