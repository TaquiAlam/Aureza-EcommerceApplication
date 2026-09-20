import ProductCard from '../components/product/ProductCard';

const products = [
  {
    productId: 101,
    image: 'https://embarkx.com/sample/placeholder.png',
    productName: 'iPhone 13 Pro Max',
    description: 'The iPhone 13 Pro Max offers exceptional performance with its A15 Bionic chip, stunning Super Retina XDR display, and advanced camera features for breathtaking photos.',
    specialPrice: 720,
    price: 780,
  },
  {
    productId: 102,
    image: 'https://embarkx.com/sample/placeholder.png',
    productName: 'Samsung Galaxy S21',
    description: 'Experience the brilliance of the Samsung Galaxy S21 with its vibrant AMOLED display, powerful camera, and sleek design that fits perfectly in your hand.',
    specialPrice: 699,
    price: 799,
  },
  {
    productId: 103,
    image: 'https://embarkx.com/sample/placeholder.png',
    productName: 'Google Pixel 6',
    description: 'The Google Pixel 6 boasts cutting-edge AI features, exceptional photo quality, and a stunning display, making it a perfect choice for Android enthusiasts.',
    specialPrice: 400,
    price: 599,
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F1111] mb-4">
          About Us
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-[#FF9900] to-[#E47911] mx-auto rounded-full"></div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-12 mb-20 bg-white border border-[#E8E2D6] rounded-2xl p-8 md:p-12 shadow-sm">
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
          <h2 className="text-3xl font-black text-[#0F1111]">We Build The Future of Commerce</h2>
          <p className="text-lg text-gray-700 leading-relaxed font-normal">
            Welcome to our premium e-commerce store! We are dedicated to providing the
            best products and services to our customers. Our mission is to offer
            a seamless shopping experience while ensuring the highest quality of
            our offerings. Every product is handpicked to meet your expectations.
          </p>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="relative group">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"
              alt="About Us"
              className="relative w-full h-auto rounded-xl shadow-md transform transition-transform duration-500 group-hover:scale-[1.01] object-cover"
            />
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-[#E8E2D6]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-2">Featured Products</h2>
          <p className="text-gray-600">Discover our top-rated selections chosen just for you.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}