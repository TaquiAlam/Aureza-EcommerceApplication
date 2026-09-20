import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center text-center p-6 animate-in fade-in">
      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-10 shadow-sm max-w-lg mx-auto">
        <div className="text-8xl font-black text-[#FF9900] leading-none mb-6">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0F1111] mb-4">Page Not Found</h1>
        <p className="text-gray-600 text-base mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold rounded-lg border border-[#FCD200] shadow-sm transition-colors text-base">
          <Home size={20} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
