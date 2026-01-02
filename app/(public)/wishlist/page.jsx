'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  CheckCircle2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/cart/cartSlice";
import PageTitle from "@/components/PageTitle";
import Loading from "@/components/Loading";
import DashboardSidebar from "@/components/DashboardSidebar";

const PLACEHOLDER_IMAGE = "/placeholder.png";

/* ----------------------------------------------------
   Normalize wishlist item (API / Guest safe)
---------------------------------------------------- */
const getProduct = (item) => {
  if (!item) return null;
  if (item.product) {
    return {
      ...item.product,
      _pid: item.productId || item.product.id,
    };
  }
  return {
    ...item,
    _pid: item.productId || item.id,
  };
};

export default function WishlistAuthed() {
  const { user, isSignedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [wishlist, setWishlist] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    isSignedIn ? loadUserWishlist() : loadGuestWishlist();
  }, [authLoading, isSignedIn]);

  const loadGuestWishlist = () => {
    try {
      const data = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      setWishlist(Array.isArray(data) ? data : []);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };
  const loadUserWishlist = async () => {
    try {
      const token = await user.getIdToken(true);
      const { data } = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(Array.isArray(data?.wishlist) ? data.wishlist : []);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };
  const removeFromWishlist = async (pid) => {
    if (!isSignedIn) {
      const updated = wishlist.filter((i) => (i.productId || i.id) !== pid);
      localStorage.setItem("guestWishlist", JSON.stringify(updated));
      setWishlist(updated);
      setSelected((s) => s.filter((x) => x !== pid));
      return;
    }
    const token = await user.getIdToken(true);
    await axios.post(
      "/api/wishlist",
      { productId: pid, action: "remove" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setWishlist((w) => w.filter((i) => i.productId !== pid));
    setSelected((s) => s.filter((x) => x !== pid));
  };
  const toggleSelect = (pid) => {
    setSelected((s) =>
      s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]
    );
  };
  const selectAll = () => {
    setSelected(
      selected.length === wishlist.length
        ? []
        : wishlist.map((i) => i.productId || i.id)
    );
  };
  const addSelectedToCart = () => {
    selected.forEach((pid) => {
      const item = wishlist.find((i) => (i.productId || i.id) === pid);
      const product = getProduct(item);
      if (product) dispatch(addToCart({ product }));
    });
    router.push("/cart");
  };
  const total = selected.reduce((sum, pid) => {
    const item = wishlist.find((i) => (i.productId || i.id) === pid);
    const product = getProduct(item);
    return sum + Number(product?.price || 0);
  }, 0);
  if (authLoading || loading) return <Loading />;
  return (
    <>
      <PageTitle title="My Wishlist" />
      <div className="max-w-7xl mx-auto px-2 py-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <main>
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={selected.length === wishlist.length && wishlist.length > 0}
                onChange={selectAll}
                className="accent-orange-500 w-5 h-5"
                id="selectAllWishlist"
              />
              <label htmlFor="selectAllWishlist" className="font-medium text-gray-800 select-none cursor-pointer">
                Select all ({wishlist.length})
              </label>
            </div>
            {wishlist.length === 0 ? (
              <div className="text-center py-20">
                <HeartIcon size={60} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold">Wishlist is empty</h2>
                <button
                  onClick={() => router.push("/shop")}
                  className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {wishlist.map((item) => {
                  const product = getProduct(item);
                  if (!product) return null;
                  const img = product.images?.[0] || PLACEHOLDER_IMAGE;
                  const isSelected = selected.includes(product._pid);
                  const [imgError, setImgError] = useState(false);
                  const handleSelect = (e) => { e.stopPropagation(); toggleSelect(product._pid); };
                  const handleRemove = (e) => { e.stopPropagation(); removeFromWishlist(product._pid); };
                  const handleAddToCart = (e) => { e.stopPropagation(); dispatch(addToCart({ product })); };
                  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                  return (
                    <div key={product._pid} className="flex items-center gap-4 py-4 group hover:bg-gray-50 transition rounded-lg">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleSelect}
                        className="accent-orange-500 w-5 h-5 mt-1"
                        tabIndex={0}
                      />
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={imgError ? PLACEHOLDER_IMAGE : img}
                          alt={product.name}
                          fill
                          className="object-contain rounded-lg border bg-white"
                          loading="lazy"
                          priority={false}
                          onError={() => setImgError(true)}
                        />
                        {discount > 0 && (
                          <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate block max-w-[180px] md:max-w-[260px]">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-lg text-gray-900">₹{product.price || 0}</span>
                          {product.mrp && (
                            <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={handleAddToCart}
                          className="bg-orange-500 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={handleRemove}
                          className="text-red-500 hover:underline text-xs flex items-center gap-1"
                        >
                          <TrashIcon size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        {/* SUMMARY */}
        <aside className="sticky top-24 bg-white border rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Selected</span>
              <span>{selected.length}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button
            disabled={selected.length === 0}
            onClick={addSelectedToCart}
            className={`w-full mt-5 py-3 rounded-lg font-semibold ${selected.length === 0 ? "bg-gray-200 text-gray-400" : "bg-orange-500 text-white hover:bg-orange-600"}`}
          >
            {selected.length === 0 ? "Go to Checkout" : `Checkout (${selected.length})`}
          </button>
        </aside>
      </div>
      {/* MOBILE CHECKOUT BAR */}
      {selected.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs">{selected.length} selected</p>
              <p className="font-bold">₹{total.toFixed(2)}</p>
            </div>
            <button
              onClick={addSelectedToCart}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
