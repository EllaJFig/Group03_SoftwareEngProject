"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSent(true);
    e.target.reset();
  };

  return (
    <main className="min-h-screen bg-black text-white p-12 flex justify-center">
      <div className="max-w-3xl w-full space-y-10">

        <h1 className="text-5xl font-extrabold mb-6">Contact Us</h1>
        <p className="text-gray-400 text-lg">
          Have questions or feedback about MANJE? We're here to help.
        </p>

        {/* CONTACT FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-xl space-y-6"
        >
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Message</label>
            <textarea
              rows={5}
              name="message"
              required
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
              placeholder="Write your message..."
            />
          </div>

          {sent && (
            <p className="text-green-400 font-semibold">
              Message submitted successfully!
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Submit Inquiry
          </button>
        </form>

        {/* CONTACT INFO */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-xl space-y-3">
          <h2 className="text-2xl font-bold">Other Ways to Reach Us</h2>

          <p className="text-gray-400">📧 support@manje.ca</p>
          <p className="text-gray-400">📍 Waterloo, Ontario</p>
        </div>

      </div>
    </main>
  );
}
