/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './views/Home';
import ProductDetail from './components/ProductDetail';
import Collections from './views/Collections';
import CollectionDetail from './views/CollectionDetail';
import AllProducts from './views/AllProducts';
import Cart from './views/Cart';
import Account from './views/Account';
import Admin from './views/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { BoutiqueProvider } from './context/BoutiqueContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion, Transition } from 'motion/react';
import { useEffect } from 'react';
import AmbientEnvironment from './components/AmbientEnvironment';

export default function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <BoutiqueProvider>
      <AuthProvider>
        <CartProvider>
        <AmbientEnvironment />
        <div className="min-h-screen">
          <Navbar />
          <main>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.22, 1, 0.36, 1] 
                } as Transition}
              >
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/all-pieces" element={<AllProducts />} />
                  <Route path="/collection/:id" element={<CollectionDetail />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
    </BoutiqueProvider>
  );
}
