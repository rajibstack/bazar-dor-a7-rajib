"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm font-sans">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        পেইজটি খুঁজে পাওয়া যায়নি!
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        আপনি যে পেইজটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা লিংকটি ভুল রয়েছে।
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