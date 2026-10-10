"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(
          error.message || "লগইন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        );
      } else {
        toast.success("সফলভাবে লগইন হয়েছে!");
        router.push("/");
      }
    } catch (err) {
      toast.error("কোথাও কোনো সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err) {
      toast.error("সোশ্যাল লগইন ব্যর্থ হয়েছে।");
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F4EC] flex flex-col items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">সাইন ইন</h1>
        <p className="text-sm text-gray-600 mt-1">
          বিস্তৃত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্ট ঢুকুন।
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ইমেইল
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="তোমার ই-মেইল"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৮ অক্ষর"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#198754] hover:bg-[#157347] text-white font-medium rounded-lg transition duration-200 shadow-sm"
          >
            {loading ? "লগইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">অথবা</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialSignIn("google")}
            className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Google দিয়ে চালিয়ে যান
          </button>
          <button
            onClick={() => handleSocialSignIn("github")}
            className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            GitHub দিয়ে চালিয়ে যান
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/signup"
            className="text-[#198754] font-medium hover:underline"
          >
            সাইন আপ করুন
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          ← হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
