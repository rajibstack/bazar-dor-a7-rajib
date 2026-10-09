"use client";

import { useEffect, useState } from "react";

const PRIMARY_API = "https://api.api-store.workers.dev/api/bazardor/products";
const SECONDARY_API = "https://api.abcz.workers.dev/api/bazardor/products";

const fallbackProducts = [
  { id: 1, name: "স্বর্ণমাছি চাল", price: 48, unit: "কেজি", change: 2.5, changeType: "up", emoji: "🍚" },
  { id: 2, name: "মিনিকেট চাল", price: 99, unit: "কেজি", change: -2.9, changeType: "down", emoji: "🍚" },
  { id: 3, name: "বাটাম সাইজ চাল", price: 66, unit: "কেজি", change: 3.7, changeType: "up", emoji: "🍚" },
  { id: 4, name: "মসুর ডাল", price: 142, unit: "কেজি", change: 2.9, changeType: "up", emoji: "🫘" },
  { id: 5, name: "ছোলা", price: 120, unit: "কেজি", change: -2.4, changeType: "down", emoji: "🫘" },
  { id: 6, name: "সয়াবিন তেল", price: 168, unit: "লিটার", change: 1.2, changeType: "up", emoji: "🥫" }
];

const toBanglaDigits = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "০";
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return val.toString().replace(/\d/g, (x) => banglaDigits[x]);
};

const formatUnit = (unit) => {
  if (!unit) return "কেজি";
  const str = unit.toString().toLowerCase();
  if (str === "kg" || str === "কেজি") return "কেজি";
  if (str === "litre" || str === "liter" || str === "লিটার") return "লিটার";
  return unit;
};

const extractProductDetails = (item) => {
  if (!item || typeof item !== "object") return null;

  const dataObj = item.attributes || item.product || item.data || item;

  const name =
    dataObj.name ||
    dataObj.title ||
    dataObj.productName ||
    dataObj.product_name ||
    dataObj.name_bn ||
    dataObj.title_bn ||
    dataObj.item_name;

  const price =
    dataObj.price ??
    dataObj.currentPrice ??
    dataObj.current_price ??
    dataObj.bazarPrice ??
    dataObj.price_bdt ??
    dataObj.amount ??
    dataObj.today_price;

  const change =
    dataObj.change ??
    dataObj.percentage ??
    dataObj.change_percent ??
    dataObj.percent_change ??
    dataObj.changePercentage ??
    dataObj.diff ??
    0;

  if (!name || price === undefined) return null;

  return {
    id: dataObj.id || name,
    name,
    price,
    change,
    unit: formatUnit(dataObj.unit || dataObj.unit_name || dataObj.qty_unit),
    emoji: dataObj.emoji || dataObj.icon || "🍚",
    changeType: dataObj.changeType || (Number(change) < 0 ? "down" : "up")
  };
};

export default function PriceTicker() {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let res = await fetch(PRIMARY_API);
        if (!res.ok) {
          res = await fetch(SECONDARY_API);
        }
        const data = await res.json();
        const rawList = Array.isArray(data)
          ? data
          : data?.products || data?.data || data?.result || [];

        const parsedList = rawList
          .map(extractProductDetails)
          .filter(Boolean);

        if (parsedList.length > 0) {
          setProducts(parsedList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading && !products.length) {
    return (
      <div className="w-full bg-[#f4f8f4] border-y border-emerald-100 py-2.5 px-4 text-xs text-gray-500 text-center">
        বাজার দর লোড হচ্ছে...
      </div>
    );
  }

  if (!products.length) return null;

  const marqueeItems = [...products, ...products, ...products];

  return (
    <div className="w-full bg-[#f4f9f5] border-y border-emerald-100/80 overflow-hidden py-2 text-sm">
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 30s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-track">
        {marqueeItems.map((item, idx) => {
          const numChange = isNaN(Number(item.change)) ? 0 : Number(item.change);
          const isUp = item.changeType === "up" || numChange >= 0;

          return (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center space-x-2 whitespace-nowrap px-4 border-r border-emerald-200/60 last:border-none"
            >
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-600 font-medium">
                {toBanglaDigits(item.price)} টাকা/{item.unit}
              </span>
              <span
                className={`flex items-center text-xs font-semibold ${
                  isUp ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {isUp ? "▲" : "▼"} {toBanglaDigits(Math.abs(numChange))}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}