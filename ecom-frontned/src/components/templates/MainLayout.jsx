import { Outlet } from 'react-router-dom';
import Navbar from '../organisms/Navbar';
import Footer from '../organisms/Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#FAF7F2] text-[#131921]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
