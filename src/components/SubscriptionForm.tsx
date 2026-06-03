/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Layers, ShieldCheck, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Product, SubscriptionItem } from '../types';

interface SubscriptionFormProps {
  products: Product[];
  onCreateSubscription: (subscriptionData: {
    items: SubscriptionItem[];
    frequency: 'weekly' | 'biweekly';
    dayOfWeek: 'Monday' | 'Wednesday' | 'Friday' | 'Saturday';
    deliveryAddress: string;
    totalAmount: number;
  }) => void;
  onClose: () => void;
  isOffline: boolean;
}

export default function SubscriptionForm({
  products,
  onCreateSubscription,
  onClose,
  isOffline
}: SubscriptionFormProps) {
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Wednesday' | 'Friday' | 'Saturday'>('Saturday');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [error, setError] = useState('');

  // Filtering products that are healthy for subscription (large stock/vegetables/fruits)
  const availableProducts = products.filter(p => p.stock > 0);

  const handleAddItem = (productId: string) => {
    setError('');
    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev =>
      prev
        .map(item =>
          item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => {
      const prod = products.find(p => p.id === item.productId);
      return acc + (prod ? prod.price * item.quantity : 0);
    }, 0);
  };

  const handleRemoveItemCompletely = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError('Please add at least one fresh produce item to your subscribe box.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setError('Delivery address is required.');
      return;
    }

    const items: SubscriptionItem[] = selectedItems.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        productName: prod.name,
        quantity: item.quantity,
        priceAtSubscription: prod.price
      };
    });

    onCreateSubscription({
      items,
      frequency,
      dayOfWeek,
      deliveryAddress,
      totalAmount: calculateTotal()
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 max-w-2xl w-full mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-emerald-400 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            Build Your Grocery Subscription Box
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set up fresh organic farm harvests delivered straight to your door at custom intervals.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Frequency & Delivery Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Delivery Frequencies
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`py-2 px-3 text-sm rounded-lg border text-center font-medium transition-all ${
                  frequency === 'weekly'
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-705 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Every Week
              </button>
              <button
                type="button"
                onClick={() => setFrequency('biweekly')}
                className={`py-2 px-3 text-sm rounded-lg border text-center font-medium transition-all ${
                  frequency === 'biweekly'
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-705 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Every Two Weeks
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Preferred Delivery Day
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(['Monday', 'Wednesday', 'Friday', 'Saturday'] as const).map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDayOfWeek(day)}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-md border transition-all ${
                    dayOfWeek === day
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Fresh Produce Bundler */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Bundle Fresh Produce Harvest
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950">
            {/* Left: Product Selector */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] text-slate-400 block font-semibold mb-1">Crops Catalog</span>
              {availableProducts.map(prod => {
                const countInBox = selectedItems.find(i => i.productId === prod.id)?.quantity || 0;
                return (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{prod.image}</span>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{prod.name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          ₦{prod.price.toFixed(2)} / {prod.unit} • {prod.origin}
                        </span>
                      </div>
                    </div>
                    {countInBox > 0 ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(prod.id)}
                          className="text-emerald-700 dark:text-emerald-300 font-bold text-xs w-4 h-4 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">{countInBox}</span>
                        <button
                          type="button"
                          onClick={() => handleAddItem(prod.id)}
                          className="text-emerald-700 dark:text-emerald-300 font-bold text-xs w-4 h-4 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded flex items-center justify-center"
                          disabled={countInBox >= prod.stock}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddItem(prod.id)}
                        className="text-[10px] bg-slate-900 dark:bg-emerald-600 text-white font-medium py-1 px-2.5 rounded-md hover:bg-emerald-700 transition-[#000] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Box Summary */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3 flex flex-col justify-between max-h-56">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold mb-2">My Box Items</span>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-1.5 font-sans">
                    <ShoppingBag className="w-5 h-5 text-slate-350 dark:text-slate-655" />
                    No items bundled yet. Click products left to build your subscription box.
                  </div>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
                    {selectedItems.map(item => {
                      const prod = products.find(p => p.id === item.productId)!;
                      return (
                        <div key={item.productId} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                          <span className="truncate text-slate-800 dark:text-slate-200 font-medium max-w-[120px]">
                            {prod.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                              {item.quantity} x ₦{prod.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemCompletely(item.productId)}
                              className="text-red-500 hover:text-red-700"
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

              {selectedItems.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Box Total</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₦{calculateTotal().toFixed(2)} <span className="text-[9px] text-slate-400 font-normal">/{frequency === 'weekly' ? 'wk' : '2wk'}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Address & Checkout Integration Info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Fulfillment Address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Provide complete residential street name, estate, house number in Rayfield, Vom, or Greater Jos Plateau..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              rows={2}
            />
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-3 rounded-lg flex gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Secure Pre-authorized Billing:</strong> No immediate charge is made today. Your card or bank billing token is pre-associated with the box. Charges occur 24 hours prior to our localized morning dispatch routine every {dayOfWeek}.
            </p>
          </div>
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center bg-slate-50 dark:bg-slate-950 -mx-6 -mb-6 p-6">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-mono">Future Deliveries schedule</span>
            <span className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">
              Every <strong>{frequency === 'weekly' ? 'week' : '2 weeks'}</strong> on <strong>{dayOfWeek}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 text-white font-medium text-xs px-5 py-2 rounded-lg shadow hover:bg-emerald-700 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              {isOffline ? 'Queue Sub Offline' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
