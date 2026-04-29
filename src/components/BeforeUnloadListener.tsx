"use client";
import { useEffect } from "react";
import { useCart } from "@/store/cart";

export default function BeforeUnloadListener() {
  const { items } = useCart();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [items]);

  return null;
}
