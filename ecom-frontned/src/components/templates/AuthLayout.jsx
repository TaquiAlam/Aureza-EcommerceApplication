/**
 * AuthLayout — Shared wrapper template for Login/Signup pages.
 *
 * Provides consistent centered card container with animation.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in relative">
      <div className="w-full max-w-md bg-white border border-[#E8E2D6] rounded-2xl p-8 md:p-10 relative z-10 shadow-lg">
        {children}
      </div>
    </div>
  );
}
