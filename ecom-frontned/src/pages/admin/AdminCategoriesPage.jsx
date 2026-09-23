import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save, X, Tags, FolderPlus } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllCategories(0, 100);
      const raw = res.data;
      let list = [];
      if (Array.isArray(raw)) {
        list = raw[0]?.content || raw;
      } else if (raw?.content) {
        list = raw.content;
      }
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ categoryName: newCategoryName.trim() });
      toast.success('Category created successfully');
      setNewCategoryName('');
      setIsAdding(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (id) => {
    if (!editCategoryName.trim()) return;
    try {
      await updateCategory(id, { categoryName: editCategoryName.trim() });
      toast.success('Category updated');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.categoryId);
    setEditCategoryName(cat.categoryName);
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading Categories...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F1111] tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Organize catalog classifications and departments.
          </p>
        </div>

        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          <span>{isAdding ? 'Cancel' : 'Add New Category'}</span>
        </button>
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <form 
          onSubmit={handleAdd} 
          className="bg-white border-2 border-[#FF9900]/40 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-end animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FolderPlus size={15} className="text-[#FF9900]" />
              New Category Name *
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D6] focus:border-[#FF9900] focus:bg-white rounded-xl text-xs font-semibold text-gray-900 outline-none"
              placeholder="e.g. Smart Watches & Wearables"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button 
            type="submit" 
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0" 
            disabled={!newCategoryName.trim()}
          >
            <Save size={16} /> 
            <span>Create Category</span>
          </button>
        </form>
      )}

      {/* Category List Card */}
      <div className="bg-white border border-[#E8E2D6] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8E2D6] bg-[#FAF7F2]/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <Tags size={15} className="text-[#FF9900]" />
            Active Categories ({categories.length})
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            <Tags size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">No categories found.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Add a new category above to begin organizing products.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE1]">
            {categories.map((cat) => (
              <div 
                key={cat.categoryId} 
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#FAF7F2]/60 transition-colors"
              >
                {editingId === cat.categoryId ? (
                  <div className="flex-1 flex items-center gap-3 mr-3">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-white border border-[#FF9900] rounded-xl text-xs font-semibold text-gray-900 outline-none"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                      onClick={() => handleUpdate(cat.categoryId)}
                      title="Save"
                    >
                      <Save size={16} />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-200">
                        {cat.categoryName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-[#0F1111] text-xs sm:text-sm">
                          {cat.categoryName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ID: #{cat.categoryId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        onClick={() => startEditing(cat)}
                        title="Edit Category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(cat.categoryId, cat.categoryName)}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}