import { Suspense } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProductSections from "@/components/ProductSections";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-[#f7faf8] min-h-screen pb-16">
      <HeroBanner />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">লোড হচ্ছে...</div>}>
        <ProductSections />
      </Suspense>
    </div>
  );
}