import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, Package, Image as ImageIcon, Sparkles, X, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { useBoutique } from '../context/BoutiqueContext';
import { Product } from '../types';
import { luxuryTransition, breathingVariants } from '../lib/motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Helper function to extract storage path from a Supabase public URL
// Returns null if the URL is not from Supabase Storage
const extractStoragePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Supabase storage URLs follow the pattern:
    // https://{project-ref}.supabase.co/storage/v1/object/public/{bucket-name}/{file-path}
    const pathSegments = urlObj.pathname.split('/');
    const publicIndex = pathSegments.indexOf('public');
    if (publicIndex !== -1 && publicIndex + 1 < pathSegments.length) {
      // Extract everything after /public/ as the storage path
      const bucketAndPath = pathSegments.slice(publicIndex + 1).join('/');
      // The first segment is the bucket name, rest is the file path
      const pathParts = bucketAndPath.split('/');
      if (pathParts.length > 1) {
        // Return path without bucket name (e.g., 'product-images/1234-file.jpg' -> '1234-file.jpg')
        return pathParts.slice(1).join('/');
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Helper function to check if a URL is from Supabase Storage bucket
const isSupabaseStorageUrl = (url: string, bucketName: string = 'product-images'): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.includes('/storage/v1/object/public/') && urlObj.pathname.includes(bucketName);
  } catch {
    return false;
  }
};

