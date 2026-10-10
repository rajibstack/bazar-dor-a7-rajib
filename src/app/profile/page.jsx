"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client"; // আপনার প্রজেক্টের সঠিক পাথ অনুযায়ী দিন
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="p-8 text-center text-gray-500">লোড হচ্ছে...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">অনুগ্রহ করে প্রথমে সাইন ইন করুন!</h2>
        <Link href="/" className="bg-[#108a00] text-white px-6 py-2.5 rounded-xl text-sm">
          হোম পেজে যান
        </Link>
      </div>
    );
  }

  const user = session.user;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("সফলভাবে সাইন আউট হয়েছে!");
          router.push("/");
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">আমার প্রোফাইল</h1>
        <p className="text-xs text-gray-500 mt-1">আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user.image || "https://via.placeholder.com/150"}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile/update"
            className="border border-[#108a00] text-[#108a00] hover:bg-emerald-50 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            এডিট প্রোফাইল
          </Link>
          <button
            onClick={handleSignOut}
            className="border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            সাইন আউট
          </button>
        </div>
      </div>
    </div>
  );
}