import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Navigation,
  ShieldCheck,
  Loader2,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../api/addressApi';
import toast from 'react-hot-toast';

export default function AddressesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  // Modal states for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Address Form state matching backend AddressDTO exactly
  const initialFormState = {
    buildingName: '',
    streetAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await getUserAddresses();
      const list = res.data || [];
      setAddresses(list);

      // Read or initialize default address ID
      const savedDefaultId = localStorage.getItem('selectedAddressId');
      if (list.length > 0) {
        const found = list.find((a) => String(a.addressId) === String(savedDefaultId));
        const activeId = found ? found.addressId : list[0].addressId;
        setDefaultAddressId(activeId);
        localStorage.setItem('selectedAddressId', activeId);
        window.dispatchEvent(new Event('addressUpdated'));
      } else {
        setDefaultAddressId(null);
        localStorage.removeItem('selectedAddressId');
        window.dispatchEvent(new Event('addressUpdated'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (addressId) => {
    setDefaultAddressId(addressId);
    localStorage.setItem('selectedAddressId', addressId);
    window.dispatchEvent(new Event('addressUpdated'));
    toast.success('Default delivery address updated!');
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr.addressId);
    setFormData({
      buildingName: addr.buildingName || '',
      streetAddress: addr.streetAddress || '',
      city: addr.city || '',
      state: addr.state || '',
      country: addr.country || 'India',
      pincode: addr.pincode || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingAddressId(null);
    setFormData(initialFormState);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form against backend Address entity @Size constraints
  const validateForm = () => {
    const errors = {};
    if (!formData.buildingName || formData.buildingName.trim().length < 4) {
      errors.buildingName = 'Building name must be at least 4 characters';
    }
    if (!formData.streetAddress || formData.streetAddress.trim().length < 5) {
      errors.streetAddress = 'Street address must be at least 5 characters';
    }
    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }
    if (!formData.state || formData.state.trim().length < 2) {
      errors.state = 'State must be at least 2 characters';
    }
    if (!formData.country || formData.country.trim().length < 2) {
      errors.country = 'Country must be at least 2 characters';
    }
    if (!formData.pincode || formData.pincode.trim().length < 3) {
      errors.pincode = 'PIN Code must be at least 3 characters (e.g. 6 digits)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const payload = {
      buildingName: formData.buildingName.trim(),
      streetAddress: formData.streetAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      pincode: formData.pincode.trim(),
    };

    try {
      if (editingAddressId) {
        // Update existing address
        const res = await updateAddress(editingAddressId, payload);
        const updated = res.data;
        setAddresses((prev) =>
          prev.map((a) => (a.addressId === editingAddressId ? updated : a))
        );
        toast.success('Address updated successfully!');
        window.dispatchEvent(new Event('addressUpdated'));
      } else {
        // Create new address
        const res = await createAddress(payload);
        const created = res.data;
        setAddresses((prev) => [...prev, created]);

        // If this is the first address, make it default automatically
        if (addresses.length === 0) {
          setDefaultAddressId(created.addressId);
          localStorage.setItem('selectedAddressId', created.addressId);
          window.dispatchEvent(new Event('addressUpdated'));
        }
        toast.success('New address added successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save address';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (addr) => {
    setDeleteTarget(addr);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAddress(deleteTarget.addressId);
      const remaining = addresses.filter((a) => a.addressId !== deleteTarget.addressId);
      setAddresses(remaining);

      // If deleted address was default, reassign default to the first remaining address
      if (String(deleteTarget.addressId) === String(defaultAddressId)) {
        if (remaining.length > 0) {
          const nextDefault = remaining[0].addressId;
          setDefaultAddressId(nextDefault);
          localStorage.setItem('selectedAddressId', nextDefault);
        } else {
          setDefaultAddressId(null);
          localStorage.removeItem('selectedAddressId');
        }
      }
      window.dispatchEvent(new Event('addressUpdated'));
      toast.success('Address deleted successfully!');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[75vh] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-[#E8E2D6]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <span>Your Account</span>
            <span>&rsaquo;</span>
            <span className="text-[#FF9900]">Your Addresses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1111] tracking-tight flex items-center gap-2.5">
            <MapPin className="text-[#FF9900]" size={28} />
            Your Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your saved delivery locations for instant 1-click checkout and deliveries.
          </p>
        </div>

        {/* Add Address CTA Button */}
        <button
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-[#E8E2D6] rounded-2xl p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="pt-4 border-t border-gray-100 flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Address Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 0: Dashed "+ Add Address" Tile (Amazon Style) */}
          <div
            onClick={handleOpenAddModal}
            className="group min-h-[260px] border-2 border-dashed border-[#CDCDCD] hover:border-[#FF9900] bg-[#FAF7F2] hover:bg-[#FFFBF2] rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-gray-300 group-hover:border-[#FF9900] flex items-center justify-center text-gray-500 group-hover:text-[#FF9900] mb-3 transition-colors shadow-xs">
              <Plus size={28} className="stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-base text-[#0F1111] group-hover:text-[#B12704] transition-colors">
              Add New Address
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
              Add a residential, office, or gift delivery destination.
            </p>
          </div>

          {/* User's Saved Address Cards */}
          {addresses.map((addr) => {
            const isDefault = String(addr.addressId) === String(defaultAddressId);

            return (
              <div
                key={addr.addressId}
                className={`bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md relative overflow-hidden border-2 ${
                  isDefault ? 'border-[#FF9900] ring-2 ring-[#FF9900]/20' : 'border-[#E8E2D6] hover:border-gray-400'
                }`}
              >
                {/* Default badge banner */}
                {isDefault && (
                  <div className="bg-[#FF9900] text-white text-[11px] font-bold px-3 py-1 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} />
                      Default Delivery Address
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
                      Active
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-[#0F1111] flex items-center gap-2 truncate">
                      <Building size={16} className="text-[#007185] shrink-0" />
                      <span className="truncate">{addr.buildingName}</span>
                    </h3>
                  </div>

                  <div className="text-xs text-[#565959] space-y-1.5 leading-relaxed mt-3">
                    <p className="text-[#0F1111] font-medium text-sm flex items-start gap-1.5">
                      <Navigation size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <span>{addr.streetAddress}</span>
                    </p>
                    <p className="pl-5">
                      {addr.city}, {addr.state}
                    </p>
                    <p className="pl-5">
                      {addr.country} - <span className="font-bold text-[#0F1111]">{addr.pincode}</span>
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-5 border-t border-[#F0EBE1] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(addr)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#007185] hover:text-[#0F1111] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Edit this address"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleOpenDeleteConfirm(addr)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete this address"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>

                  {!isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr.addressId)}
                      className="text-[11px] font-bold text-gray-600 hover:text-[#007185] hover:underline cursor-pointer transition-colors"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check size={13} className="stroke-[3]" /> Default
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State Banner (when no addresses exist) */}
      {!loading && addresses.length === 0 && (
        <div className="mt-6 text-center py-12 px-4 bg-white border border-[#E8E2D6] rounded-2xl shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8E2D6] text-gray-400">
            <MapPin size={32} />
          </div>
          <h2 className="text-lg font-bold text-[#0F1111] mb-1">No addresses saved yet</h2>
          <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
            Add your delivery address to enjoy faster checkouts and reliable doorstep delivery.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-lg shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Add Your First Address
          </button>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ADDRESS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#F0EBE1] flex items-center justify-between bg-[#FAF7F2]">
              <h3 className="font-bold text-base sm:text-lg text-[#0F1111] flex items-center gap-2">
                <MapPin size={19} className="text-[#FF9900]" />
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              
              {/* Building Name */}
              <div>
                <label className="block text-xs font-bold text-[#0F1111] mb-1">
                  Flat, House No., Building, Apartment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 402, Sunrise Heights"
                  className={`input-field text-xs py-2.5 ${
                    formErrors.buildingName ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}
                  disabled={submitting}
                />
                {formErrors.buildingName && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.buildingName}</p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-[#0F1111] mb-1">
                  Area, Street, Sector, Village <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="e.g. MG Road, Near Central Library"
                  className={`input-field text-xs py-2.5 ${
                    formErrors.streetAddress ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}
                  disabled={submitting}
                />
                {formErrors.streetAddress && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.streetAddress}</p>
                )}
              </div>

              {/* City & State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1111] mb-1">
                    Town / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Varanasi"
                    className={`input-field text-xs py-2.5 ${
                      formErrors.city ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.city && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1111] mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Uttar Pradesh"
                    className={`input-field text-xs py-2.5 ${
                      formErrors.state ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.state && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.state}</p>
                  )}
                </div>
              </div>

              {/* PIN Code & Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1111] mb-1">
                    6-digit PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength="10"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 221005"
                    className={`input-field text-xs py-2.5 ${
                      formErrors.pincode ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.pincode && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.pincode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1111] mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. India"
                    className={`input-field text-xs py-2.5 ${
                      formErrors.country ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.country && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.country}</p>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} />
            </div>

            <h3 className="font-bold text-base text-[#0F1111] mb-2">Delete Address?</h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Are you sure you want to delete this address?
              <br />
              <strong className="text-gray-900 block mt-1.5 p-2 bg-[#FAF7F2] rounded-lg border border-gray-200 text-left">
                {deleteTarget.buildingName}, {deleteTarget.streetAddress}, {deleteTarget.city} - {deleteTarget.pincode}
              </strong>
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 flex-1 cursor-pointer transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
