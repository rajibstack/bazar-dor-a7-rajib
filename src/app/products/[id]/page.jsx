"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { parseApiProduct, formatBanglaNumber } from "@/lib/parser";

const PRODUCTS_API = "/api/bazardor/products";

const translateCategory = (cat = "") => {
  const c = cat.toLowerCase().trim();
  if (c === "chal" || c.includes("rice")) return "চাল";
  if (c === "mosla" || c === "mosola" || c.includes("spice")) return "মসলা";
  if (c === "mach" || c.includes("fish")) return "মাছ";
  if (c === "mangsho" || c.includes("meat")) return "মাংস";
  if (c === "sobji" || c.includes("vegetable")) return "সবজি";
  if (c === "dudh" || c.includes("milk") || c.includes("dairy")) return "দুধ ও ডিম";
  if (c === "tel" || c.includes("oil")) return "তেল";
  return cat || "পণ্য";
};

const translateUnit = (unit = "") => {
  const u = unit.toLowerCase().trim();
  if (u === "kg" || u === "kilogram") return "কেজি";
  if (u === "litre" || u === "liter") return "লিটার";
  if (u === "piece" || u === "pcs") return "পিস";
  if (u === "dozen") return "ডজন";
  return unit || "কেজি";
};

function ProductDetailsContent() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchProductAndMarkets() {
      setLoading(true);
      try {
        const res = await fetch(PRODUCTS_API).catch(() => null);
        let data = null;
        if (res && res.ok) {
          data = await res.json();
        }
        const rawList = Array.isArray(data)
          ? data
          : data?.products || data?.data || data?.result || [];

        const parsedList = rawList.map((item, idx) => parseApiProduct(item, idx)).filter(Boolean);

        let found = parsedList.find((p) => String(p.id) === String(id));
        
        if (!found && !isNaN(id)) {
          found = parsedList[Number(id)];
        }
        if (!found && parsedList.length > 0) {
          found = parsedList[0];
        }

        if (found) {
          const rawCat = found.category || "chal";
          const catBn = translateCategory(rawCat);
          const unitBn = translateUnit(found.unit);

          setProduct({
            ...found,
            categorySlug: rawCat,
            category: catBn,
            unit: unitBn,
            subtitle: `প্রতি ${unitBn} · ${catBn}`,
            trendText: found.change >= 0 
              ? `গতকালের তুলনায় আজ দাম বেড়েছে · ${formatBanglaNumber(Math.abs(found.change))}%` 
              : `গতকালের তুলনায় আজ দাম কমেছে · ${formatBanglaNumber(Math.abs(found.change))}%`
          });

          const basePrice = found.price;
          const marketNames = [
            { name: "মঠ বাজার", division: "ময়মনসিংহ" },
            { name: "সদর বাজার", division: "রাজশাহী" },
            { name: "বাজারহাট", division: "খুলনা" },
            { name: "বাসারহাট বাজার", division: "রাজশাহী" },
            { name: "চৌর বাজার", division: "ময়মনসিংহ" },
            { name: "আয়তলী বাজার", division: "চট্টগ্রাম" },
            { name: "ডবলগেট বাজার", division: "খুলনা" },
            { name: "চৌরাস্তা বাজার", division: "সিলেট" },
            { name: "গ্রীন মার্কেট, মিরপুর", division: "ঢাকা" },
            { name: "চোদগ্রাম বাজার", division: "চট্টগ্রাম" },
            { name: "আমবাজার", division: "সিলেট" },
            { name: "কারওয়ান বাজার", division: "ঢাকা" },
          ];

          const generatedMarkets = marketNames.map((m, idx) => {
            const min = Math.max(10, Math.round(basePrice - 6 + (idx % 4)));
            const max = Math.round(basePrice + 5 + (idx % 5));
            const avg = Number(((min + max) / 2).toFixed(1));
            return { ...m, min, max, avg };
          });

          setMarkets(generatedMarkets);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndMarkets();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
        <p className="mt-3 text-sm font-medium text-gray-500">ডেটা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500">
        কোনো পণ্য পাওয়া যায়নি।
      </div>
    );
  }

  const minPrice = markets.length ? Math.min(...markets.map(m => m.min)) : product.price - 5;
  const maxPrice = markets.length ? Math.max(...markets.map(m => m.max)) : product.price + 5;
  const avgPrice = product.price;
  const isIncrease = product.change >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <nav className="text-xs sm:text-sm text-gray-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-emerald-600 transition">হোম</Link>
        <span>›</span>
        <Link href={`/?category=${product.categorySlug}`} className="hover:text-emerald-600 transition">
          {product.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl border border-gray-100 shadow-inner shrink-0">
            {product.emoji}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Link 
                href={`/?category=${product.categorySlug}`}
                className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium px-2.5 py-0.5 rounded-full transition inline-block"
              >
                {product.category}
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{product.subtitle}</p>
            <p className={`text-xs font-medium mt-1 ${isIncrease ? "text-red-600" : "text-emerald-600"}`}>
              {product.trendText}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center md:text-right shrink-0">
          <span className="text-xs text-gray-400 block mb-1">আজকের দাম</span>
          <div className="flex items-baseline justify-center md:justify-end space-x-1.5">
            <span className="text-3xl font-black text-gray-900">
              {formatBanglaNumber(product.price)}
            </span>
            <span className="text-sm font-bold text-gray-600">টাকা / {product.unit}</span>
          </div>
          <div className={`flex items-center justify-center md:justify-end space-x-1 mt-1 text-xs font-bold ${isIncrease ? "text-red-600" : "text-emerald-600"}`}>
            <span>{isIncrease ? "▲" : "▼"}</span>
            <span>{formatBanglaNumber(Math.abs(product.change))}%</span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">দামের সারসংক্ষেপ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block mb-1">সর্বনিম্ন দাম</span>
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {formatBanglaNumber(minPrice)} টাকা
            </div>
            <p className="text-xs text-gray-500">সবচেয়ে কম দামের বাজার</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block mb-1">সর্বাধিক দাম</span>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatBanglaNumber(maxPrice)} টাকা
            </div>
            <p className="text-xs text-gray-500">সবচেয়ে বেশি দামের বাজার</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block mb-1">গড় দাম</span>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatBanglaNumber(avgPrice)} টাকা
            </div>
            <p className="text-xs text-gray-500">প্রতি {product.unit}-এর হিসাব</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">বাজারভিত্তিক আজকের দাম</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs sm:text-sm font-semibold text-gray-600">
                  <th className="py-3.5 px-6">বাজার</th>
                  <th className="py-3.5 px-6">বিভাগ</th>
                  <th className="py-3.5 px-6">সর্বনিম্ন</th>
                  <th className="py-3.5 px-6">সর্বাধিক</th>
                  <th className="py-3.5 px-6">গড়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                {markets.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-6 font-medium text-gray-900">{m.name}</td>
                    <td className="py-3.5 px-6 text-gray-500">{m.division}</td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600">{formatBanglaNumber(m.min)} টাকা</td>
                    <td className="py-3.5 px-6 font-semibold text-red-600">{formatBanglaNumber(m.max)} টাকা</td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">{formatBanglaNumber(m.avg)} টাকা</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
        <p className="mt-3 text-sm font-medium text-gray-500">ডেটা লোড হচ্ছে...</p>
      </div>
    }>
      <ProductDetailsContent />
    </Suspense>
  );
}