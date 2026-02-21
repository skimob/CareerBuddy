import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-indigo-200 transition-colors">
          CareerBuddy
        </Link>
        <span className="text-indigo-300 text-sm">AI-Powered Job Search</span>
      </div>
    </nav>
  );
}
