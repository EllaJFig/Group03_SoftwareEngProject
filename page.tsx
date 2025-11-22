import MiniMap from "@/components/MiniMap";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full items-center">

        {/* LEFT SIDE — TEXT */}
        <div className="space-y-6">
          <h1 className="text-6xl font-extrabold leading-tight text-white">
            Welcome to <span className="text-blue-500">MANJE</span>
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed">
            Discover rental listings across Waterloo, Kitchener, Cambridge, 
            and surrounding areas with ease. Explore interactive maps, 
            compare pricing, and find your next rental — all with a modern 
            streamlined experience.
          </p>

          <a
            href="/map"
            className="inline-block px-10 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
          >
            View Listings Map
          </a>
        </div>

{/* RIGHT SIDE — MAP */}
<div className="w-full flex justify-center">
<div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-800 w-full h-96">
    <MiniMap />
  </div>
</div>


      </div>
    </main>
  );
}


