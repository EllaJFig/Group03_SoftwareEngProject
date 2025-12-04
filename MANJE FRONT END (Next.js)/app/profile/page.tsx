"use client";

// Imports
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth"; 

export default function ProfilePage() {
  
  // Check if the user is logged in
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect if not logged in
    } else if (user) {
      fetchUserData(user.uid);
    }
  }, [user, loading, router]);

  async function fetchUserData(uid: string) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserData(docSnap.data());
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading || !userData) return <div className="p-12 text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-12 flex justify-center pt-24">
      <div className="max-w-3xl w-full space-y-10">

        {/* HEADER SECTION */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-xl">
          <div className="flex items-center space-x-8">
            
            {/* AVATAR GENERATOR */}
            <img
              src={`https://ui-avatars.com/api/?name=${userData.fullName}&background=0D8ABC&color=fff&size=150`}
              className="w-32 h-32 rounded-full border border-gray-700 shadow-lg"
              alt="Profile"
            />

            {/* USER DETAILS */}
            <div>
              <h1 className="text-4xl font-extrabold">{userData.fullName}</h1>
              <p className="text-gray-400 text-lg">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-500">
              {userData.savedListings ? userData.savedListings.length : 0}
            </p>
            <p className="text-gray-400 text-sm">Saved Listings</p>
          </div>
          {/* ... other stats ... */}
        </div>

        {/* ACTION BUTTONS */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
