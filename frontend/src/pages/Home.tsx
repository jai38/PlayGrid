import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-600 px-6">
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl shadow-xl max-w-md w-full p-10 text-center text-white">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
          PlayGrid <span className="text-yellow-400">🎲</span>
        </h1>
        <p className="text-lg mb-8 font-light drop-shadow-sm">
          Play classic board games with friends in real time — no downloads,
          just pure fun.
        </p>

        {/* Floating SVG Dice */}
        <div className="mx-auto mb-10 w-20 h-20 animate-float">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-400 drop-shadow-lg">
            <rect
              x="8"
              y="8"
              width="48"
              height="48"
              rx="8"
              ry="8"
              fill="white"
            />
            <circle cx="20" cy="20" r="4" fill="currentColor" />
            <circle cx="32" cy="32" r="4" fill="currentColor" />
            <circle cx="44" cy="44" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Link
            to="/lobby"
            className="bg-yellow-400 text-indigo-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-300 transition-transform active:scale-95">
            Enter Lobby
          </Link>
          <Link
            to="/about"
            className="border border-white border-opacity-50 text-white font-semibold py-3 rounded-lg hover:bg-white hover:bg-opacity-20 focus:ring-4 focus:ring-white transition-transform active:scale-95">
            Learn More
          </Link>
        </div>

        <p className="mt-12 text-xs text-white text-opacity-60">
          &copy; {new Date().getFullYear()} PlayGrid. All rights reserved.
        </p>
      </div>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
