import { motion } from 'motion/react';
import { luxuryTransition, breathingVariants, staggeredContainer } from '../lib/motion';
import ProductGrid from '../components/ProductGrid';

export default function AllProducts() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={luxuryTransition}
      className="min-h-screen bg-ivory pt-40 pb-32"
    >
      {/* Intro Section */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-16">
        <motion.div
           initial="hidden"
           animate="visible"
           variants={staggeredContainer}
           className="space-y-8"
        >
          <motion.span variants={breathingVariants} className="text-[11px] uppercase tracking-[0.6em] text-gold font-light block">
            Complete Archive
          </motion.span>
          <motion.h1 variants={breathingVariants} className="text-5xl md:text-7xl font-serif font-light text-charcoal italic tracking-tight">
            Every Handcrafted Piece
          </motion.h1>
          <motion.p variants={breathingVariants} className="text-olive text-[16px] font-light leading-[1.8] max-w-xl mx-auto italic opacity-80 pt-4">
            "A comprehensive gathering of our heritage craft, from seasonal weaves to rare artisan limited editions."
          </motion.p>
        </motion.div>
      </section>

      {/* Global Product Grid */}
      <div className="max-w-7xl mx-auto">
        <ProductGrid hideTitle />
      </div>
    </motion.div>
  );
}
