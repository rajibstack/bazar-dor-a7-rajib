"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import PriceTicker from "./PriceTicker";

const BASE_URL = "/api/bazardor";

const categoryBanglaMap = {
  chal: { name: "চাল", emoji: "🍚" },
  dal: { name: "ডাল", emoji: "🍲" },
  tel: { name: "তেল", emoji: "🥫" },
  sobji: { name: "সবজি", emoji: "🥬" },
  mach: { name: "মাছ", emoji: "🐟" },
  mangsho: { name: "মাংস", emoji: "🍗" },
  "dim-dudh": { name: "ডিম-দুধ", emoji: "🥛" },
  "dim-dud": { name: "ডিম-দুধ", emoji: "🥛" },
  "dim-dui": { name: "ডিম-দুধ", emoji: "🥛" },
  moshla: { name: "মসলা", emoji: "🌶️" },
  mosla: { name: "মসলা", emoji: "🌶️" },
};

const defaultCategories = [
  { id: "chal", name: "চাল", emoji: "🍚" },
  { id: "dal", name: "ডাল", emoji: "🍲" },
  { id: "tel", name: "তেল", emoji: "🥫" },
  { id: "sobji", name: "সবজি", emoji: "🥬" },
  { id: "mach", name: "মাছ", emoji: "🐟" },
  { id: "mangsho", name: "মাংস", emoji: "🍗" },
  { id: "dim-dudh", name: "ডিম-দুধ", emoji: "🥛" },
  { id: "moshla", name: "মসলা", emoji: "🌶️" },
];

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const currentCategory = params?.slug || searchParams.get("category");

  const [categories, setCategories] = useState(defaultCategories);
  const [banglaDate, setBanglaDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = new Intl.DateTimeFormat("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(today);
    setBanglaDate(formatted);
  }, []);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await fetch(`${BASE_URL}/categories`).catch(() => null);
        if (!res || !res.ok) return;
        const data = await res.json();
        const categoryList = Array.isArray(data)
          ? data
          : data.categories || data.data || [];
        if (Array.isArray(categoryList) && categoryList.length > 0) {
          setCategories(categoryList);
        }
      } catch (err) {
        setCategories(defaultCategories);
      }
    }
    getCategories();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 bg-[#108a00] rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
            🛒
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              বাজার দর
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {banglaDate || "শুক্রবার, ১৬ অক্টোবর, ২০২৬"}
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          {isPending ? (
            <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg" />
          ) : session ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-700">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
              >
                সাইন আউট
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-semibold text-gray-800 hover:text-[#108a00] transition"
              >
                সাইন ইন
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#108a00] hover:bg-[#0d7300] rounded-lg shadow-sm transition"
              >
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none py-2.5">
          <ul className="flex items-center justify-start md:justify-center space-x-2 sm:space-x-6 min-w-max">
            {categories.map((cat, idx) => {
              const raw =
                cat.attributes && typeof cat.attributes === "object"
                  ? cat.attributes
                  : cat;

              const catId = (raw.id || raw.slug || raw.key || raw.name || "")
                .toString()
                .toLowerCase()
                .trim();
              const mapped = categoryBanglaMap[catId] || {};

              const catName =
                raw.nameBn ||
                raw.name_bn ||
                raw.titleBn ||
                raw.title_bn ||
                mapped.name ||
                raw.name ||
                catId;

              const catEmoji = mapped.emoji || raw.emoji || raw.icon || "🍚";
              const targetSlug = raw.slug || catId;
              const isActive =
                currentCategory === catId || currentCategory === raw.slug;

              return (
                <li key={catId || idx}>
                  <Link
                    href={`/category/${encodeURIComponent(targetSlug)}`}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "text-gray-700 hover:text-[#108a00] hover:bg-gray-50"
                    }`}
                  >
                    <span>{catEmoji}</span>
                    <span>{catName}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <PriceTicker />
    </header>
  );
}