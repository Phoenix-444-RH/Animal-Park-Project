'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "../lib/app-state";

export default function ProductCard({ product }) {
  const { addToCart } = useAppState();
  const [imageSrc, setImageSrc] = useState(product.image || "/images/placeholder-pet.svg");
  const [notice, setNotice] = useState("");

  const handleAddToCart = () => {
    const result = addToCart(product);
    if (!result.ok) {
      window.location.href = "/login";
      return;
    }
    setNotice(result.message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_50px_rgba(13,27,29,0.12)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={product.name}
          onError={() => setImageSrc("/images/placeholder-pet.svg")}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.24em] text-[#546d4c]">
          <span>{product.category}</span>
          <span>{product.subcategory}</span>
        </div>

        <div>
          <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{product.description || "Designed for smart pet care."}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-bold text-[#1c4a2e]">Rs. {product.price}</span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-full bg-[#1c4a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245f3b]"
          >
            Add to cart
          </button>
        </div>

        {notice ? (
          <div className="rounded-full bg-[#edf7ef] px-4 py-2 text-xs font-semibold text-[#1c4a2e]">
            {notice}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
