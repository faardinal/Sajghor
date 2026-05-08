import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { collections } from '../data/collections';
import { luxuryTransition, breathingVariants } from '../lib/motion';
import ProductGrid from '../components/ProductGrid';

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const collection = collections.find(c => c.id === id);

  if (!collection) return (
    <div className="min-h-screen pt-40 text-center">
      <p className="text-olive italic">Collection not found.</p>
      <button onClick={() => navigate('/collections')} className="btn-boutique mt-8">Back to Collections</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={luxuryTransition}
      className="min-h-screen bg-ivory pt-40 pb-32"
    >
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate('/collections')}
          className="flex items-center gap-2 group mb-16 text-[11px] uppercase tracking-[0.5em] text-olive hover:text-gold transition-colors duration-700"
        >
          <ChevronLeft className="w-5 h-5 transition-transform duration-700 group-hover:-translate-x-0.5" strokeWidth={1} />
          Back to Collections
        </button>

        <section className="text-center mb-10 space-y-8 px-6">
          <motion.span variants={breathingVariants} initial="hidden" animate="visible" className="text-[11px] uppercase tracking-[0.6em] text-gold font-light block">
            Archive • {collection.subtitle}
          </motion.span>
          <motion.h1 variants={breathingVariants} initial="hidden" animate="visible" className="text-5xl md:text-8xl font-serif font-light text-charcoal italic tracking-tight">
            {collection.name}
          </motion.h1>
          <motion.p variants={breathingVariants} initial="hidden" animate="visible" className="text-olive text-[16px] font-light leading-[1.8] max-w-2xl mx-auto italic opacity-80 pt-4">
            {collection.description}
          </motion.p>
        </section>

        {/* The products inside this collection */}
        <div className="-mt-10">
          <ProductGrid collectionId={collection.id} />
        </div>
      </div>
    </motion.div>
  );
}
