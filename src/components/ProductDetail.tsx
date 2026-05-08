import { motion, AnimatePresence, Transition } from 'motion/react';
import { Minus, Plus, ChevronLeft, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBoutique } from '../context/BoutiqueContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const luxuryTransition = {
  duration: 1.2,
  ease: [0.22, 1, 0.36, 1]
} as Transition;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, products } = useBoutique();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [heritageProduct, setHeritageProduct] = useState<any>(null);
  const [heritageLoading, setHeritageLoading] = useState(false);
  
  const product = getProduct(id || '');
  
  // Resolve which product data to use
  const resolvedProduct = product || (heritageProduct ? {
    id: String(heritageProduct.id),
    name: heritageProduct.title,
    price: heritageProduct.price || 0,
    stock: heritageProduct.stock ?? 1,
    category: heritageProduct.category || 'Heritage',
    story: heritageProduct.story || '',
    material: heritageProduct.material || '',
    origin: heritageProduct.origin || '',
    image: heritageProduct.image_urls?.[0] || '',
    images: heritageProduct.image_urls || [],
    collectionId: '',
    description: heritageProduct.story || '',
    dimensions: heritageProduct.dimensions || '',
    technique: heritageProduct.technique || '',
  } : null);
  
  // For heritage items, build a unified media list: video first, then images
  const heritageMediaItems: { type: 'video' | 'image'; src: string }[] = heritageProduct
    ? [
        ...(heritageProduct.video ? [{ type: 'video' as const, src: heritageProduct.video }] : []),
        ...(heritageProduct.image_urls || []).map((url: string) => ({ type: 'image' as const, src: url }))
      ]
    : [];

  const isHeritageView = !!heritageProduct;

  const relatedProducts = products
    .filter(p => p.id !== id && p.category === resolvedProduct?.category)
    .slice(0, 3);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    // Only fetch from heritage table if not found in regular products
    if (!product && id) {
      const numericId = parseInt(id);
      if (!isNaN(numericId) && numericId >= 1 && numericId <= 6) {
        setHeritageLoading(true);
        supabase
          .from('heritage_carousel')
          .select('*')
          .eq('id', numericId)
          .single()
          .then(({ data }) => {
            if (data) setHeritageProduct(data);
            setHeritageLoading(false);
          });

        // Realtime subscription for this specific item
        const channel = supabase
          .channel(`heritage_product_${numericId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'heritage_carousel', filter: `id=eq.${numericId}` },
            (payload) => { setHeritageProduct(payload.new); }
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }
    }
  }, [id, product]);

  useEffect(() => {
    if (resolvedProduct && quantity > resolvedProduct.stock && resolvedProduct.stock > 0) {
      setQuantity(resolvedProduct.stock);
    }
  }, [resolvedProduct, quantity]);

  if (heritageLoading) {
    return (
      <div className="min-h-screen pt-48 px-6 text-center bg-[#FBFAF7]">
        <span className="text-[10px] uppercase tracking-[0.5em] text-gold/60 mb-6 block">Collection Archive</span>
        <h2 className="text-2xl font-serif font-light text-charcoal mb-10">Loading heritage piece...</h2>
      </div>
    );
  }

  if (!resolvedProduct) {
    return (
      <div className="min-h-screen pt-48 px-6 text-center bg-[#FBFAF7]">
        <span className="text-[10px] uppercase tracking-[0.5em] text-gold/60 mb-6 block">Collection Archive</span>
        <h2 className="text-2xl font-serif font-light text-charcoal mb-10">Piece not found in current curation</h2>
        <button 
          onClick={() => navigate('/')} 
          className="text-[10px] uppercase tracking-[0.3em] py-4 px-10 border border-charcoal/10 hover:bg-charcoal hover:text-ivory transition-all duration-700"
        >
          Return to Atelier
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!resolvedProduct || resolvedProduct.stock === 0) return;
    addToCart({
      id: resolvedProduct.id,
      name: resolvedProduct.name,
      price: resolvedProduct.price,
      image: resolvedProduct.image,
      quantity,
    });
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2500);
  };

  const images = resolvedProduct.images && resolvedProduct.images.length > 0 ? resolvedProduct.images : [resolvedProduct.image];

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(15px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ ...luxuryTransition, duration: 1.5 }}
      className="min-h-screen bg-[#FBFAF7] pt-24 md:pt-32 pb-40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-12 md:mb-20">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, ...luxuryTransition }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 group text-[9px] uppercase tracking-[0.4em] text-charcoal/40 hover:text-gold transition-colors duration-700"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-700 group-hover:-translate-x-1" strokeWidth={1} />
            Back to Collection
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          {/* Left Side: Editorial Image Gallery (Lg: 7 cols) */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ ...luxuryTransition, delay: 0.2 }}
              className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-[#F6F4F0] perspective-1000"
            >
              <AnimatePresence mode="wait">
                {isHeritageView ? (
                  // Heritage: show video or image based on activeImageIndex
                  heritageMediaItems[activeImageIndex]?.type === 'video' ? (
                    <video
                      key="heritage-video"
                      src={heritageMediaItems[activeImageIndex].src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.img
                      key={`heritage-img-${activeImageIndex}`}
                      src={heritageMediaItems[activeImageIndex]?.src}
                      alt={resolvedProduct.name}
                      initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  // Regular product: existing image logic unchanged
                  <motion.img 
                    key={activeImageIndex}
                    src={images[activeImageIndex]} 
                    alt={resolvedProduct.name} 
                    initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>
              
              {resolvedProduct.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="text-[10px] uppercase tracking-[0.8em] text-charcoal bg-white/60 backdrop-blur-xl px-12 py-6 border border-black/5">
                    Private Archive
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Navigation */}
            {isHeritageView && heritageMediaItems.length > 1 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                {heritageMediaItems.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 aspect-square overflow-hidden transition-all duration-700 ${
                      activeImageIndex === idx ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    {media.type === 'video' ? (
                      // Video thumbnail: show a derived .jpg from Cloudinary, or a play icon fallback
                      <div className="w-full h-full relative bg-charcoal/10">
                        <img
                          src={media.src.replace(/\.(mp4|webm|ogg|mov)$/, '.jpg')}
                          alt="Video"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If Cloudinary thumb fails, show dark bg with play icon
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* Play icon overlay always shown on video thumb */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={media.src}
                        alt={`${resolvedProduct.name} ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {activeImageIndex === idx && (
                      <motion.div layoutId="thumb-border" className="absolute inset-0 border border-gold/40 z-10" />
                    )}
                  </button>
                ))}
              </div>
            ) : (!isHeritageView && images.length > 1) ? (
              // Regular product thumbnails — existing code unchanged
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 aspect-square overflow-hidden transition-all duration-700 ${activeImageIndex === idx ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                  >
                    <img src={img} alt={`${resolvedProduct.name} detail ${idx + 1}`} className="w-full h-full object-cover" />
                    {activeImageIndex === idx && (
                      <motion.div layoutId="thumb-border" className="absolute inset-0 border border-gold/40 z-10" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right Side: Information Panel (Lg: 5 cols) */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...luxuryTransition, delay: 0.4 }}
              className="sticky top-32 space-y-16"
            >
              {/* Product Header */}
              <header className="space-y-6">
                <div className="flex items-center gap-6">
                  <span className="text-[9px] uppercase tracking-[0.6em] text-gold/60 font-light">
                    {resolvedProduct.category}
                  </span>
                  {resolvedProduct.stock > 0 && resolvedProduct.stock <= 2 && (
                    <span className="text-[8px] uppercase tracking-[0.2em] text-gold/80 px-2 py-0.5 border border-gold/20 flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      Limited Availability
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-serif font-light text-charcoal tracking-tight leading-[1.1]">
                  {resolvedProduct.name}
                </h1>
                
                <div className="flex items-baseline gap-4">
                  <span className="text-lg font-light text-charcoal/80 tracking-widest">BDT {resolvedProduct.price}</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 italic">Value of Creation</span>
                </div>
              </header>

              {/* Poetic Description */}
              <div className="space-y-10 group">
                <p className="text-charcoal/70 text-[16px] md:text-[18px] font-light leading-[1.8] font-sans italic opacity-90 transition-opacity duration-700 group-hover:opacity-100">
                  {resolvedProduct.story}
                </p>

                {/* Technical Triptych */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                  <div className="space-y-2">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-gold/40 font-medium block">The Material</span>
                    <p className="text-[12px] text-charcoal/60 font-light tracking-wide">{resolvedProduct.material}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-gold/40 font-medium block">The Provenance</span>
                    <p className="text-[12px] text-charcoal/60 font-light tracking-wide">{resolvedProduct.origin}</p>
                  </div>
                  {resolvedProduct.dimensions && (
                    <div className="space-y-2">
                      <span className="text-[8px] uppercase tracking-[0.4em] text-gold/40 font-medium block">The Scale</span>
                      <p className="text-[12px] text-charcoal/60 font-light tracking-wide">{resolvedProduct.dimensions}</p>
                    </div>
                  )}
                  {resolvedProduct.technique && (
                    <div className="space-y-2">
                      <span className="text-[8px] uppercase tracking-[0.4em] text-gold/40 font-medium block">The Hand</span>
                      <p className="text-[12px] text-charcoal/60 font-light tracking-wide">{resolvedProduct.technique}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Interaction Area */}
              <div className="space-y-10 pt-4">
                {resolvedProduct.stock > 0 ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-10">
                      <span className="text-[9px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Quantity</span>
                      <div className="flex items-center border border-charcoal/5 bg-transparent rounded-full px-2">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-3 text-charcoal/40 hover:text-gold transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" strokeWidth={1} />
                        </button>
                        <span className="w-8 text-center text-[12px] font-light text-charcoal/80">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(Math.min(resolvedProduct.stock, quantity + 1))}
                          className="p-3 text-charcoal/40 hover:text-gold transition-colors disabled:opacity-20"
                          disabled={quantity >= resolvedProduct.stock}
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={1} />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleAddToCart}
                      className="w-full group relative overflow-hidden py-5 px-8 flex items-center justify-between bg-charcoal text-ivory text-[10px] uppercase tracking-[0.45em] transition-all duration-700 hover:bg-[#1a1a1a]"
                    >
                      <span>Acquire Piece</span>
                      <ArrowRight className="w-4 h-4 text-ivory/40 transition-transform duration-700 group-hover:translate-x-1 group-hover:text-gold" strokeWidth={1} />
                    </button>
                    
                    <p className="text-[8px] text-center uppercase tracking-[0.2em] text-charcoal/30">
                      Shipped with care from our atelier.
                    </p>
                  </div>
                ) : (
                  <div className="py-10 border-y border-charcoal/5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 italic leading-relaxed">
                      This creation has been whispered away.<br/>
                      <span className="text-[8px] opacity-60">Consult our atelier for bespoke inquiries.</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Curations */}
        {relatedProducts.length > 0 && (
          <div className="mt-40 md:mt-64 pt-20 border-t border-charcoal/[0.03]">
            <header className="flex justify-between items-end mb-16 md:mb-20">
              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-[0.5em] text-gold/60 font-light block">Explore more</span>
                <h3 className="text-2xl md:text-3xl font-serif font-light text-charcoal italic tracking-tight">Similar Sentiments</h3>
              </div>
              <Link 
                to="/all-pieces" 
                className="text-[9px] uppercase tracking-[0.4em] text-charcoal/40 hover:text-gold transition-all duration-700 pb-1 border-b border-charcoal/5"
              >
                The Full Collection
              </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {relatedProducts.map((relProduct, idx) => (
                <motion.div 
                  key={relProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 1 }}
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#F6F4F0] mb-6 relative">
                    <img 
                      src={relProduct.image} 
                      alt={relProduct.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-[13px] font-serif font-light text-charcoal/80 group-hover:text-charcoal transition-colors">{relProduct.name}</h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">BDT {relProduct.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Feedback Overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-2xl px-10 py-4 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-full flex items-center gap-4">
              <Check className="w-3.5 h-3.5 text-gold" strokeWidth={2} />
              <span className="text-[9px] uppercase tracking-[0.4em] text-charcoal font-medium">Added to acquisition list</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

