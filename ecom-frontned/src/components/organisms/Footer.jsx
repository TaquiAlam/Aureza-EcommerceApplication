import { Link } from 'react-router-dom';
import { Heart, Store } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto">
      {/* Back to top button */}
      <button 
        onClick={scrollToTop}
        className="w-full py-3.5 bg-[#37475A] hover:bg-[#485769] text-white text-xs font-semibold text-center transition-colors cursor-pointer"
      >
        Back to top
      </button>

      {/* Main footer links */}
      <div className="bg-[#232F3E] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            
            <div className="flex flex-col gap-3">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white flex items-center">
                  Aureza<span className="text-[#FF9900]">.in</span>
                </span>
              </Link>
              <p className="text-gray-300 text-xs leading-relaxed mt-1">
                Your trusted online shopping destination. Fast delivery, secure payments, and unbeatable prices on millions of products.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Get to Know Us</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-300">
                <li><Link to="/about" className="hover:underline hover:text-white">About Aureza</Link></li>
                <li><Link to="/contact" className="hover:underline hover:text-white">Careers</Link></li>
                <li><Link to="/products" className="hover:underline hover:text-white">Press Releases</Link></li>
                <li><Link to="/about" className="hover:underline hover:text-white">Aureza Care</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Connect with Us</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-300">
                <li><a href="#" className="hover:underline hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:underline hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:underline hover:text-white">Instagram</a></li>
                <li><Link to="/contact" className="hover:underline hover:text-white">Customer Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Let Us Help You</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-300">
                <li><Link to="/cart" className="hover:underline hover:text-white">Your Account</Link></li>
                <li><Link to="/products" className="hover:underline hover:text-white">Returns Centre</Link></li>
                <li><Link to="/contact" className="hover:underline hover:text-white">100% Purchase Protection</Link></li>
                <li><Link to="/contact" className="hover:underline hover:text-white">Help</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#131A22] py-6 text-center text-xs text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} Aureza.in. Made with 
            <Heart size={13} className="text-red-500 fill-red-500" /> 
            by <strong className="text-white font-semibold">Mohammad Taqui Alam</strong>
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="hover:underline">Conditions of Use & Sale</a>
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Interest-Based Ads</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
