import React from 'react';
import { Product, CartItem } from '../types';
import { X, Heart, ShoppingBag, Trash2, MapPin, Mail, Shield, User, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  cart: CartItem[];
  isOffline: boolean;
  onSync: () => void;
  syncQueueLength: number;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  cart,
  isOffline,
  onSync,
  syncQueueLength
}: UserProfileModalProps) {
  // Resolve wishlist products
  const savedProducts = products.filter(p => wishlist.includes(p.id));

  const userEmail = 'sheksonzamani@gmail.com';
  const userName = 'Shekson Zamani';
  const userRole = 'Customer Tier I (VVIP Verified)';
  const location = 'Rayfield District, Jos, Plateau State';
  const memberSince = 'Joined Sept 2024';

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="user-profile-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left relative flex flex-col md:flex-row min-h-[460px]"
          >
            {/* Close Button shortcut */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left sidebar info sheet: Personal Card */}
            <div className="w-full md:w-5/12 bg-slate-50 dark:bg-slate-955 p-6 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-805 flex flex-col justify-between">
              <div className="space-y-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                  Customer Profile
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 dark:bg-emerald-500 font-black text-white text-lg flex items-center justify-center shadow-md">
                    SZ
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white font-display">
                      {userName}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-450 uppercase tracking-tight block">
                      {userRole}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] truncate">{userEmail}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{location}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-emerald-600/60" />
                    <span>{memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Shunt Connectivity block */}
              <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-805 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Mesh Status</span>
                  {isOffline ? (
                    <span className="text-amber-600 dark:text-amber-450 font-bold flex items-center gap-1 text-[10px] uppercase font-mono">
                      🛰️ Offline Shunt
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[10px] uppercase font-mono animate-pulse">
                      ● Active Coherence
                    </span>
                  )}
                </div>

                {isOffline && syncQueueLength > 0 && (
                  <button
                    onClick={onSync}
                    className="w-full flex items-center justify-center gap-1.5 p-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl shadow-xs transition"
                  >
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    Sync Coherence Queue ({syncQueueLength})
                  </button>
                )}

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Basket Content</span>
                    <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Sheet: Dedicated Saved Items (Wishlist) */}
            <div className="flex-1 p-6 flex flex-col justify-between max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> Dedicated Saved Items
                  </h4>
                  <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-450 font-bold font-mono text-[10px] px-2 py-0.5 rounded-full">
                    {savedProducts.length} crop{savedProducts.length !== 1 ? 's' : ''} saved
                  </span>
                </div>

                {savedProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-2.5">
                    <span className="text-3xl block">❤️</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
                      Your Wishlist is empty
                    </h5>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Tap the heart icon on any highland organic crop in the marketplace to make it a saved product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {savedProducts.map((prod) => {
                      const criticalLow = prod.stock <= prod.minStockThreshold;
                      const stockout = prod.stock === 0;

                      return (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-855 rounded-xl justify-between hover:bg-slate-50 dark:hover:bg-slate-950 transition-all text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative shadow-2xs shrink-0">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl leading-none">{prod.image}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-850 dark:text-white truncate">
                                {prod.name}
                              </h5>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-emerald-650 dark:text-emerald-400 font-bold font-mono">
                                  ₦{prod.price.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-slate-400">/ {prod.unit}</span>
                                {stockout ? (
                                  <span className="text-[8px] bg-red-100/60 text-red-700 px-1.5 rounded-full font-bold">
                                    Sold Out
                                  </span>
                                ) : criticalLow ? (
                                  <span className="text-[8px] bg-amber-100/60 text-amber-700 px-1.5 rounded-full font-bold">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="text-[8px] bg-emerald-50 text-emerald-650 px-1.5 rounded-full font-bold">
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Add to Basket button */}
                            <button
                              onClick={() => {
                                onAddToCart(prod);
                              }}
                              disabled={stockout}
                              className={`p-1.5 px-3 font-bold rounded-lg text-[10px] flex items-center gap-1 transition ${
                                stockout 
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-3xs'
                              }`}
                              title={stockout ? 'Harvest stock empty' : 'Quick buy crop'}
                            >
                              <ShoppingBag className="w-3 h-3" /> Insert
                            </button>

                            {/* Remove button */}
                            <button
                              onClick={() => onToggleWishlist(prod.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 dark:border-slate-800 dark:hover:border-red-950 text-slate-400 hover:text-red-500 hover:bg-red-50/20 transition-colors"
                              title="Delete fromSaved Items"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick modal close confirmation foot */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-6 text-right">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                >
                  Return to Harvest
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
