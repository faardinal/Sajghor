import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart, CartItem } from '../context/CartContext';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen pt-48 px-12 max-w-7xl mx-auto text-center"
      >
        <h2 className="text-4xl font-serif italic text-charcoal mb-8">Your Selection</h2>
        <div className="border-t border-gold/10 py-32">
          <p className="text-olive font-light italic tracking-[0.2em] mb-12">
            Your collection is currently empty curious choices await.
          </p>
          <Link to="/">
            <button className="btn-boutique">Continue Exploring</button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-baseline mb-16 border-b border-gold/10 pb-8">
        <h2 className="text-4xl md:text-5xl font-serif italic text-charcoal">Your Selection</h2>
        <span className="text-[11px] uppercase tracking-[0.4em] text-olive opacity-60">({totalItems} items)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-12">
          <AnimatePresence mode="popLayout">
            {cart.map((item: CartItem) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-8 group"
              >
                <div className="w-32 h-40 bg-[#F4F1ED] overflow-hidden gold-thread-box flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700" />
                </div>
                
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-serif italic text-charcoal mb-2">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-olive hover:text-gold transition-colors"
                      >
                        <X className="w-4 h-4 stroke-[1px]" />
                      </button>
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-gold mb-4">BDT {item.price}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6 border border-gold/10 px-4 py-2 w-fit">
                      <Minus 
                        className="w-3 h-3 text-olive cursor-pointer hover:text-gold transition-colors" 
                        strokeWidth={1} 
                        onClick={() => updateQuantity(item.id, -1)}
                      />
                      <span className="text-xs font-light w-4 text-center">{item.quantity}</span>
                      <Plus 
                        className="w-3 h-3 text-olive cursor-pointer hover:text-gold transition-colors" 
                        strokeWidth={1} 
                        onClick={() => updateQuantity(item.id, 1)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-beige/30 p-10 border border-gold/10 space-y-8 sticky top-32">
            <h3 className="text-[11px] uppercase tracking-[0.5em] text-gold font-semibold text-center border-b border-gold/10 pb-6">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-olive">
                <span>Subtotal</span>
                <span>BDT {totalPrice}</span>
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-olive">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gold/20 flex justify-between items-baseline">
              <span className="text-lg font-serif italic text-charcoal">Total</span>
              <span className="text-xl font-serif text-charcoal">BDT {totalPrice}</span>
            </div>

            <button className="w-full btn-boutique !bg-charcoal !text-ivory border-none flex items-center justify-center gap-4 group">
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" strokeWidth={1} />
            </button>

            <p className="text-[9px] text-center text-olive tracking-widest italic opacity-60">
              Prices include all local atelier taxes.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
