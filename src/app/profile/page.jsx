"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f3] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">আমার প্রোফাইল</h1>
          <p className="text-sm text-gray-500">আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user?.name || "User"}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {session?.user?.name || "ব্যবহারকারী"}
              </h2>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition flex items-center gap-1.5"
          >
            ↪ সাইন আউট
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-gray-900">তথ্য</h3>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">নাম</label>
            <input
              type="text"
              value={name}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none"
            />
          </div>

          <Link
            href="/profile/update"
            className="block w-full py-3 bg-[#108a00] hover:bg-[#0d7300] text-white text-center font-medium rounded-xl transition shadow-sm"
          >
            আপডেট করুন
          </Link>
        </div>
      </div>
    </div>
  );
}