"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const isLoggedIn = false;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("অনুগ্রহ করে প্রথমে সাইন ইন করুন!");
      router.push("/");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
    </div>
  );
}