export default function Admin() {
  const { products, collections, addProduct, deleteProduct, updateProduct, isLoading, error } = useBoutique();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Store the original image URL when editing (for deletion on replace)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Heritage Carousel State
  const [carouselItems, setCarouselItems] = useState([
    { id: 1, title: "Yellow Embroidered Silk Kurta", image: "https://i.pinimg.com/736x/8f/94/8f/8f948f2191970b806d2036a1e3549652.jpg", video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972440/235fd49ac8cb6a558322491bf0604373_zfo08z.mp4" },
    { id: 2, title: "Ivory Hand-loomed Heritage Saree", image: "https://i.pinimg.com/736x/1a/10/7c/1a107c89b8849646961405e3ba0c6810.jpg", video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972441/From_KlickPin_CF_Aesthetic_boho_home_decor_ideas_that_look_expensive_while_staying_practical_realistic_and_beginner_friendly_for_people_who_want_stylish_ideas_on_a_-_Pin-757660337343178966_vq1qba.mp4" },
    { id: 3, title: "Muted Gold Royal Tunic", image: "https://i.pinimg.com/736x/91/9c/e8/919ce8d436a53697e8876a4ba2173167.jpg", video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972442/From_KlickPin_CF_Waving_Flag_Films___Photography_and_Video_Production___Delhi_NCR_on_Instagram_Timeless_elegance_captured_in_every_fold_and_flow_The_beauty_of_Indian_tr___Startup_fashion_Fashion_photography_Fas_y4ktih.mp4" },
    { id: 4, title: "Charcoal Velvet Evening Wrap", image: "https://i.pinimg.com/736x/2b/8c/7e/2b8c7ec788c7f9914757c917b2b8c2be.jpg", video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972443/8927ee10e4feeb3fcff0d0b6be0a287a_azaccy.mp4" },
    { id: 5, title: "Rosewood Silk Embroidered Scarf", image: "https://i.pinimg.com/736x/7d/87/42/7d87424687d698e3b1c1e5c8e4e93344.jpg", video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972450/e155b6fe79dfa0368e127fd438adca71_zpbtni.mp4" },
    { id: 6, title: "Sandstone Linen Summer Set", image: "https://i.pinimg.com/736x/ab/f6/e1/abf6e1654a938c5d9a9ba952994e77fc.jpg", video: "https://res.cloudinary.com/dz1a7jsy9/video/upload/v1777972443/8927ee10e4feeb3fcff0d0b6be0a287a_azaccy.mp4" }
  ]);
  const [carouselSaving, setCarouselSaving] = useState<number | null>(null);

  // Hero Image State
  const [heroImageUrl, setHeroImageUrl] = useState('https://res.cloudinary.com/dz1a7jsy9/image/upload/v1777906705/......_jshxbs.png');
  const [heroSaving, setHeroSaving] = useState(false);

  // Split Section State
  const [leftUrl, setLeftUrl] = useState('https://res.cloudinary.com/dz1a7jsy9/image/upload/v1777966831/b92ff5d2013e43589349109e09f7955f-upscaled-2x_duvbsi.png');
  const [rightUrl, setRightUrl] = useState('https://res.cloudinary.com/dz1a7jsy9/image/upload/v1777966832/989ad10afb992cfcad82d4ae6477a11b-upscaled-2x_qei8ju.png');
  const [leftLabel, setLeftLabel] = useState('The Atelier');
  const [leftButton, setLeftButton] = useState('Shop now');
  const [rightLabel, setRightLabel] = useState('Curated Soul');
  const [rightButton, setRightButton] = useState('Shop now');
  const [centerTitle, setCenterTitle] = useState('SAJGHOR');
  const [centerSubtitle, setCenterSubtitle] = useState('Spring Summer Ateliers');
  const [splitSaving, setSplitSaving] = useState<'left' | 'right' | null>(null);

  // Heritage Carousel Detail Editor State
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [heritageDetails, setHeritageDetails] = useState<{[key: number]: {
    price: string;
    stock: string;
    category: string;
    story: string;
    material: string;
    origin: string;
    image_urls: string[];
  }}>({});
  const [heritageDetailsSaving, setHeritageDetailsSaving] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Accessories',
    collectionId: collections[0]?.id || '',
    image: '',
    description: '',
    story: '',
    material: '',
    origin: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: 'Accessories',
      collectionId: collections[0]?.id || '',
      image: '',
      description: '',
      story: '',
      material: '',
      origin: '',
    });
    setEditingId(null);
    setIsAdding(false);
    setOperationError(null);
    setOperationSuccess(null);
    setSelectedFile(null);
    setImagePreview(null);
    setUploading(false);
    setOriginalImageUrl(null);
  };

  // Load carousel data from Supabase on mount
  useEffect(() => {
    supabase
      .from('heritage_carousel')
      .select('id, title, video')
      .then(({ data }) => { 
        if (data) {
          // Merge Supabase data with original image data
          const mergedData = data.map(dbItem => {
            const originalItem = carouselItems.find(item => item.id === dbItem.id);
            return {
              ...dbItem,
              image: originalItem?.image || ''
            };
          });
          setCarouselItems(mergedData);
        }
      });
  }, []);

  // Load hero image from Supabase on mount
  useEffect(() => {
    supabase
      .from('hero_config')
      .select('image_url')
      .eq('id', 1)
      .single()
      .then(({ data }) => { if (data) setHeroImageUrl(data.image_url); });
  }, []);

  // Load split section images from Supabase on mount
  useEffect(() => {
    supabase
      .from('split_section_config')
      .select('id, side, image_url, label, button_text, center_title, center_subtitle')
      .then(({ data }) => {
        if (!data) return;
        data.forEach(row => {
          if (row.side === 'left') {
            setLeftUrl(row.image_url);
            setLeftLabel(row.label);
            setLeftButton(row.button_text);
            if (row.center_title) setCenterTitle(row.center_title);
            if (row.center_subtitle) setCenterSubtitle(row.center_subtitle);
          }
          if (row.side === 'right') {
            setRightUrl(row.image_url);
            setRightLabel(row.label);
            setRightButton(row.button_text);
          }
        });
      });
  }, []);

  // Realtime subscription for heritage carousel
  useEffect(() => {
    const channel = supabase
      .channel('admin_heritage_carousel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'heritage_carousel' },
        (payload) => {
          setCarouselItems(prev => prev.map(item =>
            item.id === payload.new.id ? { ...item, ...payload.new } : item
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getDerivedThumbnail = (videoUrl: string, fallbackImage: string) => {
    if (videoUrl?.includes('cloudinary.com')) {
      return videoUrl.replace(/\.(mp4|webm|ogg|mov)$/, '.jpg');
    }
    return fallbackImage;
  };

  const handleCarouselSave = async (id: number, title: string, video: string) => {
    setCarouselSaving(id);
    try {
      const { error } = await supabase
        .from('heritage_carousel')
        .update({ title, video })
        .eq('id', id);

      if (!error) {
        // Update local state for immediate UI feedback
        setCarouselItems(prev => prev.map(item => 
          item.id === id ? { ...item, title, video } : item
        ));
        showSuccess(`Item ${id} updated successfully`);
      } else {
        showError('Failed to update carousel item');
      }
    } catch (err) {
      showError('Failed to update carousel item');
    } finally {
      setCarouselSaving(null);
    }
  };

  const handleHeroSave = async () => {
    setHeroSaving(true);
    try {
      const { error } = await supabase
        .from('hero_config')
        .update({ image_url: heroImageUrl })
        .eq('id', 1);

      if (!error) {
        showSuccess('Hero image updated successfully');
      } else {
        showError('Failed to update hero image');
      }
    } catch (err) {
      showError('Failed to update hero image');
    } finally {
      setHeroSaving(false);
    }
  };

  const handleSplitSave = async (side: 'left' | 'right') => {
    setSplitSaving(side);
    try {
      const payload = side === 'left'
        ? { image_url: leftUrl, label: leftLabel, button_text: leftButton, center_title: centerTitle, center_subtitle: centerSubtitle }
        : { image_url: rightUrl, label: rightLabel, button_text: rightButton };

      const { error } = await supabase
        .from('split_section_config')
        .update(payload)
        .eq('side', side);

      if (!error) {
        showSuccess(`${side === 'left' ? 'Left' : 'Right'} panel updated successfully`);
      } else {
        showError(`Failed to update ${side} panel`);
      }
    } catch (err) {
      showError(`Failed to update ${side} panel`);
    } finally {
      setSplitSaving(null);
    }
  };

  const handleHeritageSaveDetails = async (id: number, details: {
    price: number;
    stock: number;
    category: string;
    story: string;
    material: string;
    origin: string;
    image_urls: string[];
  }) => {
    setHeritageDetailsSaving(id);
    try {
      const { error } = await supabase
        .from('heritage_carousel')
        .update(details)
        .eq('id', id);

      if (!error) {
        showSuccess(`Item ${id} details updated`);
        // update local carouselItems state so admin panel reflects immediately
        setCarouselItems(prev => prev.map(item =>
          item.id === id ? { ...item, ...details } : item
        ));
      } else {
        showError('Failed to save item details');
      }
    } catch (err) {
      showError('Failed to save item details');
    } finally {
      setHeritageDetailsSaving(null);
    }
  };

  const toggleExpandedRow = async (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        return newSet;
      }
      newSet.add(id);
      return newSet;
    });

    // Always fetch fresh full data from Supabase when expanding
    if (!expandedRows.has(id)) {
      const { data } = await supabase
        .from('heritage_carousel')
        .select('id, price, stock, category, story, material, origin, image_urls')
        .eq('id', id)
        .single();

      if (data) {
        setHeritageDetails(prev => ({
          ...prev,
          [id]: {
            price: String(data.price ?? 0),
            stock: String(data.stock ?? 1),
            category: data.category ?? 'Heritage',
            story: data.story ?? '',
            material: data.material ?? '',
            origin: data.origin ?? '',
            image_urls: data.image_urls ?? []
          }
        }));
      }
    }
  };

  const showSuccess = (message: string) => {
    setOperationSuccess(message);
    setTimeout(() => setOperationSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setOperationError(message);
    setTimeout(() => setOperationError(null), 5000);
  };

  /**
   * Upload a single image to Supabase Storage
   * Returns the public URL of the uploaded image
   * This function is designed to be called multiple times for multi-image support
   */
  const uploadImage = async (file: File): Promise<string> => {
    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image must be less than 2MB');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      console.error('[Admin] Upload error:', error);
      throw new Error('Failed to upload image to storage');
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  /**
   * Upload multiple images - future-ready helper for multi-image support
   * Currently accepts an array but we only use the first file for single-image flow
   * Can be extended to return string[] for multiple images
   */
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  /**
   * Delete an old image from Supabase Storage
   * Only deletes if the URL is from the product-images bucket
   */
  const deleteOldImage = async (oldImageUrl: string): Promise<void> => {
    // Skip if no old image or not a Supabase Storage URL
    if (!oldImageUrl || !isSupabaseStorageUrl(oldImageUrl)) {
      return;
    }

    const storagePath = extractStoragePathFromUrl(oldImageUrl);
    if (!storagePath) {
      console.warn('[Admin] Could not extract storage path from URL:', oldImageUrl);
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('product-images')
        .remove([storagePath]);

      if (error) {
        console.error('[Admin] Failed to delete old image:', error);
        // Don't throw - we don't want to fail the whole operation if deletion fails
      } else {
        console.log('[Admin] Successfully deleted old image:', storagePath);
      }
    } catch (err) {
      console.error('[Admin] Error deleting old image:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/account');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationError(null);
    setIsSubmitting(true);

    // Only set uploading state if we have a file to upload
    const hasNewImage = !!selectedFile;
    if (hasNewImage) {
      setUploading(true);
    }

    try {
      let imageUrl = formData.image;
      let newImageUploaded = false;

      // Upload new image if selected (single image flow - future ready for multiple)
      if (selectedFile) {
        // For future multi-image support, we could use:
        // const uploadedUrls = await uploadImages([selectedFile]);
        // imageUrl = uploadedUrls[0] || '';
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
        newImageUploaded = true;
      }

      // Prepare product payload with images array (future-ready structure)
      const productPayload = {
        ...formData,
        image: imageUrl,           // Main image (single image flow)
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: [imageUrl],        // Images array (ready for multiple images)
      };

      if (editingId) {
        // Update existing product
        await updateProduct(editingId, productPayload);

        // Delete old image from storage only if:
        // 1. A new image was uploaded successfully
        // 2. There was an original image URL
        // 3. The new image is different from the original
        if (newImageUploaded && originalImageUrl && imageUrl !== originalImageUrl) {
          await deleteOldImage(originalImageUrl);
        }

        showSuccess('Product updated successfully');
      } else {
        // Add new product
        await addProduct(productPayload);
        showSuccess('Product added to archive');
      }
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      showError(message);
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      collectionId: product.collectionId,
      image: product.image,
      description: product.description,
      story: product.story,
      material: product.material,
      origin: product.origin,
    });
    setEditingId(product.id);
    setIsAdding(true);
    setOperationError(null);
    setSelectedFile(null);
    setImagePreview(product.image);
    setUploading(false);
    // Store original image URL for potential deletion if replaced
    setOriginalImageUrl(product.image || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setOperationError(null);
    try {
      await deleteProduct(id);
      showSuccess('Product removed from archive');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      showError(message);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-16 border-b border-gold/10 pb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold block mb-2">Management Console</span>
            <h1 className="text-4xl md:text-6xl font-serif italic text-charcoal tracking-tight">Atelier Archive</h1>
            <span className="text-[8px] uppercase tracking-widest text-gold/60 mt-2 block">Admin Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-transparent text-olive px-6 py-3 text-[10px] uppercase tracking-[0.3em] hover:text-gold border border-gold/20 hover:border-gold/40 transition-all duration-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-3 bg-charcoal text-ivory px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-gold transition-all duration-700"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? 'Close Studio' : 'Add New Creation'}
            </button>
          </div>
        </div>

        {/* Global Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border border-red-200 rounded p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Form Drawer/Section */}
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="lg:col-span-5"
              >
                <div className="bg-[#FAF8F6] p-10 border border-gold/5 shadow-sm sticky top-32">
                  <h2 className="text-2xl font-serif italic text-charcoal mb-10">
                    {editingId ? 'Refine Creation' : 'Archive New Masterpiece'}
                  </h2>

                  {/* Operation Error Alert */}
                  <AnimatePresence>
                    {operationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-6 bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-xs">{operationError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Operation Success Alert */}
                  <AnimatePresence>
                    {operationSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-6 bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-green-700 text-xs">{operationSuccess}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Product Name</label>
                        <input 
                          required
                          disabled={isSubmitting}
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white border border-gold/10 px-4 py-3 text-[14px] focus:outline-none focus:border-gold/30 transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Price (BDT)</label>
                        <input 
                          required
                          disabled={isSubmitting}
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-white border border-gold/10 px-4 py-3 text-[14px] focus:outline-none focus:border-gold/30 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Stock Count</label>
                        <input 
                          required
                          disabled={isSubmitting}
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={e => setFormData({...formData, stock: e.target.value})}
                          className="w-full bg-white border border-gold/10 px-4 py-3 text-[14px] focus:outline-none focus:border-gold/30 transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Collection</label>
                        <select 
                          disabled={isSubmitting}
                          value={formData.collectionId}
                          onChange={e => setFormData({...formData, collectionId: e.target.value})}
                          className="w-full bg-white border border-gold/10 px-4 py-3 text-[14px] focus:outline-none focus:border-gold/30 transition-colors appearance-none disabled:opacity-50"
                        >
                          {collections.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Product Image</label>
                      <div className="space-y-4">
                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="w-32 h-32 border border-gold/10 bg-ivory overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        
                        {/* File Input */}
                        <div className="relative">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isSubmitting || uploading}
                            className="hidden"
                            id="image-upload"
                          />
                          <label 
                            htmlFor="image-upload"
                            className="flex items-center gap-3 bg-white border border-gold/10 px-4 py-3 text-[14px] cursor-pointer hover:border-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ImageIcon className="w-4 h-4 text-gold/40" />
                            {selectedFile ? selectedFile.name : 'Choose image...'}
                            {uploading && <span className="text-gold animate-pulse">Uploading...</span>}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Archive Story</label>
                      <textarea 
                        required
                        disabled={isSubmitting}
                        rows={4}
                        value={formData.story}
                        onChange={e => setFormData({...formData, story: e.target.value})}
                        placeholder="The heritage behind this piece..."
                        className="w-full bg-white border border-gold/10 px-4 py-4 text-[14px] focus:outline-none focus:border-gold/30 transition-colors italic disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Material</label>
                        <input 
                          disabled={isSubmitting}
                          value={formData.material}
                          onChange={e => setFormData({...formData, material: e.target.value})}
                          className="w-full bg-white border border-gold/10 px-4 py-3 text-[14px] disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Origin</label>
                        <input 
                          disabled={isSubmitting}
                          value={formData.origin}
                          onChange={e => setFormData({...formData, origin: e.target.value})}
                          className="w-full bg-white border border-gold/10 px-4 py-3 text-[14px] disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || uploading}
                      className="w-full bg-gold text-ivory py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700 mt-6 shadow-lg shadow-gold/20"
                    >
                      {uploading ? 'Uploading Image...' : isSubmitting ? 'Processing...' : (editingId ? 'Update Record' : 'Commit to Archive')}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Product List */}
          <div className={`${isAdding ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            {isLoading ? (
              <div className="text-center py-40">
                <Package className="w-12 h-12 text-gold/20 mx-auto mb-6 animate-pulse" />
                <p className="text-olive italic opacity-40 uppercase tracking-widest text-[12px]">Loading archive...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((product) => (
                  <motion.div 
                    layout
                    key={product.id}
                    className="bg-white border border-gold/10 p-6 flex flex-col md:flex-row items-center gap-8 group hover:shadow-[0_15px_40px_-20px_rgba(197,160,89,0.15)] transition-all duration-[1s]"
                  >
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-ivory border border-gold/5">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s]" 
                      />
                    </div>
                    
                    <div className="flex-grow text-center md:text-left space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                        <h3 className="text-xl font-serif text-charcoal">{product.name}</h3>
                        <span className="text-[9px] uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 border border-gold/10">
                          {collections.find(c => c.id === product.collectionId)?.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-olive italic opacity-60 line-clamp-1">{product.story}</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 px-8 border-x border-gold/5 min-w-[120px]">
                       <span className="text-[14px] text-charcoal">BDT {product.price}</span>
                       <div className="flex items-center gap-2">
                          {product.stock <= 3 && <Sparkles className="w-3 h-3 text-gold animate-pulse" />}
                          <span className={`text-[10px] uppercase tracking-widest ${product.stock === 0 ? 'text-red-400' : 'text-olive'}`}>
                            {product.stock === 0 ? 'Sold Out' : `${product.stock} In Stock`}
                          </span>
                       </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-3 text-olive hover:text-gold hover:bg-gold/5 rounded-full transition-all duration-500"
                        title="Edit product"
                      >
                        <Edit3 className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-500"
                        title="Delete product"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-40 border-2 border-dashed border-gold/10">
                    <Package className="w-12 h-12 text-gold/20 mx-auto mb-6" />
                    <p className="text-olive italic opacity-40 uppercase tracking-widest text-[12px]">The archive is currently empty</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Heritage Carousel Manager Section */}
        <div className="mt-24 pt-16 border-t border-gold/10">
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold block mb-2">Carousel Management</span>
            <h2 className="text-3xl md:text-4xl font-serif italic text-charcoal tracking-tight">Heritage Carousel</h2>
            <span className="text-[8px] uppercase tracking-widest text-gold/60 mt-2 block">Manage Featured Pieces</span>
          </div>

          <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FAF8F6] border-b border-gold/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-[#8C867E]">Item</th>
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-[#8C867E]">Title</th>
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-[#8C867E]">Video URL</th>
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-[#8C867E]">Preview</th>
                    <th className="text-center px-6 py-4 text-[10px] uppercase tracking-widest text-[#8C867E]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {carouselItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F6]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm text-charcoal font-medium">Item {item.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          defaultValue={item.title}
                          id={`title-${item.id}`}
                          className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                          placeholder="Enter title..."
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          defaultValue={item.video}
                          id={`video-${item.id}`}
                          onInput={(e) => {
                            // Update preview in real-time as user types
                            const previewImg = document.getElementById(`preview-${item.id}`) as HTMLImageElement;
                            const label = document.getElementById(`label-${item.id}`) as HTMLSpanElement;
                            const videoUrl = e.currentTarget.value;
                            const derivedUrl = getDerivedThumbnail(videoUrl, item.image);
                            
                            if (previewImg) {
                              previewImg.src = derivedUrl;
                            }
                            if (label) {
                              label.textContent = videoUrl?.includes('cloudinary.com') 
                                ? 'Auto-derived from video URL' 
                                : 'Using original image';
                            }
                          }}
                          className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                          placeholder="Enter video URL..."
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                          <img
                            id={`preview-${item.id}`}
                            src={getDerivedThumbnail(item.video, item.image)}
                            alt="Thumbnail preview"
                            className="w-20 h-24 object-cover rounded border border-gold/10"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = document.getElementById(`placeholder-${item.id}`);
                              if (placeholder) {
                                (placeholder as HTMLDivElement).style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'block';
                              const placeholder = document.getElementById(`placeholder-${item.id}`);
                              if (placeholder) {
                                (placeholder as HTMLDivElement).style.display = 'none';
                              }
                            }}
                          />
                          <div
                            id={`placeholder-${item.id}`}
                            className="w-20 h-24 bg-gray-100 rounded border border-gold/10 flex items-center justify-center"
                            style={{ display: 'none' }}
                          >
                            <span className="text-xs text-gray-500 text-center">Preview unavailable</span>
                          </div>
                          <span
                            id={`label-${item.id}`}
                            className="text-[9px] text-olive/60 text-center"
                          >
                            {item.video?.includes('cloudinary.com') 
                              ? 'Auto-derived from video URL' 
                              : 'Using original image'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => {
                              const titleInput = document.getElementById(`title-${item.id}`) as HTMLInputElement;
                              const videoInput = document.getElementById(`video-${item.id}`) as HTMLInputElement;
                              handleCarouselSave(item.id, titleInput.value, videoInput.value);
                            }}
                            disabled={carouselSaving === item.id}
                            className="px-4 py-2 bg-gold text-ivory text-[10px] uppercase tracking-[0.3em] hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700"
                          >
                            {carouselSaving === item.id ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => toggleExpandedRow(item.id)}
                            className="px-3 py-2 border border-gold/20 text-gold text-[10px] uppercase tracking-[0.3em] hover:bg-gold/10 transition-all duration-700"
                          >
                            {expandedRows.has(item.id) ? 'Collapse' : 'Details'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Expandable Detail Rows */}
                  {carouselItems.map((item) => (
                    expandedRows.has(item.id) && (
                      <tr key={`details-${item.id}`}>
                        <td colSpan={5} className="px-6 py-0">
                          <div className="py-6 border-b border-gold/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Product Images */}
                              <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Product Images</label>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    {heritageDetails[item.id]?.image_urls?.map((url, idx) => (
                                      <div key={idx} className="relative group">
                                        <img
                                          src={url}
                                          alt={`Product image ${idx + 1}`}
                                          className="w-full h-20 object-cover rounded border border-gold/10"
                                        />
                                        <button
                                          onClick={() => {
                                            const newUrls = [...(heritageDetails[item.id]?.image_urls || [])];
                                            newUrls.splice(idx, 1);
                                            setHeritageDetails(prev => ({
                                              ...prev,
                                              [item.id]: { ...prev[item.id], image_urls: newUrls }
                                            }));
                                          }}
                                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    {(heritageDetails[item.id]?.image_urls?.length || 0) < 4 && (
                                      <button
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.multiple = false;
                                          input.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                              const url = await uploadImage(file);
                                              if (url) {
                                                setHeritageDetails(prev => ({
                                                  ...prev,
                                                  [item.id]: {
                                                    ...prev[item.id],
                                                    image_urls: [...(prev[item.id]?.image_urls || []), url]
                                                  }
                                                }));
                                              }
                                            }
                                          };
                                          input.click();
                                        }}
                                        className="w-full h-20 border-2 border-dashed border-gold/20 rounded flex items-center justify-center text-gold/60 hover:border-gold/40 transition-colors text-[10px]"
                                      >
                                        + Add
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Price and Stock */}
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Price (BDT)</label>
                                  <input
                                    type="number"
                                    value={heritageDetails[item.id]?.price || ''}
                                    onChange={(e) => setHeritageDetails(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], price: e.target.value }
                                    }))}
                                    className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Stock</label>
                                  <input
                                    type="number"
                                    value={heritageDetails[item.id]?.stock || ''}
                                    onChange={(e) => setHeritageDetails(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], stock: e.target.value }
                                    }))}
                                    className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                                    placeholder="1"
                                  />
                                </div>
                              </div>

                              {/* Category and Material */}
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Category</label>
                                  <input
                                    type="text"
                                    value={heritageDetails[item.id]?.category || ''}
                                    onChange={(e) => setHeritageDetails(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], category: e.target.value }
                                    }))}
                                    className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                                    placeholder="Heritage"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Material</label>
                                  <input
                                    type="text"
                                    value={heritageDetails[item.id]?.material || ''}
                                    onChange={(e) => setHeritageDetails(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], material: e.target.value }
                                    }))}
                                    className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                                    placeholder="Material..."
                                  />
                                </div>
                              </div>

                              {/* Origin */}
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Origin</label>
                                  <input
                                    type="text"
                                    value={heritageDetails[item.id]?.origin || ''}
                                    onChange={(e) => setHeritageDetails(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], origin: e.target.value }
                                    }))}
                                    className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                                    placeholder="Origin..."
                                  />
                                </div>
                              </div>

                              {/* Story */}
                              <div className="space-y-3 md:col-span-2">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Story</label>
                                  <textarea
                                    value={heritageDetails[item.id]?.story || ''}
                                    onChange={(e) => setHeritageDetails(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], story: e.target.value }
                                    }))}
                                    className="w-full bg-white border border-gold/10 px-3 py-2 text-sm focus:outline-none focus:border-gold/30 transition-colors resize-none"
                                    rows={3}
                                    placeholder="Product story..."
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Save Details Button */}
                            <div className="mt-6 pt-4 border-t border-gold/5">
                              <button
                                onClick={() => {
                                  const details = heritageDetails[item.id];
                                  if (details) {
                                    handleHeritageSaveDetails(item.id, {
                                      price: parseFloat(details.price) || 0,
                                      stock: parseInt(details.stock) || 1,
                                      category: details.category,
                                      story: details.story,
                                      material: details.material,
                                      origin: details.origin,
                                      image_urls: details.image_urls
                                    });
                                  }
                                }}
                                disabled={heritageDetailsSaving === item.id}
                                className="px-6 py-3 bg-gold text-ivory text-[10px] uppercase tracking-[0.3em] hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700"
                              >
                                {heritageDetailsSaving === item.id ? 'Saving...' : 'Save Details'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* Hero Image Manager Section */}
        <div className="mt-24 pt-16 border-t border-gold/10">
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold block mb-2">Hero Management</span>
            <h2 className="text-3xl md:text-4xl font-serif italic text-charcoal tracking-tight">Hero Image</h2>
            <span className="text-[8px] uppercase tracking-widest text-gold/60 mt-2 block">Manage Main Banner</span>
          </div>

          <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Image URL</label>
                    <input
                      type="text"
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      onInput={(e) => {
                        // Update preview in real-time as user types
                        const previewImg = document.getElementById('hero-preview') as HTMLImageElement;
                        if (previewImg) {
                          previewImg.src = e.currentTarget.value;
                        }
                      }}
                      className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                      placeholder="Enter image URL..."
                    />
                  </div>
                  <button
                    onClick={handleHeroSave}
                    disabled={heroSaving}
                    className="px-6 py-3 bg-gold text-ivory text-[10px] uppercase tracking-[0.3em] hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700"
                  >
                    {heroSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>

                {/* Right: Preview */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full max-w-sm">
                    <img
                      id="hero-preview"
                      src={heroImageUrl}
                      alt="Hero preview"
                      className="w-full h-40 object-cover rounded border border-gold/10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = document.getElementById('hero-placeholder');
                        if (placeholder) {
                          (placeholder as HTMLDivElement).style.display = 'flex';
                        }
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'block';
                        const placeholder = document.getElementById('hero-placeholder');
                        if (placeholder) {
                          (placeholder as HTMLDivElement).style.display = 'none';
                        }
                      }}
                    />
                    <div
                      id="hero-placeholder"
                      className="w-full h-40 bg-gray-100 rounded border border-gold/10 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-sm text-gray-500 text-center">Preview unavailable</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-olive/60 text-center">Live preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split Section Image Manager Section */}
        <div className="mt-24 pt-16 border-t border-gold/10">
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold block mb-2">Split Section Management</span>
            <h2 className="text-3xl md:text-4xl font-serif italic text-charcoal tracking-tight">Split Section Images</h2>
            <span className="text-[8px] uppercase tracking-widest text-gold/60 mt-2 block">Manage Panel Images</span>
          </div>

          <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Center Overlay Fields */}
              <div className="border-b border-gold/5 pb-8">
                <div className="mb-6">
                  <h3 className="text-lg font-serif text-charcoal mb-2">Center Overlay</h3>
                  <p className="text-sm text-olive/60">Brand title and subtitle displayed in the center</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Brand Title</label>
                      <input
                        type="text"
                        value={centerTitle}
                        onChange={(e) => setCenterTitle(e.target.value)}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter brand title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Subtitle</label>
                      <input
                        type="text"
                        value={centerSubtitle}
                        onChange={(e) => setCenterSubtitle(e.target.value)}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter subtitle..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-100 rounded border border-gold/10 flex items-center justify-center mb-4">
                        <span className="text-sm text-gray-500">Center overlay preview</span>
                      </div>
                      <span className="text-[9px] text-olive/60 text-center">Saved with left panel</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Left Panel */}
              <div className="border-b border-gold/5 pb-8">
                <div className="mb-4">
                  <label className="text-[12px] uppercase tracking-widest text-[#8C867E] block mb-2">Left Panel — The Atelier</label>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Image URL</label>
                      <input
                        type="text"
                        value={leftUrl}
                        onChange={(e) => setLeftUrl(e.target.value)}
                        onInput={(e) => {
                          // Update preview in real-time as user types
                          const previewImg = document.getElementById('split-left-preview') as HTMLImageElement;
                          if (previewImg) {
                            previewImg.src = e.currentTarget.value;
                          }
                        }}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter left panel image URL..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Panel Label</label>
                      <input
                        type="text"
                        value={leftLabel}
                        onChange={(e) => setLeftLabel(e.target.value)}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter panel label..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Button Text</label>
                      <input
                        type="text"
                        value={leftButton}
                        onChange={(e) => setLeftButton(e.target.value)}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter button text..."
                      />
                    </div>
                    <button
                      onClick={() => handleSplitSave('left')}
                      disabled={splitSaving === 'left'}
                      className="px-6 py-3 bg-gold text-ivory text-[10px] uppercase tracking-[0.3em] hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700"
                    >
                      {splitSaving === 'left' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-sm">
                      <img
                        id="split-left-preview"
                        src={leftUrl}
                        alt="Left panel preview"
                        className="w-full h-40 object-cover rounded border border-gold/10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = document.getElementById('split-left-placeholder');
                          if (placeholder) {
                            (placeholder as HTMLDivElement).style.display = 'flex';
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'block';
                          const placeholder = document.getElementById('split-left-placeholder');
                          if (placeholder) {
                            (placeholder as HTMLDivElement).style.display = 'none';
                          }
                        }}
                      />
                      <div
                        id="split-left-placeholder"
                        className="w-full h-40 bg-gray-100 rounded border border-gold/10 flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <span className="text-sm text-gray-500 text-center">Preview unavailable</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-olive/60 text-center">Live preview</span>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div>
                <div className="mb-4">
                  <label className="text-[12px] uppercase tracking-widest text-[#8C867E] block mb-2">Right Panel — Curated Soul</label>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Image URL</label>
                      <input
                        type="text"
                        value={rightUrl}
                        onChange={(e) => setRightUrl(e.target.value)}
                        onInput={(e) => {
                          // Update preview in real-time as user types
                          const previewImg = document.getElementById('split-right-preview') as HTMLImageElement;
                          if (previewImg) {
                            previewImg.src = e.currentTarget.value;
                          }
                        }}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter right panel image URL..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Panel Label</label>
                      <input
                        type="text"
                        value={rightLabel}
                        onChange={(e) => setRightLabel(e.target.value)}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter panel label..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8C867E]">Button Text</label>
                      <input
                        type="text"
                        value={rightButton}
                        onChange={(e) => setRightButton(e.target.value)}
                        className="w-full bg-white border border-gold/10 px-4 py-3 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                        placeholder="Enter button text..."
                      />
                    </div>
                    <button
                      onClick={() => handleSplitSave('right')}
                      disabled={splitSaving === 'right'}
                      className="px-6 py-3 bg-gold text-ivory text-[10px] uppercase tracking-[0.3em] hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700"
                    >
                      {splitSaving === 'right' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-sm">
                      <img
                        id="split-right-preview"
                        src={rightUrl}
                        alt="Right panel preview"
                        className="w-full h-40 object-cover rounded border border-gold/10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = document.getElementById('split-right-placeholder');
                          if (placeholder) {
                            (placeholder as HTMLDivElement).style.display = 'flex';
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'block';
                          const placeholder = document.getElementById('split-right-placeholder');
                          if (placeholder) {
                            (placeholder as HTMLDivElement).style.display = 'none';
                          }
                        }}
                      />
                      <div
                        id="split-right-placeholder"
                        className="w-full h-40 bg-gray-100 rounded border border-gold/10 flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <span className="text-sm text-gray-500 text-center">Preview unavailable</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-olive/60 text-center">Live preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
