"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "./useAuth";

export function useSavedListings() {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Real-time listener: Auto-updates when DB changes
  useEffect(() => {
    if (!user) {
      setSavedListings([]);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSavedListings(data.savedListings || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Save Function
  const saveListing = async (listing: any) => {
    if (!user) {
      alert("You must be logged in to save listings.");
      return;
    }
    
    const docRef = doc(db, "users", user.uid);
    // Add to the array in Firestore
    await updateDoc(docRef, {
      savedListings: arrayUnion(listing)
    });
  };

  // 3. Remove Function
  const removeListing = async (listingId: string) => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    
    // We must read the current list to filter the item out by ID
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const currentList = snapshot.data().savedListings || [];
      const updatedList = currentList.filter((l: any) => l.id !== listingId);
      
      await updateDoc(docRef, {
        savedListings: updatedList
      });
    }
  };

  // 4. Check if Saved
  const isSaved = (id: string) => {
    return savedListings.some((l) => l.id === id);
  };

  return { savedListings, saveListing, removeListing, isSaved, loading };
}