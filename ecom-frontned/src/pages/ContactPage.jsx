import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F1111] mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 text-lg">We would love to hear from you! Reach out to us below.</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#FF9900] to-[#E47911] mx-auto rounded-full mt-3"></div>
      </div>

      <div className="bg-white border border-[#E8E2D6] rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Form Section */}
          <div className="space-y-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-[#0F1111] mb-1">Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg px-4 py-2.5 text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none text-sm transition-all placeholder:text-gray-400" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F1111] mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg px-4 py-2.5 text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none text-sm transition-all placeholder:text-gray-400" 
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F1111] mb-1">Message</label>
                <textarea 
                  rows="4" 
                  required 
                  className="w-full bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg px-4 py-2.5 text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none text-sm transition-all placeholder:text-gray-400 resize-none" 
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] font-bold rounded-lg border border-[#FCD200] shadow-sm transition-all duration-200 cursor-pointer">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info Section */}
          <div className="flex flex-col justify-center space-y-8 bg-[#FAF7F2] p-8 rounded-xl border border-[#E8E2D6]">
            <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Get in touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#E8E2D6]/40 rounded-lg text-[#0F1111]">
                  <Phone className="w-6 h-6 text-[#E47911]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="text-[#0F1111] font-bold text-base">+91 6306597320</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#E8E2D6]/40 rounded-lg text-[#0F1111]">
                  <Mail className="w-6 h-6 text-[#E47911]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-[#0F1111] font-bold text-base">alamtaqui@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#E8E2D6]/40 rounded-lg text-[#0F1111]">
                  <MapPin className="w-6 h-6 text-[#E47911]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-[#0F1111] font-bold text-base">Uttar Pradesh , India</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}