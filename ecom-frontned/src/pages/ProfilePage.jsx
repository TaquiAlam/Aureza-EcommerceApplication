import { useState, useEffect, useRef } from 'react';
import { Camera, User, Mail, Phone, FileText, ShieldCheck, MapPin, CheckCircle2, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from '../api/userApi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile();
        setProfile(res.data);
        setFormData({
          fullName: res.data.fullName || '',
          phoneNumber: res.data.phoneNumber || '',
          bio: res.data.bio || '',
        });
      } catch {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile(formData);
      setProfile(res.data);
      toast.success('Profile details updated successfully!');
    } catch {
      toast.error('Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    const loadingToast = toast.loading('Uploading profile picture...');
    try {
      const res = await uploadProfilePhoto(file);
      setProfile(res.data);
      toast.success('Profile photo updated!', { id: loadingToast });
    } catch {
      toast.error('Failed to upload profile photo', { id: loadingToast });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E47911]" />
        <p className="text-gray-600 text-sm font-medium">Loading your profile...</p>
      </div>
    );
  }

  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
    : 'http://localhost:8080';

  const profileImageUrl = profile?.profileImage && typeof profile.profileImage === 'string'
    ? (profile.profileImage.startsWith('http') ? profile.profileImage : `${backendBase}/images/${profile.profileImage}`)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0F1111] tracking-tight">Your Account Profile</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your personal details, profile picture, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#E8E2D6] rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF9900] to-[#E47911]"></div>

            {/* Avatar with Camera Trigger */}
            <div className="relative w-32 h-32 mx-auto mt-4 mb-4 group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FAF7F2] shadow-md bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={profile?.fullName || profile?.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-[#E47911]">
                    {String(profile?.fullName || profile?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold backdrop-blur-[2px]"
                title="Change profile photo"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1 text-white" />
                    <span>Change</span>
                  </>
                )}
              </button>

              {/* Mini corner camera badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] p-2 rounded-full shadow-md border border-[#FCD200] transition-transform hover:scale-110"
                title="Upload photo"
              >
                <Camera size={16} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-bold text-[#0F1111] truncate">
              {profile?.fullName || profile?.username || 'Your Account'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">@{profile?.username || 'guest'}</p>

            {/* Role Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {Array.isArray(profile?.roles) && profile.roles.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF8E7] text-[#B12704] border border-[#FBD8B5]"
                >
                  {typeof r === 'string' ? r.replace('ROLE_', '') : r}
                </span>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-[#E8E2D6] text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between text-gray-600">
                <span>Account Status</span>
                <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                  <CheckCircle2 size={14} /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Saved Addresses</span>
                <span className="font-semibold text-gray-800">{profile?.addressesCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-[#E8E2D6] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Quick Shortcuts
            </h3>
            <Link
              to="/checkout"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] transition-colors border border-[#E8E2D6] text-sm text-[#0F1111] font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-[#E47911]" />
                <span>Delivery Addresses</span>
              </div>
              <span className="text-xs text-gray-500 font-normal">Manage &rarr;</span>
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] transition-colors border border-[#E8E2D6] text-sm text-[#0F1111] font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-[#007185]" />
                <span>Explore Catalog</span>
              </div>
              <span className="text-xs text-gray-500 font-normal">Shop &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Personal Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#E8E2D6] pb-4 mb-6">
              <h2 className="text-xl font-bold text-[#0F1111]">Personal Details</h2>
              <p className="text-gray-600 text-xs mt-1">
                Keep your profile and contact information updated for faster checkout.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#0F1111] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Mohammad Taqui Alam"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg text-sm text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Username (Read Only) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#0F1111] uppercase tracking-wider">
                    Username
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">Unique Handle</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Email (Read Only with Verified Badge) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#0F1111] uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-semibold">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#0F1111] uppercase tracking-wider mb-2">
                  Phone / Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 6306597320"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg text-sm text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Used for delivery notifications and SMS updates.</p>
              </div>

              {/* Bio / About */}
              <div>
                <label className="block text-xs font-bold text-[#0F1111] uppercase tracking-wider mb-2">
                  Bio / About Me
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself or preferred delivery instructions..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D5D9D9] rounded-lg text-sm text-[#0F1111] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8E2D6] flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] font-bold rounded-lg border border-[#FCD200] shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      fullName: profile?.fullName || '',
                      phoneNumber: profile?.phoneNumber || '',
                      bio: profile?.bio || '',
                    })
                  }
                  className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-[#D5D9D9] shadow-sm transition-colors text-sm cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
