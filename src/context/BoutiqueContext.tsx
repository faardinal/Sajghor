import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Collection } from '../types';
import { collections } from '../data/collections';
import { supabase } from '../lib/supabaseClient';

interface BoutiqueContextType {
  products: Product[];
  collections: Collection[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  getProduct: (id: string) => Product | undefined;
  isLoading: boolean;
  error: string | null;
  isSplitSectionVisible: boolean;
  setIsSplitSectionVisible: (visible: boolean) => void;
  isClosingVisible: boolean;
  setIsClosingVisible: (visible: boolean) => void;
}

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(undefined);

const normalizeProduct = (raw: any): Product => {
  // Handle both snake_case (Supabase) and camelCase column names
  const createdAtRaw = raw.createdAt || raw.created_at;
  const parsedCreatedAt = typeof createdAtRaw === 'string'
    ? Date.parse(createdAtRaw)
    : Number(createdAtRaw);

  return {
    id: String(raw.id),
    name: String(raw.name || ''),
    price: Number(raw.price ?? 0),
    stock: Number(raw.stock ?? 0),
    category: String(raw.category || ''),
    image: String(raw.image || ''),
    images: Array.isArray(raw.images)
      ? raw.images.map(String)
      : raw.image
        ? [String(raw.image)]
        : [],
    description: String(raw.description || ''),
    story: String(raw.story || ''),
    material: String(raw.material || ''),
    origin: String(raw.origin || ''),
    collectionId: String(raw.collectionId || raw.collection_id || ''),
    createdAt: Number.isNaN(parsedCreatedAt) ? Date.now() : parsedCreatedAt,
    dimensions: raw.dimensions ? String(raw.dimensions) : undefined,
    technique: raw.technique ? String(raw.technique) : undefined,
  };
};

// Helper function to sanitize product data for Supabase operations
const sanitizeProductForSupabase = (productData: any) => {
  const sanitized: any = {};

  // Only include fields that exist in the Supabase table
  if (productData.name !== undefined) sanitized.name = String(productData.name).trim();
  if (productData.price !== undefined) sanitized.price = Number(productData.price);
  if (productData.stock !== undefined) sanitized.stock = Number(productData.stock);
  if (productData.category !== undefined) sanitized.category = String(productData.category).trim();
  if (productData.collectionId !== undefined) sanitized.collection_id = String(productData.collectionId).trim();
  if (productData.image !== undefined) sanitized.image = String(productData.image).trim();
  if (productData.images !== undefined) sanitized.images = Array.isArray(productData.images) ? productData.images.map(String) : [];
  if (productData.description !== undefined) sanitized.description = String(productData.description || '').trim();
  if (productData.story !== undefined) sanitized.story = String(productData.story || '').trim();
  if (productData.material !== undefined) sanitized.material = String(productData.material || '').trim();
  if (productData.origin !== undefined) sanitized.origin = String(productData.origin || '').trim();

  // Explicitly exclude fields that don't exist in Supabase table
  // dimensions and technique are not in the database schema

  return sanitized;
};

export function BoutiqueProvider({ children }: { children: React.ReactNode }) {
  const [isSplitSectionVisible, setIsSplitSectionVisible] = useState(false);
  const [isClosingVisible, setIsClosingVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[BoutiqueContext] Supabase error:', error.message);
          setError(`Database error: ${error.message}`);
          return;
        }

        if (data) {
          setProducts(data.map(normalizeProduct));
          console.log(`[BoutiqueContext] Loaded ${data.length} products from Supabase`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products';
        console.error('[BoutiqueContext] Unexpected error:', message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      // Sanitize product data to only include fields that exist in Supabase table
      const sanitizedData = sanitizeProductForSupabase(productData);

      // Add created_at timestamp
      const newProduct = {
        ...sanitizedData,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('[BoutiqueContext] addProduct Supabase error:', error.message);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No product returned from database');
      }

      const normalizedProduct = normalizeProduct(data);
      setProducts(prev => [normalizedProduct, ...prev]);
      console.log('[BoutiqueContext] Product added:', normalizedProduct.id);
      return normalizedProduct;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add product';
      console.error('[BoutiqueContext] addProduct error:', message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('[BoutiqueContext] deleteProduct Supabase error:', error.message);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.warn('[BoutiqueContext] Product not found for deletion:', id);
        throw new Error('Product not found');
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      console.log('[BoutiqueContext] Product deleted:', id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      console.error('[BoutiqueContext] deleteProduct error:', message);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Sanitize updates to only include fields that exist in Supabase table
      const sanitizedUpdates = sanitizeProductForSupabase(updates);

      // Remove undefined values to avoid sending them to Supabase
      Object.keys(sanitizedUpdates).forEach(key => {
        if (sanitizedUpdates[key] === undefined) {
          delete sanitizedUpdates[key];
        }
      });

      if (Object.keys(sanitizedUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }

      const { data, error } = await supabase
        .from('products')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[BoutiqueContext] updateProduct Supabase error:', error.message);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.warn('[BoutiqueContext] Product not found for update:', id);
        throw new Error('Product not found');
      }

      const updatedProduct = normalizeProduct(data);
      setProducts(prev => prev.map(p => (p.id === id ? updatedProduct : p)));
      console.log('[BoutiqueContext] Product updated:', id);
      return updatedProduct;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product';
      console.error('[BoutiqueContext] updateProduct error:', message);
      throw error;
    }
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <BoutiqueContext.Provider
      value={{
        products,
        collections,
        addProduct,
        deleteProduct,
        updateProduct,
        getProduct,
        isLoading,
        error,
        isSplitSectionVisible,
        setIsSplitSectionVisible,
        isClosingVisible,
        setIsClosingVisible,
      }}
    >
      {children}
    </BoutiqueContext.Provider>
  );
}

export function useBoutique() {
  const context = useContext(BoutiqueContext);
  if (context === undefined) {
    throw new Error('useBoutique must be used within a BoutiqueProvider');
  }
  return context;
}
