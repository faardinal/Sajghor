import { Collection, Product } from '../types';

export const collections: Collection[] = [
  {
    id: "autumn-collection",
    name: "Autumn Collection",
    subtitle: "The Season of Harvest",
    image: "https://i.pinimg.com/1200x/55/56/15/5556151eb19ee2e43749ebaaa27abf8d.jpg",
    description: "Deep tones and rich textures reflecting the quiet strength of the harvest season."
  },
  {
    id: "spring-weaves",
    name: "Spring Weaves",
    subtitle: "The Season of Renewal",
    image: "https://i.pinimg.com/736x/03/5b/c5/035bc5c37f84e4e69540090a68b6a194.jpg",
    description: "Lighter fabrics and ethereal palettes celebrating the awakening of the land."
  },
  {
    id: "limited-edition",
    name: "Limited Edition",
    subtitle: "Rare Artisan Pieces",
    image: "https://i.pinimg.com/1200x/7d/be/49/7dbe493aa4af4b6939312a66059b82ad.jpg",
    description: "Rare creations for the contemporary woman who values origin and timeless form."
  }
];

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "Embroidered Silk Scarf",
    price: 240,
    stock: 12,
    category: "Accessories",
    image: "https://i.pinimg.com/736x/22/a3/ad/22a3adde06cc185eab70739817dabecc.jpg",
    images: ["https://i.pinimg.com/736x/22/a3/ad/22a3adde06cc185eab70739817dabecc.jpg"],
    description: "A masterwork of silk embroidery featuring motifs inspired by ancestral garden designs.",
    story: "Each stitch in this collection whispers a tale of the royal gardens of Jaipur. Our artisans spent over 40 hours hand-embroidering these patterns, using techniques passed down through seven generations of the same family atelier.",
    material: "100% Pure Mulberry Silk",
    origin: "Hand-embroidered in Jaipur, India",
    dimensions: "180cm x 110cm",
    technique: "Zardozi hand-stitched details",
    collectionId: "autumn-collection",
    createdAt: 1714842000000
  },
  {
    id: "2",
    name: "Heritage Gold Choker",
    price: 850,
    stock: 5,
    category: "Jewelry",
    image: "https://i.pinimg.com/736x/72/5b/79/725b791e121b9787771884e62694f1db.jpg",
    images: ["https://i.pinimg.com/736x/72/5b/79/725b791e121b9787771884e62694f1db.jpg"],
    description: "A timeless statement piece crafted from 22k gold vermeil, bridging heritage and elegance.",
    story: "Inspired by the architectural arches of ancient Bengali palaces, this choker is a celebration of divine femininity. The intricate gold-work reflects the morning sun over the Ganges, capturing a moment of eternal grace.",
    material: "22k Gold Vermeil over Sterling Silver",
    origin: "Handcrafted in Dhaka, Bangladesh",
    dimensions: "Adjustable 32cm - 38cm",
    technique: "Traditional Filigree",
    collectionId: "autumn-collection",
    createdAt: 1714842001000
  },
  {
    id: "3",
    name: "Dusty Rose Linen Gown",
    price: 420,
    stock: 8,
    category: "Apparel",
    image: "https://i.pinimg.com/736x/72/5b/79/725b791e121b9787771884e62694f1db.jpg",
    images: ["https://i.pinimg.com/736x/72/5b/79/725b791e121b9787771884e62694f1db.jpg"],
    description: "Ethically sourced European linen, dyed in a bespoke dusty rose hue.",
    story: "The Rose Gown was born from a desire for effortless movement. The linen is stone-washed for unparalleled softness, reflecting the gentle morning mist of the French countryside where it was ethically sourced.",
    material: "100% Organic European Linen",
    origin: "Stitched in our Zero-Waste Atelier",
    dimensions: "One size fits all (Relaxed silhouette)",
    technique: "Natural botanical dyeing",
    collectionId: "spring-weaves",
    createdAt: 1714842002000
  },
  {
    id: "4",
    name: "Hand-carved Teak Box",
    price: 320,
    stock: 4,
    category: "Home",
    image: "https://i.pinimg.com/736x/e7/c0/fc/e7c0fcc89eb32c5d1f8b6aae3a22f261.jpg",
    images: ["https://i.pinimg.com/736x/e7/c0/fc/e7c0fcc89eb32c5d1f8b6aae3a22f261.jpg"],
    description: "A sanctuary for your most precious heirlooms, carved from reclaimed vintage teak wood.",
    story: "Each curve of this box was guided by the natural grain of centuries-old teak. Hand-carved in the rural workshops of Bali, it represents a slow dialogue between the craftsman and the timber, finished with natural beeswax.",
    material: "Reclaimed SVLK-Certified Teak",
    origin: "Artisan Village, Central Java",
    dimensions: "20cm x 15cm x 10cm",
    technique: "Traditional Chisel Carving",
    collectionId: "autumn-collection",
    createdAt: 1714842003000
  },
  {
    id: "5",
    name: "Pure Khadi Cotton Tunic",
    price: 280,
    stock: 15,
    category: "Apparel",
    image: "https://i.pinimg.com/1200x/35/ce/b5/35ceb5598743cd47011f853919eac83d.jpg",
    images: ["https://i.pinimg.com/1200x/35/ce/b5/35ceb5598743cd47011f853919eac83d.jpg"],
    description: "Breathable, hand-spun khadi cotton that softens with every journey and season.",
    story: "Woven on traditional hand-looms, this tunic is an ode to the history of self-reliance and organic textures. The irregular slubs in the fabric are the signature of the human hand, making each piece uniquely yours.",
    material: "100% Hand-spun Khadi Cotton",
    origin: "Weaving Collective, West Bengal",
    dimensions: "Available in S, M, L",
    technique: "Hand-loom weaving",
    collectionId: "autumn-collection",
    createdAt: 1714842004000
  }
];
