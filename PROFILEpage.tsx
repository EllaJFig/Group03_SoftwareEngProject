"use client";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white p-12 flex justify-center">
      <div className="max-w-3xl w-full space-y-10">

        {/* HEADER SECTION */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-xl">
          <div className="flex items-center space-x-8">
            
            {/* AVATAR */}
            <img
              src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=150"
              className="w-32 h-32 rounded-full border border-gray-700 shadow-lg"
            />

            {/* USER DETAILS */}
            <div>
              <h1 className="text-4xl font-extrabold">Morad Noah</h1>
              <p className="text-gray-400 text-lg">moradnoah@example.com</p>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-500">12</p>
            <p className="text-gray-400 text-sm">Saved Listings</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-500">37</p>
            <p className="text-gray-400 text-sm">Viewed</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-500">0</p>
            <p className="text-gray-400 text-sm">Posted</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Account Actions</h2>

          <button className="w-full py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition">
            Edit Profile
          </button>

          <button className="w-full py-3 bg-gray-800 rounded-xl font-semibold hover:bg-gray-700 transition">
            Account Settings
          </button>

          <button className="w-full py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition">
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
