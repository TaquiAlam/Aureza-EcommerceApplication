import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import { getAllProducts } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi';
import { formatPrice } from '../utils/formatPrice';

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          getAllProducts(0, 20, 'productId', 'desc'),
          getAllCategories(0, 30)
        ]);

        if (productsRes.status === 'fulfilled') {
          const list = productsRes.value.data.content || [];
          setProducts(list.length > 0 ? list : getFallbackProducts());
        } else {
          setProducts(getFallbackProducts());
        }

        if (categoriesRes.status === 'fulfilled') {
          const catData = categoriesRes.value.data;
          const cats = Array.isArray(catData)
            ? catData.flatMap(c => c.content || c.Content || [c])
            : catData.content || catData.Content || [];
          setCategories(cats.filter(c => c.categoryName));
        }
      } catch {
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFallbackProducts = () => [
    { productId: 201, productName: 'Apple iPhone 15 (128 GB) - Black', price: 79900, specialPrice: 69999, discount: 12, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=60' },
    { productId: 202, productName: 'Sony WH-1000XM5 Noise Cancelling Headphones', price: 34990, specialPrice: 26990, discount: 23, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60' },
    { productId: 203, productName: 'Echo Dot (5th Gen) Smart Speaker Alexa', price: 5499, specialPrice: 4449, discount: 19, image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&auto=format&fit=crop&q=60' },
    { productId: 204, productName: 'Java: The Complete Reference, 12th Edition', price: 1250, specialPrice: 999, discount: 20, image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&auto=format&fit=crop&q=60' },
    { productId: 205, productName: 'Fast Charging 20000mAh Power Bank USB-C', price: 2999, specialPrice: 1499, discount: 50, image: 'https://images.unsplash.com/photo-1609592424368-f9d94943f06e?w=400&auto=format&fit=crop&q=60' },
    { productId: 206, productName: 'Wireless Ergonomic Bluetooth Mouse', price: 2499, specialPrice: 999, discount: 60, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=60' },
    { productId: 207, productName: 'Stainless Steel Insulated Thermal Flask', price: 999, specialPrice: 499, discount: 50, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60' },
    { productId: 208, productName: 'Atomic Habits Hardcover Bestseller Book', price: 799, specialPrice: 499, discount: 37, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60' },
  ];

  const scrollDeals = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF7F2] pb-16">
      
      {/* Amazon Style Promotional Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#F7EFE1] via-[#EFE6D5] to-[#E5DBC5] pt-6 pb-24 sm:pb-36 border-b border-[#E8E2D6] overflow-hidden">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
            
            {/* Promo Left */}
            <div className="max-w-xl z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CC0C39] text-white text-xs font-black uppercase tracking-wider rounded-md mb-3 shadow-xs">
                <Zap size={14} className="fill-white" /> Limited Time Deal
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#131921] tracking-tight leading-none mb-3">
                Flat ₹100 cashback!
              </h1>
              <p className="text-base sm:text-xl text-[#333333] font-medium mb-2">
                On orders above ₹399 • <span className="font-bold text-[#131921]">now ⚡ mins delivery</span>
              </p>
              <p className="text-xs text-[#565959] mb-5">
                Pay with Amazon Pay UPI or credit cards for instant rewards on millions of everyday essentials.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/products"
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                  Shop Top Deals
                </Link>
                <Link
                  to="/products?category=electronics"
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-[#0F1111] text-sm font-semibold rounded-lg shadow-xs transition-all"
                >
                  Explore Electronics
                </Link>
              </div>
            </div>

            {/* Promo Right Graphic Simulation */}
            <div className="relative flex items-center justify-center">
              <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#FF9900]/20 to-[#FEB800]/40 flex items-center justify-center p-4 border border-[#E8E2D6] shadow-sm">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white border border-[#E8E2D6] flex flex-col items-center justify-center text-center p-3 shadow-md">
                  <Sparkles size={32} className="text-[#FF9900] mb-1" />
                  <span className="text-xl font-black text-[#131921]">Mega Sale</span>
                  <span className="text-xs font-bold text-[#CC0C39]">Up to 70% Off</span>
                  <span className="text-[10px] text-gray-500 mt-1">Superfast Prime Delivery</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4-Card Multi-Grid Feature Section (Screenshot 2 Overlay Layout) */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-20 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Power Banks & Cashback */}
          <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-lg font-black text-[#0F1111] leading-snug">
                Get cashback every time
              </h2>
              <p className="text-xs text-[#565959] mt-0.5">Power banks & more • <span className="font-bold text-[#0F1111]">now ⚡ mins</span></p>
              
              <div className="my-4 h-48 bg-[#F9F8F6] rounded-lg border border-[#F0EBE1] overflow-hidden flex items-center justify-center p-3">
                <img
                  src="https://images.unsplash.com/photo-1609592424368-f9d94943f06e?w=400&auto=format&fit=crop&q=60"
                  alt="Power Bank"
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded border border-[#E8E2D6] text-[11px] text-[#333333] mb-3">
                <strong className="text-[#0F1111]">Unlimited 5% cashback*</strong> with Amazon Pay ICICI Bank credit card
              </div>
            </div>

            <Link to="/products" className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline">
              Shop power banks & accessories
            </Link>
          </div>

          {/* Card 2: Trending Products */}
          <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#CC0C39]">Up to 70% off</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">launchpad</span>
              </div>
              <h2 className="text-lg font-black text-[#0F1111] leading-snug mt-0.5">
                Trending products
              </h2>
              
              <div className="my-4 h-48 bg-[#F9F8F6] rounded-lg border border-[#F0EBE1] overflow-hidden flex items-center justify-center p-3">
                <img
                  src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=60"
                  alt="Trending Gadgets"
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="text-xs text-[#565959] mb-3">
                Discover innovative smart products from emerging brands and creators.
              </p>
            </div>

            <Link to="/products" className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline">
              See all trending products
            </Link>
          </div>

          {/* Card 3: Movies & Shows / Alexa Smart Devices */}
          <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-xs font-bold text-indigo-700">Movies & shows for every mood</span>
              <h2 className="text-base font-black text-[#0F1111] leading-snug mt-0.5">
                “Alexa, let’s try a rom-com tonight.”
              </h2>
              
              <div className="my-4 h-48 bg-[#F9F8F6] rounded-lg border border-[#F0EBE1] overflow-hidden flex items-center justify-center p-3">
                <img
                  src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&auto=format&fit=crop&q=60"
                  alt="Smart Devices"
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#565959] mb-3">
                <span className="font-bold text-[#0F1111]">fire tv</span>
                <span>•</span>
                <span className="font-bold text-[#007185]">alexa built-in</span>
              </div>
            </div>

            <Link to="/products" className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline">
              Explore Fire TV & smart devices
            </Link>
          </div>

          {/* Card 4: Deals delivered as fast as tomorrow (4 Mini Tiles from Screenshot 2) */}
          <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-lg font-black text-[#0F1111] leading-snug">
                Deals delivered as fast as tomorrow
              </h2>
              
              {/* 2x2 Mini Tile Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-3">
                
                {/* Tile 1: Snacks */}
                <Link to="/products" className="group flex flex-col">
                  <div className="h-20 bg-[#F9F8F6] border border-[#F0EBE1] rounded-md p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=60"
                      alt="Fashion Deal"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="mt-1 inline-block bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.2 rounded w-fit">
                    30% off
                  </span>
                </Link>

                {/* Tile 2: Java Book */}
                <Link to="/products" className="group flex flex-col">
                  <div className="h-20 bg-[#F9F8F6] border border-[#F0EBE1] rounded-md p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=200&auto=format&fit=crop&q=60"
                      alt="Java Book"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="mt-1 inline-block bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.2 rounded w-fit">
                    19% off
                  </span>
                </Link>

                {/* Tile 3: Tech Accessory */}
                <Link to="/products" className="group flex flex-col">
                  <div className="h-20 bg-[#F9F8F6] border border-[#F0EBE1] rounded-md p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&auto=format&fit=crop&q=60"
                      alt="Home Essential"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="mt-1 inline-block bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.2 rounded w-fit">
                    60% off
                  </span>
                </Link>

                {/* Tile 4: Headphones */}
                <Link to="/products" className="group flex flex-col">
                  <div className="h-20 bg-[#F9F8F6] border border-[#F0EBE1] rounded-md p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60"
                      alt="Headphones"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="mt-1 inline-block bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.2 rounded w-fit">
                    50% off
                  </span>
                </Link>

              </div>
            </div>

            <Link to="/products" className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline">
              Explore all fast delivery deals
            </Link>
          </div>

        </div>
      </div>

      {/* Horizontal Scrollable "Today's Deals" Showcase (Screenshot 2 Carousel) */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-white border border-[#E8E2D6] rounded-xl p-5 shadow-xs relative">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-bold text-[#0F1111]">Today’s Deals</h2>
              <Link to="/products" className="text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:underline">
                See all deals
              </Link>
            </div>
            
            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollDeals('left')}
                className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={() => scrollDeals('right')}
                className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                title="Scroll Right"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
          >
            {products.map((item) => (
              <div
                key={item.productId}
                onClick={() => navigate('/products')}
                className="min-w-[200px] max-w-[200px] sm:min-w-[220px] sm:max-w-[220px] bg-[#FAF7F2] border border-[#F0EBE1] hover:border-gray-300 rounded-lg p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="h-36 w-full flex items-center justify-center bg-white rounded-md p-2 mb-3">
                  <img
                    src={item.image ? (item.image.startsWith('http') ? item.image : `/images/${item.image}`) : `https://picsum.photos/seed/${item.productId}/200/200`}
                    alt={item.productName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Up to {item.discount || 20}% off
                    </span>
                    <span className="text-[10px] font-bold text-[#CC0C39]">Deal</span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-base font-bold text-[#0F1111]">
                      {formatPrice(item.specialPrice || item.price)}
                    </span>
                    {item.discount > 0 && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#0F1111] line-clamp-2 mt-0.5 leading-snug">
                    {item.productName}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom Category Cards Showcase (from Screenshot 2 bottom row!) */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Tile 1 */}
          <div 
            onClick={() => navigate('/products?category=home')}
            className="bg-white border border-[#E8E2D6] rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-[#0F1111] line-clamp-1 mb-2">Everyday Essentials</h3>
              <div className="h-28 bg-[#FAF7F2] rounded-lg p-2 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&auto=format&fit=crop&q=60" alt="Essentials" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#007185] mt-2 block">Shop now</span>
          </div>

          {/* Tile 2 */}
          <div 
            onClick={() => navigate('/products')}
            className="bg-white border border-[#E8E2D6] rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-[#0F1111] line-clamp-1 mb-2">Saved Items</h3>
              <div className="h-28 bg-[#FAF7F2] rounded-lg p-2 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=60" alt="Audio" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#007185] mt-2 block">Check discounts</span>
          </div>

          {/* Tile 3 */}
          <div 
            onClick={() => navigate('/products?category=books')}
            className="bg-white border border-[#E8E2D6] rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-[#0F1111] line-clamp-1 mb-2">Bestsellers in Books</h3>
              <div className="h-28 bg-[#FAF7F2] rounded-lg p-2 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60" alt="Books" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#007185] mt-2 block">Read more</span>
          </div>

          {/* Tile 4 */}
          <div 
            onClick={() => navigate('/products')}
            className="bg-white border border-[#E8E2D6] rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-[#0F1111] line-clamp-1 mb-2">Under ₹999 Deals</h3>
              <div className="h-28 bg-[#FAF7F2] rounded-lg p-2 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=60" alt="Budget Deals" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#007185] mt-2 block">View budget store</span>
          </div>

          {/* Tile 5 */}
          <div 
            onClick={() => navigate('/products?category=electronics')}
            className="bg-white border border-[#E8E2D6] rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-[#0F1111] line-clamp-1 mb-2">Top Electronics</h3>
              <div className="h-28 bg-[#FAF7F2] rounded-lg p-2 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60" alt="Electronics" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#007185] mt-2 block">Explore gadgets</span>
          </div>

          {/* Tile 6 */}
          <div 
            onClick={() => navigate('/products')}
            className="bg-white border border-[#E8E2D6] rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-[#0F1111] line-clamp-1 mb-2">Business Discounts</h3>
              <div className="h-28 bg-[#FAF7F2] rounded-lg p-2 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&auto=format&fit=crop&q=60" alt="Business" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#007185] mt-2 block">Bulk purchase</span>
          </div>

        </div>
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Truck size={28} className="text-[#FF9900]" />
            <h4 className="text-xs font-bold text-[#0F1111]">Fast & Free Delivery</h4>
            <p className="text-[11px] text-[#565959]">On eligible orders with Prime</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck size={28} className="text-[#FF9900]" />
            <h4 className="text-xs font-bold text-[#0F1111]">100% Purchase Protection</h4>
            <p className="text-[11px] text-[#565959]">Genuine products guaranteed</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock size={28} className="text-[#FF9900]" />
            <h4 className="text-xs font-bold text-[#0F1111]">7 Days Replacement</h4>
            <p className="text-[11px] text-[#565959]">Hassle free doorstep returns</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShoppingBag size={28} className="text-[#FF9900]" />
            <h4 className="text-xs font-bold text-[#0F1111]">Secure Payment</h4>
            <p className="text-[11px] text-[#565959]">Netbanking, Cards & UPI</p>
          </div>
        </div>
      </div>

    </div>
  );
}
