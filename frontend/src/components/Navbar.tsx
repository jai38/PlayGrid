import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 text-white p-4 flex justify-between items-center shadow-lg">
      {/* Logo / Game Title */}
      <Link
        to="/"
        className="text-xl font-extrabold tracking-wide hover:text-purple-300 transition-colors">
        🎮 PlayGrid
      </Link>

      {/* Links */}
      <div className="flex gap-6 text-sm font-semibold">
        <Link
          to="/"
          className="hover:text-purple-300 transition-colors active:scale-95">
          Home
        </Link>
        <Link
          to="/lobby"
          className="hover:text-purple-300 transition-colors active:scale-95">
          Lobby
        </Link>
      </div>
    </nav>
  );
}
