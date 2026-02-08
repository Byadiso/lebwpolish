// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 bg-gradient-to-br from-red-50 via-white to-blue-50 overflow-hidden">

      {/* Floating background shapes */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-red-300 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-40 -right-32 w-96 h-96 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>

      {/* Hero text */}
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 mb-4 leading-tight">
        LEBW<span className="text-red-600">POLISH</span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mb-10 leading-relaxed">
        Learn by <span className="font-semibold text-red-600">writing</span>. 
        Join a level-based space, and build your vocabulary with a community. 
        Stay consistent, or face the <span className="font-bold text-red-600">brutal truth</span>.
      </p>

      {/* Call-to-action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <a
          href="/space"
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 hover:from-red-600 hover:to-red-700 transition transform duration-300"
        >
          Enter Space
        </a>
        <a
          href="/login"
          className="bg-white border border-gray-300 px-8 py-4 rounded-full font-bold shadow hover:scale-105 hover:bg-gray-50 transition transform duration-300"
        >
          Member Login
        </a>
      </div>

      {/* Subtle writing animation */}
      <div className="absolute bottom-12 flex items-center justify-center space-x-2 text-gray-400 text-sm animate-pulse">
        <span>🖊️</span>
        <span>Start writing your Polish journey today...</span>
      </div>
    </div>
  );
}
