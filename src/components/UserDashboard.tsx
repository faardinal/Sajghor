import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { LogOut, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard({ user }: any) {
  const { cart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/account');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-32 px-6 max-w-5xl mx-auto"
    >
      {/* HEADER */}
      <div className="border-b border-gold/10 pb-10 mb-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60">
          Atelier Member
        </p>

        <h1 className="text-3xl font-serif italic text-charcoal mt-4">
          {user.email}
        </h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        <div className="border border-gold/10 p-6 text-center">
          <p className="text-[9px] uppercase tracking-widest text-olive">
            Items
          </p>
          <p className="text-2xl font-serif text-charcoal mt-2">
            {totalItems}
          </p>
        </div>

        <div className="border border-gold/10 p-6 text-center">
          <p className="text-[9px] uppercase tracking-widest text-olive">
            Cart Value
          </p>
          <p className="text-2xl font-serif text-charcoal mt-2">
            BDT {totalPrice}
          </p>
        </div>

        <div className="border border-gold/10 p-6 text-center">
          <p className="text-[9px] uppercase tracking-widest text-olive">
            Status
          </p>
          <p className="text-sm font-light text-gold mt-2">
            Active
          </p>
        </div>
      </div>

      {/* CART PREVIEW */}
      <div className="mb-16">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-olive mb-6">
          Current Selection
        </h2>

        <div className="space-y-4">
          {cart.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-gold/5 pb-4"
            >
              <img
                src={item.image}
                className="w-12 h-12 object-cover grayscale"
              />

              <div className="flex-1">
                <p className="text-sm text-charcoal">{item.name}</p>
                <p className="text-[10px] text-olive">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="text-[11px] text-gold">
                BDT {item.price}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="mt-6 text-[10px] uppercase tracking-[0.3em] text-gold hover:opacity-70"
        >
          View full selection →
        </button>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center border-t border-gold/10 pt-10">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-charcoal hover:text-gold"
        >
          <ShoppingBag className="w-4 h-4" />
          Cart
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-red-400 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.div>
  );
}
