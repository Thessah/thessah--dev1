"use client";


"use client";

import { PackageIcon, Search, ShoppingCart, LifeBuoy, Menu, X, HeartIcon, StarIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { auth } from '../lib/firebase';
import { getAuth } from "firebase/auth";
console.log("Firebase UID:", getAuth().currentUser?.uid);
import Image from 'next/image';
import axios from "axios";
import toast from "react-hot-toast";
import Logo from "../assets/logo/Thessahlogo.png";
import Truck from '../assets/delivery.png';
import SignInModal from './SignInModal';

const Navbar = () => {
  // State for image search modal
  const [showImageSearch, setShowImageSearch] = useState(false);

  // Helper function for image search
  const handleImageSearch = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/search-by-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      let keyword = data.keyword || (Array.isArray(data.keywords) ? data.keywords[0] : '');
      if (keyword) {
        window.location.href = `/shop?search=${encodeURIComponent(keyword)}`;
      } else {
        alert('No matching product found.');
      }
    } catch (err) {
      alert('Image search failed.');
    }
  };

  // State for categories
  const [categories, setCategories] = useState([]);
  // State for animated search placeholder
  const [searchPlaceholder, setSearchPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [productIndex, setProductIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const hoverTimer = useRef(null);
  const categoryTimer = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const cartCount = useSelector((state) => state.cart.total);
  const [signInOpen, setSignInOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(undefined);

  // Show sign-in modal automatically on mobile for guest users
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && !firebaseUser) {
      setSignInOpen(true);
    }
  }, [firebaseUser]);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // (already declared above)

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Product names for animated placeholder
  const productNames = [
    "Wireless Headphones",
    "Smart Watch",
    "Running Shoes",
    "Coffee Maker",
    "Gaming Mouse",
    "Yoga Mat",
    "Sunglasses",
    "Laptop Bag",
    "Water Bottle",
    "Phone Case"
  ];

  // Typewriter effect for search placeholder
  useEffect(() => {
    const currentProduct = productNames[productIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (searchPlaceholder.length < currentProduct.length) {
          setSearchPlaceholder(currentProduct.substring(0, searchPlaceholder.length + 1));
        } else {
          // Wait before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (searchPlaceholder.length > 0) {
          setSearchPlaceholder(searchPlaceholder.substring(0, searchPlaceholder.length - 1));
        } else {
          // Move to next product
          setIsDeleting(false);
          setProductIndex((prev) => (prev + 1) % productNames.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [searchPlaceholder, isDeleting, productIndex, productNames]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      console.log("Navbar user:", user);
    });
    return () => unsubscribe();
  }, []);

  // Listen for custom event to open sign in modal
  useEffect(() => {
    const handleOpenSignInModal = () => {
      setSignInOpen(true);
    };
    window.addEventListener('openSignInModal', handleOpenSignInModal);
    return () => window.removeEventListener('openSignInModal', handleOpenSignInModal);
  }, []);

  useEffect(() => {
    const fetchIfLoggedIn = () => {
      if (auth.currentUser) {
        fetchWishlistCount();
      } else {
        // Get guest wishlist count from localStorage
        try {
          const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
          setWishlistCount(Array.isArray(guestWishlist) ? guestWishlist.length : 0);
        } catch {
          setWishlistCount(0);
        }
      }
    };
    fetchIfLoggedIn();
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      fetchIfLoggedIn();
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const fetchWishlistCount = async () => {
    try {
      if (!auth.currentUser) {
        // Get guest wishlist count from localStorage
        try {
          const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
          setWishlistCount(Array.isArray(guestWishlist) ? guestWishlist.length : 0);
        } catch {
          setWishlistCount(0);
        }
        return;
      }
      const token = await auth.currentUser.getIdToken();
      const { data } = await axios.get('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlistCount(data.wishlist?.length || 0);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistCount(0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!cartCount || cartCount === 0) {
      toast.error("Your cart is empty. Add some products to get started!", {
        duration: 3000,
        icon: '🛒',
      });
      return;
    }
    router.push("/cart");
  };
  

  // Seller approval check (fetch from backend) - Only check, don't show toast
  const [isSeller, setIsSeller] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(false);
  const lastCheckedUidRef = useRef(null);
  useEffect(() => {
    const uid = firebaseUser?.uid || null;
    if (!uid) {
      setIsSeller(false);
      setIsSellerLoading(false);
      lastCheckedUidRef.current = null;
      return;
    }
    if (lastCheckedUidRef.current === uid) {
      // Already checked for this UID; no need to re-call API
      return;
    }
    lastCheckedUidRef.current = uid;
    const checkSeller = async () => {
      setIsSellerLoading(true);
      try {
        const token = await firebaseUser.getIdToken(true);
        const { data } = await axios.get('/api/store/is-seller', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSeller(!!data.isSeller);
        setIsSellerLoading(false);
      } catch (err) {
        try {
          const token2 = await firebaseUser.getIdToken(true);
          const { data } = await axios.get('/api/store/is-seller', {
            headers: { Authorization: `Bearer ${token2}` },
          });
          setIsSeller(!!data.isSeller);
          setIsSellerLoading(false);
        } catch {
          setIsSeller(false);
          setIsSellerLoading(false);
        }
      }
    };
    checkSeller();
  }, [firebaseUser?.uid]);

  return (
    <>
      {/* Mobile-Only Simple Navbar for Non-Home Pages */}
      {!isHomePage && (
        <nav className="lg:hidden sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#2874f0' }}>
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Back Button */}
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                <Search size={16} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder-gray-500 text-gray-700 text-sm"
                />
              </div>
            </form>

            {/* Cart Icon */}
            <button onClick={handleCartClick} className="relative p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
              <ShoppingCart size={20} className="text-gray-700" />
              {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-blue-600 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* Original Full Navbar (Hidden on mobile for non-home pages) */}
      <nav className={`relative z-50 shadow-md ${!isHomePage ? 'hidden lg:block' : ''}`} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Bar with Logo, Search and Icons */}
        <div className="flex items-center justify-between py-4 gap-6">

          {/* Left Side - Hamburger (Mobile) + Logo */}
          <div className="flex items-center gap-2">
            {/* Hamburger Menu - Mobile Only on Home Page */}
            {isHomePage && (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
              >
                {mobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
              </button>
            )}
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image src={Logo} alt="Qui Logo" width={140} height={40} className="object-contain" priority />
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden lg:flex items-center flex-1 justify-center px-8 max-w-2xl">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center w-full text-sm gap-2 bg-gray-50 px-4 py-2.5 rounded-md border border-gray-300 focus-within:border-gray-400 focus-within:bg-white transition">
              <Search size={18} className="text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder || "Search products"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none placeholder-gray-500 text-gray-700"
                required
              />
              {/* Camera Icon for image search (temporarily hidden)
              <button type="button" className="flex-shrink-0" onClick={() => setShowImageSearch(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 hover:text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h2.086a2.25 2.25 0 001.591-.659l.828-.828A2.25 2.25 0 0111.75 3h.5a2.25 2.25 0 011.595.663l.828.828a2.25 2.25 0 001.591.659h2.086A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
              */}
            </form>
            {/* Image Search Modal (Desktop only) */}
            {typeof window !== 'undefined' && window.innerWidth >= 768 && showImageSearch && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-slideUp">
                  <button
                    onClick={() => setShowImageSearch(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold mb-2">Search by image</h2>
                  <p className="text-sm text-gray-500 mb-4">Find what you love with better prices by using an image search.</p>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 px-4 mb-4 cursor-pointer"
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) await handleImageSearch(file);
                    }}
                    onDragOver={e => e.preventDefault()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-2">
                      <rect x="4" y="4" width="16" height="16" rx="2" fill="#f3f4f6" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16l4-4 4 4" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                    <span className="text-gray-500 mb-2">Drag an image here</span>
                    <span className="text-gray-400 text-xs mb-2">or</span>
                    <label htmlFor="image-search-upload-modal" className="inline-block">
                      <input
                        id="image-search-upload-modal"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) await handleImageSearch(file);
                        }}
                      />
                      <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold cursor-pointer">Upload a photo</span>
                    </label>
                    <span className="text-gray-400 text-xs mt-2">*For a quick search hit CTRL+V to paste an image into the search box</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {/* Store Locator */}
            <button className="flex flex-col items-center gap-0.5 hover:text-red-600 transition text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs font-medium">Store</span>
            </button>

            {/* Wishlist */}
            <Link href={firebaseUser ? "/dashboard/wishlist" : "/wishlist"} className="relative flex flex-col items-center gap-0.5 hover:text-red-600 transition text-gray-600">
              <HeartIcon size={20} className="transition" />
              <span className="text-xs font-medium">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={handleCartClick} className="relative flex flex-col items-center gap-0.5 hover:text-red-600 transition text-gray-600">
              <ShoppingCart size={20} className="transition" />
              <span className="text-xs font-medium">Cart</span>
              {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login/User Button */}
            {firebaseUser ? (
              <div
                className="relative"
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-red-600 transition text-gray-600">
                  {firebaseUser.photoURL ? (
                    <Image src={firebaseUser.photoURL} alt="User" width={24} height={24} className="rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-600 text-white font-bold text-xs">
                      {firebaseUser.displayName?.[0]?.toUpperCase() || firebaseUser.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <span className="text-xs font-medium">Account</span>
                </div>
                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/browse-history"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Browse History
                    </Link>
                    {isSeller && (
                      <Link
                        href="/store"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <div className="my-1 border-t border-gray-200" />
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={async () => {
                        await auth.signOut();
                        setUserDropdownOpen(false);
                        router.push('/');
                        toast.success('Signed out successfully');
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="flex flex-col items-center gap-0.5 hover:text-red-600 transition text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-xs font-medium">Account</span>
              </button>
            )}
          </div>

          {/* Mobile Right Side - Login Icon + Cart */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Show user avatar if signed in, else login icon */}
            {isHomePage && (
              firebaseUser ? (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  {firebaseUser.photoURL ? (
                    <Image src={firebaseUser.photoURL} alt="User" width={28} height={28} className="rounded-full object-cover" />
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-600 text-white font-bold text-base">
                      {firebaseUser.displayName?.[0]?.toUpperCase() || firebaseUser.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setSignInOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              )
            )}
            
            <button onClick={handleCartClick} className="relative p-2">
              <ShoppingCart size={20} className="text-gray-700" />
              {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Navigation Bar - Jewelry Categories */}
        <div className="hidden lg:block border-t border-gray-200">
          <div className="flex items-center justify-center gap-8 py-3">
            <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-red-600 transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Jewellery
            </Link>

            <Link href="/shop?category=gold" className="text-sm font-medium text-gray-700 hover:text-red-600 transition">
              Gold
            </Link>

            <Link href="/shop?category=diamond" className="text-sm font-medium text-gray-700 hover:text-red-600 transition">
              Diamond
            </Link>

            <Link href="/shop?category=earrings" className="text-sm font-medium text-gray-700 hover:text-red-600 transition">
              Earrings
            </Link>

            <Link href="/shop?category=rings" className="text-sm font-medium text-gray-700 hover:text-red-600 transition">
              Rings
            </Link>

            <Link href="/shop?category=daily-wear" className="text-sm font-medium text-gray-700 hover:text-red-600 transition">
              Daily Wear
            </Link>

            {/* Collections Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (categoryTimer.current) clearTimeout(categoryTimer.current);
                setCategoriesDropdownOpen(true);
              }}
              onMouseLeave={() => {
                if (categoryTimer.current) clearTimeout(categoryTimer.current);
                categoryTimer.current = setTimeout(() => {
                  setCategoriesDropdownOpen(false);
                  setHoveredCategory(null);
                }, 200);
              }}
            >
              <button className="text-sm font-medium text-gray-700 hover:text-red-600 transition flex items-center gap-1">
                Collections
                <svg className={`w-4 h-4 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {categoriesDropdownOpen && categories.length > 0 && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex">
                  {/* Main Categories */}
                  <div className="w-64 bg-gray-50 border-r border-gray-200">
                    {categories.filter(cat => !cat.parentId).map((category) => {
                      const categorySlug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                      return (
                        <div
                          key={category._id}
                          className="relative"
                          onMouseEnter={() => setHoveredCategory(category._id)}
                        >
                          <Link
                            href={`/shop?category=${categorySlug}`}
                            className={`flex items-center justify-between px-4 py-3 hover:bg-red-50 transition ${
                              hoveredCategory === category._id ? 'bg-red-50 text-red-600' : 'text-gray-700'
                            }`}
                            onClick={() => {
                              setCategoriesDropdownOpen(false);
                              setHoveredCategory(null);
                            }}
                          >
                            <span className="font-medium">{category.name}</span>
                            {category.children && category.children.length > 0 && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subcategories */}
                  {hoveredCategory && (
                    <div className="w-64 bg-white p-4">
                      {categories
                        .find(cat => cat._id === hoveredCategory)
                        ?.children?.map((subcat) => {
                          const subcatSlug = subcat.slug || subcat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                          return (
                            <Link
                              key={subcat._id}
                              href={`/shop?category=${subcatSlug}`}
                              className="block px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                              onClick={() => {
                                setCategoriesDropdownOpen(false);
                                setHoveredCategory(null);
                              }}
                            >
                              {subcat.name}
                            </Link>
                          );
                        })}
                      {(!categories.find(cat => cat._id === hoveredCategory)?.children?.length) && (
                        <p className="text-sm text-gray-400 px-3 py-2">No subcategories</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/shop?category=wedding" className="text-sm font-medium text-gray-700 hover:text-red-600 transition">
              Wedding
            </Link>

            <Link href="/shop?category=gifting" className="text-sm font-medium text-gray-700 hover:text-red-600 transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Gifting
            </Link>

            <button className="text-sm font-medium text-gray-700 hover:text-red-600 transition flex items-center gap-1">
              More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Below main navbar on mobile */}
        <div className="lg:hidden pb-3" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSearch} className="flex items-center text-sm gap-2 bg-gray-50 mx-4 px-4 py-2.5 rounded-md border border-gray-300">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder={searchPlaceholder || "Search jewellery"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-gray-500 text-gray-700"
              required
            />
          </form>
        </div>

        {/* Mobile Overlay Menu */}
        {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-[9999]" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto animate-slideIn" 
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideInLeft 0.3s ease-out' }}
          >
              {/* Header with Logo and Close Button */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <Image src={require('../assets/logo/Asset 12.png')} alt="QuickFynd Logo" width={120} height={35} className="object-contain" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* User Section */}
              {firebaseUser === undefined ? null : !firebaseUser ? (
                <button
                  type="button"
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition mb-4"
                  onClick={() => {
                    setSignInOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </button>
              ) : (
                <div className="w-full px-4 py-3 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4 flex items-center gap-2">
                  {firebaseUser.photoURL ? (
                    <Image src={firebaseUser.photoURL} alt="User" width={28} height={28} className="rounded-full object-cover" />
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-base">
                      {firebaseUser.displayName?.[0]?.toUpperCase() || firebaseUser.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <span className="font-medium">Hi, {firebaseUser.displayName || firebaseUser.email}</span>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-col gap-1">
                {firebaseUser && (
                  <>
                    <Link 
                      href="/dashboard/profile" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Profile</span>
                    </Link>
                    <Link 
                      href="/dashboard/orders" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PackageIcon size={18} className="text-gray-600" />
                      <span>My Orders</span>
                    </Link>
                    <Link 
                      href="/browse-history" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Browse History</span>
                    </Link>
                    <button
                      className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-600 font-medium mt-2"
                      onClick={async () => {
                        await auth.signOut();
                        setMobileMenuOpen(false);
                        toast.success('Signed out successfully');
                        window.location.reload();
                      }}
                    >
                      Sign Out
                    </button>
                    <div className="px-4"><div className="h-px bg-gray-200 my-2" /></div>
                  </>
                )}
                <Link 
                  href="/top-selling" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Top Selling Items
                </Link>
                <Link 
                  href="/new" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Arrivals
                </Link>

                <Link 
                  href="/5-star-rated" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <StarIcon size={18} className="text-orange-500" fill="#FFA500" />
                  5 Star Rated
                </Link>

                <Link 
                  href="/fast-delivery" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  Fast Delivery
                </Link>

                <Link 
                  href={firebaseUser ? "/dashboard/wishlist" : "/wishlist"}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <HeartIcon size={18} className="text-orange-500" />
                    <span>Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/cart" 
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={18} className="text-blue-600" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/orders" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PackageIcon size={18} className="text-gray-600" />
                  <span>My Orders</span>
                </Link>
                {isSeller && (
                  <Link 
                    href="/store" 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Seller</span>
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>

              {/* Support Section */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">Support</p>
                <Link 
                  href="/faq" 
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  href="/support" 
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
                <Link 
                  href="/terms" 
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Terms & Conditions
                </Link>
                <Link 
                  href="/privacy-policy" 
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/return-policy" 
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Return Policy
                </Link>
                {firebaseUser && (
                  <button
                    className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-600 font-medium mt-4"
                    onClick={async () => {
                      await auth.signOut();
                      setMobileMenuOpen(false);
                      toast.success('Signed out successfully');
                      window.location.reload();
                    }}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign In Modal (always at Navbar root) */}
      {!firebaseUser && <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />}
    </nav>
    </>
  );
};

export default Navbar;
