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
  if (typeof val === "number") return val;
  const str = String(val).replace(/[^\d.-]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function toBanglaNum(num) {
  if (num === null || num === undefined) return "০";
  const engNums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const bdnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  let str = String(num);
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(engNums[i], bdnNums[i]);
  }
  return str;
}

function extractPrice(obj) {
  if (!obj) return 0;
  if (typeof obj === "number" || typeof obj === "string") return parseNum(obj);

  const direct = obj.price ?? obj.price_bn ?? obj.priceBn ?? obj.todayPrice ?? obj.currentPrice ?? obj.amount ?? obj.rate;
  if (direct !== undefined && direct !== null) {
    if (typeof direct === "object") return extractPrice(direct);
    const parsed = parseNum(direct);
    if (parsed > 0) return parsed;
  }

  const nested = obj.today || obj.current || obj.value || obj.avg || obj.average || obj.price_today;
  if (nested !== undefined && nested !== null) {
    if (typeof nested === "object") return extractPrice(nested);
    const parsed = parseNum(nested);
    if (parsed > 0) return parsed;
  }

  if (Array.isArray(obj.prices) && obj.prices.length > 0) {
    return extractPrice(obj.prices[0]);
  }
  if (Array.isArray(obj.history) && obj.history.length > 0) {
    return extractPrice(obj.history[obj.history.length - 1]);
  }

  return 0;
}

function extractChange(obj) {
  if (!obj) return 0;
  if (typeof obj === "number") return obj;
  if (typeof obj === "string") {
    const cleanStr = obj.trim();
    const num = parseNum(cleanStr);
    if (cleanStr.includes("down") || cleanStr.includes("▼") || cleanStr.includes("-")) {
      return -Math.abs(num);
    }
    return num;
  }

  if (typeof obj === "object") {
    const keys = [
      "change", "change_bn", "changeBn", "priceChange", "percentage",
      "percentageBn", "diff", "percent", "variation", "trend",
      "rateChange", "priceChangePercentage", "changePercentage", "pct", "value"
    ];

    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) {
        const res = extractChange(obj[k]);
        if (res !== 0) {
          if (obj.dir === "down" || obj.direction === "down" || obj.sign === "-") {
            return -Math.abs(res);
          }
          return res;
        }
      }
    }

    for (const val of Object.values(obj)) {
      if (val && (typeof val === "object" || typeof val === "string" || typeof val === "number")) {
        const res = extractChange(val);
        if (res !== 0) {
          if (obj.dir === "down" || obj.direction === "down" || obj.sign === "-") {
            return -Math.abs(res);
          }
          return res;
        }
      }
    }
  }

  const curr = extractPrice(obj);
  const prev = parseNum(obj.previousPrice ?? obj.oldPrice ?? obj.prevPrice ?? obj.yesterdayPrice ?? obj.lastPrice ?? obj.lastMonth ?? obj.lastWeek);
  if (curr > 0 && prev > 0 && curr !== prev) {
    const diff = ((curr - prev) / prev) * 100;
    return parseFloat(diff.toFixed(1));
  }

  return 0;
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

        let categoryRawProducts = allProductsList.filter((p) => {
          const attr = p.attributes && typeof p.attributes === "object" ? p.attributes : p;
          const pCat = (attr.category || attr.categorySlug || attr.cat || attr.categoryId || "").toString().toLowerCase().trim();
          return pCat === rawSlug || pCat.includes(rawSlug) || rawSlug.includes(pCat) || pCat === catTitle;
        });

        if (categoryRawProducts.length === 0 && matchedCat) {
          const attr = matchedCat.attributes && typeof matchedCat.attributes === "object" ? matchedCat.attributes : matchedCat;
          const subList = attr.products || attr.items || attr.data || attr.list || [];
          
          categoryRawProducts = subList.map((subP) => {
            const subAttr = subP.attributes && typeof subP.attributes === "object" ? subP.attributes : subP;
            const subId = String(subP.id || subAttr.id || "");
            const subSlug = (subAttr.slug || subP.slug || "").toString().toLowerCase().trim();
            const subName = (subAttr.nameBn || subAttr.name_bn || subAttr.titleBn || subAttr.title || subAttr.name || "").toString().trim();

            const found = allProductsList.find((gp) => {
              const gAttr = gp.attributes && typeof gp.attributes === "object" ? gp.attributes : gp;
              const gId = String(gp.id || gAttr.id || "");
              const gSlug = (gAttr.slug || gp.slug || "").toString().toLowerCase().trim();
              const gName = (gAttr.nameBn || gAttr.name_bn || gAttr.titleBn || gAttr.title || gAttr.name || "").toString().trim();

              if (subId && gId && subId === gId) return true;
              if (subSlug && gSlug && subSlug === gSlug) return true;
              if (subName && gName && subName === gName) return true;
              return false;
            });
            return found || subP;
          });
        }

        const formattedProducts = categoryRawProducts.map((p) => {
          const prodAttr = p.attributes && typeof p.attributes === "object" ? p.attributes : p;
          const pName = prodAttr.nameBn || prodAttr.name_bn || prodAttr.titleBn || prodAttr.title || prodAttr.name || "";
          const price = extractPrice(prodAttr) || extractPrice(p);
          const change = extractChange(prodAttr) || extractChange(p);

          const rawUnit = (prodAttr.unit || prodAttr.unitBn || prodAttr.unit_bn || "kg").toString().toLowerCase().trim();
          const unit = unitBanglaMap[rawUnit] || prodAttr.unit || prodAttr.unitBn || prodAttr.unit_bn || "প্রতি কেজি";

          return {
            id: p.id || prodAttr.id || prodAttr._id || Math.random(),
            name: pName || "অজানা পণ্য",
            unit: unit,
            price: price,
            change: change,
            icon: prodAttr.emoji || prodAttr.icon || catIcon,
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
          এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি!
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
            {toBanglaNum(sortedProducts.length)}টি পণ্যের আজকের দাম ও পরিবর্তন
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
        মোট {toBanglaNum(sortedProducts.length)}টি পণ্য দেখানো হচ্ছে
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
                    {toBanglaNum(product.price)} টাকা
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
                  {toBanglaNum(Math.abs(product.change))}%
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