"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UpdateProfilePage() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  // File selection with 1MB validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_SIZE) {
        toast.error("ছবি ১ মেগাবাইটের (1MB) কম হতে হবে!");
        e.target.value = "";
        setSelectedFile(null);
        setPreviewUrl("");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error("অনুগ্রহ করে একটি ছবি নির্বাচন করুন");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=c304d9943f6630fbcfa3efcf0154bf52",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setImage(data.data.url);
        toast.success("ছবি যোগ করা হয়েছে! সংরক্ষণ বাটনে ক্লিক করুন।");
        setIsModalOpen(false);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
          toast.success("ছবি প্রস্তুত করা হয়েছে!");
          setIsModalOpen(false);
        };
        reader.readAsDataURL(selectedFile);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        toast.success("ছবি সিলেক্ট করা হয়েছে!");
        setIsModalOpen(false);
      };
      reader.readAsDataURL(selectedFile);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.updateUser({
        name: name,
        image: image,
        fetchOptions: {
          onSuccess: () => {
            toast.success("প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!");
            router.refresh(); // ⚡ নেভবার এবং সাইটের সেশন ডেটা ইনস্ট্যান্ট রিফ্রেশ করার জন্য
            router.push("/profile");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "আপডেট করতে সমস্যা হয়েছে!");
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
    <div className="min-h-screen bg-[#f3f6f3] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">প্রোফাইল আপডেট করুন</h1>
          <p className="text-xs text-gray-500">আপনার নাম এবং প্রোফাইল ছবি পরিবর্তন করুন।</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Avatar / Profile Picture */}
          <div className="flex items-center gap-5">
            {image ? (
              <img
                src={image}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-[#108a00] font-bold flex items-center justify-center text-2xl border border-emerald-200">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-50 text-[#108a00] hover:bg-emerald-100 font-medium text-sm rounded-xl border border-emerald-200 transition flex items-center gap-2"
              >
                📷 ছবি সংযুক্ত করুন
              </button>
              <p className="text-xs text-gray-400 mt-1">সর্বোচ্চ সাইজ: ১ মেগাবাইট (1MB)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#108a00] hover:bg-[#0d7300] text-white font-medium rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </form>
      </div>

      {/* Upload Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">ছবি সিলেক্ট করুন (Max 1MB)</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-gray-50 transition cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Selected"
                    className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                  />
                  <span className="text-xs text-emerald-600 font-medium">ছবি সিলেক্ট করা হয়েছে</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-3xl">📁</span>
                  <p className="text-sm font-medium text-gray-700">ডিভাইস থেকে ছবি বেছে নিন</p>
                  <p className="text-xs text-gray-400">সর্বোচ্চ সাইজ ১ মেগাবাইট (1MB)</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!selectedFile || uploading}
                className="px-5 py-2 bg-[#108a00] hover:bg-[#0d7300] text-white text-sm font-medium rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {uploading ? "আপলোড হচ্ছে..." : "আপলোড নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}