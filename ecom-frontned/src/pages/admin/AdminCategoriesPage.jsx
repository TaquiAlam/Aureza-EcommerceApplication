import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, Save, X } from 'lucide-react';
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
      const res = await getAllCategories(0, 50);
      setCategories(res.data?.content || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ categoryName: newCategoryName });
      toast.success('Category created');
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
      await updateCategory(id, { categoryName: editCategoryName });
      toast.success('Category updated');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
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
      <div className="h-full flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Categories</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-card p-6 mb-8 flex gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-300 border-2 border-primary/30">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Category Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Electronics"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!newCategoryName.trim()}>
            <Save size={18} /> Save
          </button>
        </form>
      )}

      <div className="glass-card overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No categories found. Add one above.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {categories.map((cat) => (
              <div key={cat.categoryId} className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                
                {editingId === cat.categoryId ? (
                  <div className="flex-1 flex items-center gap-4 mr-4">
                    <input
                      type="text"
                      className="input-field py-2"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                      onClick={() => handleUpdate(cat.categoryId)}
                    >
                      <Save size={20} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-white text-lg">{cat.categoryName}</div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        onClick={() => startEditing(cat)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        onClick={() => handleDelete(cat.categoryId)}
                      >
                        <Trash2 size={18} />
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