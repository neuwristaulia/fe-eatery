"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, Plus, Edit2, Trash2, X, Upload, Tags } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/store/useAdminStore";
import { CategoryHasMenusError } from "@/lib/api/services/categories";

export default function AdminMenuPage() {
  const {
    menus,
    categories,
    addMenu,
    updateMenu,
    deleteMenu,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // Category management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState("");

  // Reassignment dialog state (shown when deleting a category that still has menus)
  const [reassignCategory, setReassignCategory] = useState<any>(null);
  const [reassignMenuCount, setReassignMenuCount] = useState(0);
  const [reassignTargetId, setReassignTargetId] = useState("");
  const [reassignSaving, setReassignSaving] = useState(false);

  const openAddModal = () => {
    setEditingMenu(null);
    setName("");
    setCategory(categories[0]?.name || "");
    setPrice("");
    setDescription("");
    setImage("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingMenu(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.replace(/[^0-9]/g, ''));
    setDescription(item.description || "");
    setImage(item.image || "");
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || !price) return;

    const formattedPrice = `Rp ${Number(price).toLocaleString('id-ID')}`;
    const finalImage = image || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150"; // default if empty

    if (editingMenu) {
      updateMenu(editingMenu.id, {
        ...editingMenu,
        name,
        category,
        price: formattedPrice,
        description,
        image: finalImage
      });
    } else {
      const newMenu = {
        id: `M${Math.floor(100 + Math.random() * 900)}`,
        name,
        category,
        price: formattedPrice,
        description,
        stock: 50,
        image: finalImage
      };
      addMenu(newMenu);
    }
    setIsModalOpen(false);
  };

  const filteredMenus = menus.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- Category management handlers ---

  const openCategoryManager = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDescription("");
    setCatError("");
    setIsCategoryModalOpen(true);
  };

  const startEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
    setCatError("");
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDescription("");
    setCatError("");
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    setCatSaving(true);
    setCatError("");
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: catName.trim(),
          description: catDescription.trim(),
        });
      } else {
        await addCategory({
          name: catName.trim(),
          description: catDescription.trim(),
        });
      }
      cancelEditCategory();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    setCatError("");
    try {
      await deleteCategory(cat.id);
    } catch (err) {
      if (err instanceof CategoryHasMenusError) {
        setReassignCategory(cat);
        setReassignMenuCount(err.menuCount);
        setReassignTargetId("");
      } else {
        setCatError(err instanceof Error ? err.message : "Failed to delete category");
      }
    }
  };

  const handleConfirmReassign = async () => {
    if (!reassignCategory || !reassignTargetId) return;
    setReassignSaving(true);
    try {
      await deleteCategory(reassignCategory.id, reassignTargetId);
      setReassignCategory(null);
      setReassignMenuCount(0);
      setReassignTargetId("");
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Failed to reassign and delete category");
    } finally {
      setReassignSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Tambah, edit, atau hapus menu restoran.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openCategoryManager} variant="outline" className="rounded-full px-6 flex items-center gap-2">
            <Tags className="w-4 h-4" />
            Manage Categories
          </Button>
          <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Menu
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-border bg-card outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option>All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredMenus.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            No menus found matching your filters.
          </div>
        ) : filteredMenus.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={item.id}
          >
            <Card className="overflow-hidden border-none shadow-md bg-card group hover:shadow-xl transition-shadow">
              <div className="relative h-48 overflow-hidden bg-muted">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-white/90 text-blue-600 rounded-lg hover:bg-white shadow-sm transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMenu(item.id)} className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-white shadow-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-foreground line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <p className="font-bold text-primary">{item.price}</p>
                  <p className="text-xs font-medium text-muted-foreground">Stock: <span className="text-foreground">{item.stock}</span></p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/50 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold">{editingMenu ? "Edit Menu" : "Add New Menu"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto min-h-0">
                <label className="w-full h-40 bg-muted rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden group">
                  {image ? (
                    <>
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Upload Image</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Menu Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Nasi Lemak" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (Rp)</label>
                    <input value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. 25000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} placeholder="Menu description..." />
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full px-6">Cancel</Button>
                <Button disabled={!name || !price} onClick={handleSave} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50">Save Menu</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Manage Categories */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/50 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold">Manage Categories</h2>
                <button
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    cancelEditCategory();
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto min-h-0">
                <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-semibold">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      value={catName}
                      onChange={e => setCatName(e.target.value)}
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. Beverages"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <input
                      value={catDescription}
                      onChange={e => setCatDescription(e.target.value)}
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Optional description"
                    />
                  </div>
                  {catError && <p className="text-sm text-red-600">{catError}</p>}
                  <div className="flex justify-end gap-2">
                    {editingCategory && (
                      <Button variant="outline" onClick={cancelEditCategory} disabled={catSaving} className="rounded-full px-4">
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleSaveCategory}
                      disabled={!catName.trim() || catSaving}
                      className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                    >
                      {catSaving ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No categories yet.</p>
                  ) : categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card">
                      <div>
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat.description || "No description"} &middot; {cat.items} menu{cat.items === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditCategory(cat)} className="p-2 text-blue-600 hover:bg-muted rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat)} className="p-2 text-red-600 hover:bg-muted rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    cancelEditCategory();
                  }}
                  className="rounded-full px-6"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Reassign Menus Before Deleting Category */}
      <AnimatePresence>
        {reassignCategory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-serif font-bold">Reassign Menus Before Deleting</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  &ldquo;{reassignCategory.name}&rdquo; still has {reassignMenuCount} menu{reassignMenuCount === 1 ? "" : "s"} assigned.
                  Choose another category to move {reassignMenuCount === 1 ? "it" : "them"} to before deleting this category.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Move menus to</label>
                  <select
                    value={reassignTargetId}
                    onChange={e => setReassignTargetId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select category...</option>
                    {categories.filter((c) => c.id !== reassignCategory.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {catError && <p className="text-sm text-red-600">{catError}</p>}
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReassignCategory(null);
                    setReassignMenuCount(0);
                    setReassignTargetId("");
                    setCatError("");
                  }}
                  disabled={reassignSaving}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReassign}
                  disabled={!reassignTargetId || reassignSaving}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                >
                  {reassignSaving ? "Processing..." : "Reassign & Delete"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
