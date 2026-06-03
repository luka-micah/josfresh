/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, InventoryAlert } from '../types';
import { ArrowUpRight, TrendingDown, RefreshCcw, Plus, Minus, AlertOctagon, HelpCircle, Save } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  alerts: InventoryAlert[];
  onReplenishStock: (id: string, overrideStock: number) => void;
  onResolveAlert: (alertId: string) => void;
  isOffline: boolean;
}

export default function InventoryManager({
  products,
  alerts,
  onReplenishStock,
  onResolveAlert,
  isOffline
}: InventoryManagerProps) {
  const [replenishId, setReplenishId] = useState<string | null>(null);
  const [customStock, setCustomStock] = useState<number>(50);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Grains', 'Dairy'];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const getStockStatus = (prod: Product) => {
    if (prod.stock === 0) return { text: 'Stockout', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' };
    if (prod.stock <= prod.minStockThreshold) return { text: 'Critical Low', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' };
    return { text: 'Healthy', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
  };

  const handleQuickAdd = (prodId: string, current: number, amount: number) => {
    onReplenishStock(prodId, current + amount);
  };

  const handleCustomSubmit = (prodId: string) => {
    onReplenishStock(prodId, customStock);
    setReplenishId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Real-Time Inventory Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modify warehouse stocks, adjust safety thresholds, and keep harvest ledger balanced.
          </p>
        </div>

        {/* Offline notice */}
        {isOffline && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">Offline Queue Enabled</span>
          </div>
        )}
      </div>

      {/* Grid: 2 columns Alerts & Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Inventory Alerts Column (1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Urgent Alerts Feed</span>
              <span className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] lowercase font-normal">
                {alerts.filter(a => !a.resolved).length} active
              </span>
            </h3>

            {alerts.filter(a => !a.resolved).length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-550 text-xs flex flex-col items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-emerald-500" />
                No active stockout alerts. All fresh crop safety margins are well-balanced!
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {alerts.filter(a => !a.resolved).map(alert => {
                  const isSevere = alert.type === 'urgent_stockout';
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        isSevere
                          ? 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-955/10'
                          : 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-955/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isSevere ? 'text-red-700 dark:text-red-400' : 'text-amber-750 dark:text-amber-400'}`}>
                            {isSevere ? '🚨 Critical Stockout' : '⚠️ Low Threshold alert'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-normal mt-1">
                          {alert.message}
                        </p>
                      </div>

                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className={`mt-2.5 self-end py-1 px-2 text-[10px] font-bold rounded-md border text-center transition-all ${
                          isSevere
                            ? 'bg-red-650 text-white border-red-600 hover:bg-red-700'
                            : 'bg-slate-800 dark:bg-slate-700 text-white border-slate-850 hover:bg-slate-900'
                        }`}
                      >
                        Acknowledge & Restock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Storage Coherency</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-emerald-400">92.4%</h4>
              <p className="text-[9px] text-slate-500">Logistics dispatch margin</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Catalog Operations Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm overflow-hidden flex flex-col">
            
            {/* Filter and Switchers */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Select Crop Category</span>
              <div className="flex gap-1 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-1 px-2.5 text-xs font-medium rounded-md transition-all ${
                      activeCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Main scrollable stock ledger */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredProducts.map(prod => {
                const isReplenishing = replenishId === prod.id;
                const status = getStockStatus(prod);
                return (
                  <div
                    key={prod.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/65 dark:border-slate-850 rounded-xl hover:shadow-xs transition-all gap-3"
                  >
                    {/* Produce details */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-1 bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        {prod.image}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{prod.name}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          Category: {prod.category} • Origin: <strong>{prod.origin}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Stock counting status */}
                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-right flex flex-col">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Ledger Balance</span>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-baseline gap-1 mt-0.5">
                          <span>{prod.stock}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{prod.unit}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 italic">Threshold: {prod.minStockThreshold} {prod.unit}</span>
                      </div>

                      {/* Control Panel buttons */}
                      {isReplenishing ? (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                          <input
                            type="number"
                            min="0"
                            value={customStock}
                            onChange={(e) => setCustomStock(parseInt(e.target.value) || 0)}
                            className="w-14 text-xs font-mono font-bold p-1 border border-slate-200 dark:border-slate-850 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleCustomSubmit(prod.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1 px-2.5 rounded shadow flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => setReplenishId(null)}
                            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickAdd(prod.id, prod.stock, 10)}
                            className="text-[10px] bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-1 px-1.5 border border-slate-200 dark:border-slate-800 rounded flex items-center"
                            title="Add 10 instantly"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickAdd(prod.id, prod.stock, 50)}
                            className="text-[10px] bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-1 px-1.5 border border-slate-200 dark:border-slate-800 rounded flex items-center"
                            title="Add 50 instantly"
                          >
                            +50
                          </button>
                          <button
                            onClick={() => {
                              setReplenishId(prod.id);
                              setCustomStock(prod.stock);
                            }}
                            className="text-[10px] bg-emerald-600 text-white font-semibold py-1.5 px-2 rounded-md hover:bg-emerald-700 transition"
                          >
                            Custom
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
