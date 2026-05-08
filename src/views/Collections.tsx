import { motion, Transition } from 'motion/react';
import { Link } from 'react-router-dom';
import { useBoutique } from '../context/BoutiqueContext';
import { luxuryTransition, breathingVariants, staggeredContainer } from '../lib/motion';

export default function Collections() {
  const { collections } = useBoutique();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={luxuryTransition}
      className="min-h-screen bg-ivory pt-40 pb-32"
    >
      {/* Intro Section */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-32">
        <motion.div
           initial="hidden"
           animate="visible"
           variants={staggeredContainer}
           className="space-y-8"
        >
          <motion.span variants={breathingVariants} className="text-[11px] uppercase tracking-[0.6em] text-gold font-light block">
            Heritage Archive
          </motion.span>
          <motion.h1 variants={breathingVariants} className="text-5xl md:text-7xl font-serif font-light text-charcoal italic tracking-tight">
            Curated Collections
          </motion.h1>
          <motion.div 
            variants={{
              hidden: { width: 0, opacity: 0 },
              visible: { width: 80, opacity: 0.3, transition: { duration: 2, delay: 0.5 } as Transition }
            }}
            className="h-px bg-gold mx-auto mt-8" 
          />
          <motion.p variants={breathingVariants} className="text-olive text-[16px] font-light leading-[1.8] max-w-xl mx-auto italic opacity-80 pt-4">
            "Curated expressions of tradition, craftsmanship, and timeless design."
          </motion.p>
        </motion.div>
      </section>

      {/* Collections Gallery */}
      <section className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggeredContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32"
        >
          {collections.map((collection) => (
            <Link key={collection.id} to={`/collection/${collection.id}`} className="group">
              <motion.div variants={breathingVariants} className="space-y-10">
                <div className="aspect-[16/10] overflow-hidden bg-[#F4F1ED] gold-thread-box relative group-hover:shadow-[0_20px_60px_-30px_rgba(197,160,89,0.12)] transition-shadow duration-[2s]">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-[3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[2s]" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[1.5s]">
                    <span className="text-[10px] uppercase tracking-[0.6em] text-ivory bg-charcoal/20 backdrop-blur-md px-10 py-4 border border-ivory/10">
                      View Archive
                    </span>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-serif font-light italic text-charcoal group-hover:text-gold transition-colors duration-[1.2s]">
                    {collection.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-light opacity-80">
                    {collection.subtitle}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}

          {/* All Collections / Complete Archive Option */}
          <Link to="/all-pieces" className="group">
            <motion.div variants={breathingVariants} className="space-y-10">
              <div className="aspect-[16/10] overflow-hidden bg-[#F4F1ED] gold-thread-box relative group-hover:shadow-[0_20px_60px_-30px_rgba(197,160,89,0.12)] transition-shadow duration-[2s]">
                <img 
                  src="https://i.pinimg.com/736x/1d/4f/f3/1d4ff3f105ff360402820382fd91db5c.jpg" 
                  alt="Complete Archive"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-[3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[2s]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[1.5s]">
                  <span className="text-[10px] uppercase tracking-[0.6em] text-ivory bg-charcoal/20 backdrop-blur-md px-10 py-4 border border-ivory/10">
                    Explore All
                  </span>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-serif font-light italic text-charcoal group-hover:text-gold transition-colors duration-[1.2s]">
                  Complete Archive
                </h3>
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-light opacity-80">
                  Every Handcrafted Piece
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
