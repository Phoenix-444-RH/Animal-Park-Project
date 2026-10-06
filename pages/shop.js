'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { demoProducts } from "../lib/animal-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [openSelect, setOpenSelect] = useState(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;

    if (typeof router.query.search === "string") setSearch(router.query.search);
    if (typeof router.query.category === "string") setCategory(router.query.category);
    if (typeof router.query.subcategory === "string") setSubcategory(router.query.subcategory);
    if (typeof router.query.priceRange === "string") setPriceRange(router.query.priceRange);
    if (typeof router.query.sortBy === "string") setSortBy(router.query.sortBy);
  }, [router.isReady, router.query.search, router.query.category, router.query.subcategory, router.query.priceRange, router.query.sortBy]);

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      if (category && product.category !== category) return false;
      if (subcategory && product.subcategory !== subcategory) return false;
      if (priceRange === "under-500" && product.price >= 500) return false;
      if (priceRange === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (priceRange === "above-1000" && product.price <= 1000) return false;
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    return [...nextProducts].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, category, subcategory, priceRange, search, sortBy]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenSelect(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryOptions = ["cats", "dogs"];
  const visibleSubcategories = [...new Set(
    products
      .filter((product) => !category || product.category === category)
      .map((product) => product.subcategory),
  )];

  const renderFilterSelect = (id, value, onChange, options, placeholder, minWidth = "min-w-[220px]") => {
    const selectedOption = options.find((option) => option.value === value);
    const isOpen = openSelect === id;

    return (
      <div className={`relative ${minWidth}`}>
        <button
          type="button"
          onClick={() => setOpenSelect((current) => (current === id ? null : id))}
          className={`group relative w-full overflow-hidden rounded-full border px-6 py-3 text-left transition duration-300 ${
            isOpen
              ? "border-[#d5a01d] bg-[linear-gradient(135deg,#fff6d8_0%,#ffefbf_38%,#eef7ef_100%)] shadow-[0_20px_40px_rgba(200,136,10,0.2)]"
              : "border-slate-200 bg-[linear-gradient(135deg,#fffefb_0%,#fff6dd_48%,#f3fbf5_100%)] shadow-[0_14px_28px_rgba(28,74,46,0.08)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(28,74,46,0.12)]"
          }`}
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[radial-gradient(circle_at_center,rgba(255,215,110,0.5),rgba(255,255,255,0))]" />
          <span className="relative z-10 block pr-10 text-sm font-medium capitalize text-slate-800">
            {selectedOption?.label || placeholder}
          </span>
          <span className={`pointer-events-none absolute right-6 top-1/2 z-10 -translate-y-1/2 text-[#1c4a2e] transition duration-300 ${
            isOpen ? "rotate-180 scale-110" : "group-hover:translate-y-[-45%]"
          }`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%-2px)] z-30 overflow-hidden rounded-[1.45rem] border border-[#edd486] bg-[linear-gradient(180deg,#fffdf8_0%,#fff2cf_100%)] p-2 shadow-[0_26px_70px_rgba(28,74,46,0.2)]">
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: "" } });
                setOpenSelect(null);
              }}
              className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-medium transition duration-200 ${
                value === ""
                  ? "bg-[linear-gradient(135deg,#1c4a2e,#2d6d45)] text-white shadow-[0_14px_24px_rgba(28,74,46,0.25)]"
                  : "text-slate-700 hover:bg-[linear-gradient(135deg,#fff2b8,#fff8e6)] hover:text-[#7a5200] hover:translate-x-1"
              }`}
            >
              <span>{placeholder}</span>
              {value === "" && <span className="text-[10px] uppercase tracking-[0.24em] text-white/80">Any</span>}
            </button>
            <div className="mt-2 space-y-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: option.value } });
                      setOpenSelect(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-medium transition duration-200 ${
                      isSelected
                        ? "bg-[linear-gradient(135deg,#1c4a2e,#2d6d45)] text-white shadow-[0_14px_24px_rgba(28,74,46,0.22)]"
                        : "text-slate-700 hover:bg-[linear-gradient(135deg,#fff2b8,#fff8e6)] hover:text-[#7a5200] hover:translate-x-1"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span className="text-[10px] uppercase tracking-[0.24em] text-white/80">Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) throw new Error("Products request failed");

        const data = await response.json();
        if (!mounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setUsingFallback(false);
        } else {
          setProducts(demoProducts);
          setUsingFallback(true);
        }
      } catch {
        if (!mounted) return;
        setProducts(demoProducts);
        setUsingFallback(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <Navbar />
      <section className="pt-28">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8 flex flex-col gap-6 rounded-[2rem] bg-white p-8 shadow-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#946206]">Pet accessories marketplace</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">Filtered listings for cats and dogs.</h1>
              {usingFallback && (
                <p className="mt-3 text-sm text-slate-500">
                  Showing demo products from local data because the backend catalog is unavailable.
                </p>
              )}
            </div>
            <div ref={filtersRef} className="flex flex-wrap gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm outline-none shadow-sm sm:w-80"
              />
              {renderFilterSelect(
                "category",
                category,
                (e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                },
                categoryOptions.map((option) => ({ value: option, label: option })),
                "All categories",
              )}
              {renderFilterSelect(
                "subcategory",
                subcategory,
                (e) => setSubcategory(e.target.value),
                visibleSubcategories.map((option) => ({ value: option, label: option })),
                "All product types",
                "min-w-[240px]",
              )}
              {renderFilterSelect(
                "priceRange",
                priceRange,
                (e) => setPriceRange(e.target.value),
                [
                  { value: "under-500", label: "Under Rs. 500" },
                  { value: "500-1000", label: "Rs. 500 - 1000" },
                  { value: "above-1000", label: "Above Rs. 1000" },
                ],
                "Any price",
              )}
              {renderFilterSelect(
                "sortBy",
                sortBy,
                (e) => setSortBy(e.target.value),
                [
                  { value: "featured", label: "Featured first" },
                  { value: "price-low", label: "Price low to high" },
                  { value: "price-high", label: "Price high to low" },
                  { value: "name", label: "Name A to Z" },
                ],
                "Sort products",
                "min-w-[230px]",
              )}
            </div>
          </div>

          {loading ? (
            <div className="rounded-[2rem] bg-white p-16 text-center text-slate-600 shadow-xl">Loading productsâ€¦</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

