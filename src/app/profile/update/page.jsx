"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UpdateProfilePage() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.updateUser({
        name: name,
        fetchOptions: {
          onSuccess: () => {
            toast.success("তথ্য সফলভাবে আপডেট করা হয়েছে!");
            router.push("/profile");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "আপডেট করতে সমস্যা হয়েছে!");
          },
        },
      });
    } catch (err) {
      toast.error("কোথাও কোনো ত্রুটি ঘটেছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">আমার প্রোফাইল</h1>
        <p className="text-xs text-gray-500 mt-1">
          আপনার অ্যাকাউন্টের তথ্য এখানে আপডেট করুন।
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-800 text-base pb-2 border-b border-gray-100">
          তথ্য
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="আপনার নাম লিখুন"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#108a00] hover:bg-[#0d7300] text-white font-medium py-2.5 rounded-xl transition-all text-sm shadow-sm"
          >
            {loading ? "আপডেট হচ্ছে..." : "আপডেট"}
          </button>
        </form>
      </div>
    </div>
  );
}
