"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroBanner() {
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

  const scrollToProducts = (e) => {
    e.preventDefault();
    const target = document.getElementById("sob-ponno");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="bg-[#f2f8f3] rounded-3xl p-6 sm:p-12 border border-emerald-100/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 flex flex-col items-start text-left space-y-4">
          <div className="bg-[#e2f0e4] text-[#108a00] text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full">
            {banglaDate || "শুক্রবার, ৯ অক্টোবর, ২০২৬"}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight text-left">
            আজকের বাজারের দাম এক নজরে
          </h1>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl text-left">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক
            বিস্তারিত, গড়, সর্বনিম্ন-সর্বাধিক এবং দামের পরিবর্তন এক জায়গায়।
          </p>

          <div className="pt-2">
            <a
              href="#sob-ponno"
              onClick={scrollToProducts}
              className="inline-flex items-center justify-center bg-[#108a00] hover:bg-[#0d7300] text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200"
            >
              সব পণ্য দেখুন
            </a>
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-center md:justify-end items-center">
          <Image
            src="/bazar-hero.png"
            alt="আজকের বাজার দর"
            width={320}
            height={260}
            className="object-contain max-h-64 w-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}