"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Basic Validation (matching your Python script)
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // 1. Create Auth User
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // 2. Create User Profile in Firestore
      // This replaces the Python: db.child("users").child(uid).set(...)
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        email: email,
        savedListings: [] // Initialize empty array
      });

      // Redirect to profile
      router.push("/profile");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError(err.message);
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl w-96 border border-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First Name"
              className="w-1/2 p-3 bg-gray-800 rounded border border-gray-700"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 p-3 bg-gray-800 rounded border border-gray-700"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-800 rounded border border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-800 rounded border border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 bg-gray-800 rounded border border-gray-700"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
            Create Account
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}