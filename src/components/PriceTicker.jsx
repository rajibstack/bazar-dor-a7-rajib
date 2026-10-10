"use client";

import { useEffect, useState } from "react";
import { parseApiProduct, formatBanglaNumber } from "@/lib/parser";

const PRODUCTS_API = "https://api.api-store.workers.dev/api/bazardor/products";

export default function PriceTicker() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicker() {
      try {
        const res = await fetch(PRODUCTS_API);
        const data = await res.json();
        const rawList = Array.isArray(data)
          ? data
          : data?.products || data?.data || data?.result || [];

        const parsed = rawList.map((item, idx) => parseApiProduct(item, idx)).filter(Boolean);
        if (parsed.length > 0) {
          setProducts(parsed);
        }
      } catch (err) {
        console.error("Ticker Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTicker();
  }, []);

  if (loading && !products.length) return null;
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
          animation: tickerScroll 70s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-track">
        {marqueeItems.map((item, idx) => {
          const numChange = isNaN(Number(item.change)) ? 0 : Number(item.change);
          const isUp = numChange >= 0;

          return (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center space-x-2 whitespace-nowrap px-4 border-r border-emerald-200/60 last:border-none"
            >
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-600 font-medium">
                {formatBanglaNumber(item.price)} টাকা/{item.unit}
              </span>
              <span
                className={`flex items-center text-xs font-semibold ${
                  isUp ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {isUp ? "▲" : "▼"} {formatBanglaNumber(Math.abs(numChange))}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}