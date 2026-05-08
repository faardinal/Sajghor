export interface Product {
  id: string; // Changed to string for easier GUID/Timestamp IDs
  name: string;
  price: number; // Changed to number for calculations
  stock: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  story: string;
  material: string;
  origin: string;
  collectionId: string; // Reference to collection
  createdAt: number;
  dimensions?: string;
  technique?: string;
}

export interface Collection {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  description: string;
}
