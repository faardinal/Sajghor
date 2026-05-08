import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useBoutique } from '../context/BoutiqueContext';
import { luxuryTransition, breathingVariants, staggeredContainer } from '../lib/motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      ...luxuryTransition,
      duration: 1.2
    }
  }
};

const ProductCard = memo(({ product }: { product: any }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        variants={itemVariants}
        className="group cursor-pointer perspective-1000"
      >
        <motion.div 
          className="aspect-[4/5] bg-[#FBFAF7] mb-8 overflow-hidden relative" 
          style={{ 
            willChange: "transform, filter",
            transform: 'translateZ(0)', // Force GPU
            backfaceVisibility: 'hidden'
          }}
          whileHover={{ 
            rotateX: 1, 
            rotateY: -1, 
            z: 5,
            y: -2,
            transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
          }}
        >
          <img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-[1.5s] ease-out ${product.stock === 0 ? 'opacity-40 grayscale' : 'opacity-100'}`}
            style={{ willChange: "transform" }}
          />
          
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40">
              <span className="text-[10px] uppercase tracking-[0.4em] text-charcoal font-light px-6 py-3 border border-charcoal/10 bg-white/80">
                Sold Out
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <span className="text-[9px] uppercase tracking-[0.4em] text-ivory bg-charcoal/40 backdrop-blur-md px-6 py-2.5 whitespace-nowrap font-light border border-white/10">
              Shop Now
            </span>
          </div>
        </motion.div>
        
        <div className="flex flex-col items-center text-center space-y-2">
          <h4 className="text-[12px] uppercase tracking-[2px] font-light text-charcoal group-hover:text-gold transition-colors duration-500">
            {product.name}
          </h4>
          <span className="text-[11px] font-sans font-light text-olive/60 tracking-[1px]">
             BDT {product.price}
          </span>
        </div>
      </motion.div>
    </Link>
  );
});

interface ProductGridProps {
  collectionId?: string;
  limit?: number;
  hideTitle?: boolean;
}

export default function ProductGrid({ collectionId, limit, hideTitle }: ProductGridProps) {
  const { products: allProducts, collections } = useBoutique();
  
  const displayProducts = React.useMemo(() => {
    let filtered = collectionId 
      ? allProducts.filter(p => p.collectionId === collectionId)
      : allProducts;
    
    return limit ? filtered.slice(0, limit) : filtered;
  }, [allProducts, collectionId, limit]);

  const collection = React.useMemo(() => 
    collectionId ? collections.find(c => c.id === collectionId) : null
  , [collections, collectionId]);

  return (
    <section className="max-w-[1200px] mx-auto px-6 pt-4 pb-24 md:pt-8 md:pb-40 bg-white">
      {!hideTitle && (
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggeredContainer}
          className="flex flex-col items-center mb-16 text-center"
        >
          <motion.h2 
            variants={itemVariants} // Using itemVariants for consistent soft load
            className="text-xl md:text-2xl font-serif font-light text-charcoal uppercase tracking-[0.4em] mb-6"
          >
            {collection ? collection.name : "Seasonal Collection"}
          </motion.h2>
          <motion.div 
            variants={{
              hidden: { width: 0, opacity: 0 },
              visible: { width: 40, opacity: 0.2, transition: { duration: 1.5, delay: 0.5 } }
            }}
            className="h-[0.5px] bg-charcoal" 
          />
        </motion.div>
      )}
      
      <motion.div 
        variants={staggeredContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
      >
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={breathingVariants}
        className="flex justify-center mt-32"
      >
        <Link 
          to="/collections" 
          className="group relative py-5 px-16 border border-charcoal/10 bg-transparent overflow-hidden transition-all duration-700"
        >
          <span className="relative z-10 text-[9px] uppercase tracking-[0.6em] text-charcoal font-light group-hover:text-gold transition-colors duration-500">
            View All Collections
          </span>
          <div className="absolute inset-0 bg-gold/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
        </Link>
      </motion.div>
    </section>
  );
}
