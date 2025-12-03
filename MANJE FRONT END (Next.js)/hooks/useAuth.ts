"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth"; // 1. Import User type

export function useAuth() {
  // 2. Add <User | null> to useState
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, loading };
}
