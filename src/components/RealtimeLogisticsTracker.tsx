/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, LogisticsLog } from '../types';
import { Truck, MapPin, CheckCircle2, Clock, Map, ChevronRight, RefreshCcw, Navigation } from 'lucide-react';

interface RealtimeLogisticsTrackerProps {
  orders: Order[];
  onUpdateLogistics: (orderId: string, status: string, location: string, description: string) => void;
  isOffline: boolean;
  isAdmin?: boolean;
}

export default function RealtimeLogisticsTracker({
  orders,
  onUpdateLogistics,
  isOffline,
  isAdmin = false
}: RealtimeLogisticsTrackerProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [customLocation, setCustomLocation] = useState('Rayfield Hub');
  const [customDesc, setCustomDesc] = useState('Package sorted & processed.');

  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const steps: { status: string; label: string }[] = [
    { status: 'Order Placed', label: 'Authorized' },
    { status: 'In Warehouse', label: 'In Packhouse' },
    { status: 'Packed', label: 'Quality QA Passed' },
    { status: 'Dispatched', label: 'Dispatched' },
    { status: 'In Transit', label: 'In Transit' },
    { status: 'Out for Delivery', label: 'Out for delivery' },
    { status: 'Delivered', label: 'Delivered Fresh' }
  ];

  const getStepStatusIndex = (timeline: LogisticsLog[]) => {
    if (timeline.length === 0) return 0;
    const currentStatus = timeline[timeline.length - 1].status;
    return steps.findIndex(s => s.status === currentStatus);
  };

  const handleSimulateStep = (nextStatus: string) => {
    if (!activeOrder) return;
    let loc = '';
    let description = '';

    if (nextStatus === 'In Warehouse') {
      loc = 'Jos Main Packhouse';
      description = 'Fresh bundle cooled & wrapped in secure boxes.';
    } else if (nextStatus === 'Packed') {
      loc = 'Jos Main Packhouse';
      description = 'Sanitary quality gate validated. Packed in climate-controlled shell.';
    } else if (nextStatus === 'Dispatched') {
      loc = 'Vom Road Center';
      description = 'Assigned to JosFresh courier dispatch unit.';
    } else if (nextStatus === 'In Transit') {
      loc = 'Anglo-Jos Expressway';
      description = 'Moving through Jos bypass toward regional destination.';
    } else if (nextStatus === 'Out for Delivery') {
      loc = 'Rayfield Estate Circle';
      description = 'Dispatched from delivery van. Rider is 10 minutes out.';
    } else if (nextStatus === 'Delivered') {
      loc = activeOrder.deliveryAddress;
      description = 'Left safely with receptionist/front doorstep. Enjoy your local harvest!';
    }

    onUpdateLogistics(activeOrder.id, nextStatus, loc || customLocation, description || customDesc);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400">
        <Truck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-xs">You do not have any active orders to track. Place an order from the marketplace or wait for a weekly delivery dispatch!</p>
      </div>
    );
  }

  const currentStepIndex = activeOrder ? getStepStatusIndex(activeOrder.shippingLogistics.timeline) : 0;
  const latestLog = activeOrder?.shippingLogistics.timeline[activeOrder.shippingLogistics.timeline.length - 1];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="w-5.5 h-5.5 text-emerald-500" />
          Fulfillment & Shipping Logistics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time GPS status, carrier timeline trackers, and delivery route milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left order picker */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Order History logs</span>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {orders.map(o => {
              const totalItemsCount = o.items.reduce((acc, i) => acc + i.quantity, 0);
              const isActive = o.id === selectedOrderId;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-slate-800/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {o.trackingNumber}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      o.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 animate-pulse'
                    }`}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mt-1">
                    <div>Items: <strong>{totalItemsCount} produce bundles</strong></div>
                    <div>Value: <strong>₦{o.totalAmount.toFixed(2)}</strong></div>
                    <div className="truncate text-[10px] text-slate-400">Box: {o.deliveryAddress}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active timeline (2/3 width) */}
        {activeOrder && (
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
              
              {/* Carrier details banner */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold">
                    🚍
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Assigned Logistics Partner</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {activeOrder.shippingLogistics.carrier}
                    </h4>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-5 flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Current Landmark Status</span>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-500" />
                    {latestLog?.status || 'Processing'} — {latestLog?.location || 'Central Depot'}
                  </p>
                </div>
              </div>

              {/* Graphical horizontal / vertical Stepper */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-4">Milestone Stepper</span>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                  {/* Backdrop connectors for desktop */}
                  <div className="hidden md:block absolute left-4 right-4 top-[15px] h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />

                  {steps.map((st, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div key={st.status} className="flex md:flex-col items-center gap-3 md:gap-1 text-left md:text-center w-full md:w-auto relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-mono text-xs font-bold z-10 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-100 dark:ring-emerald-950 scale-115' : ''}`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="flex flex-col md:items-center">
                          <span className={`text-[11px] font-bold block ${isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                            {st.label}
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono hidden md:inline">
                            {st.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed logs list */}
              <div className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Logistics Waypoint History</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeOrder.shippingLogistics.timeline.slice().reverse().map((log, lidx) => (
                    <div key={lidx} className="flex items-start gap-3 p-2 bg-slate-50/50 dark:bg-slate-950 rounded-lg text-left border border-slate-100 dark:border-slate-800">
                      <div className="w-5 h-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center font-mono text-[10px] text-emerald-650 dark:text-emerald-350">
                        {activeOrder.shippingLogistics.timeline.length - lidx}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{log.status}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{log.location}</div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">{log.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🧪 Simulator tool for testing delivery status */}
              {isAdmin && (
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 bg-emerald-50/30 dark:bg-slate-955/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-350">🧪 Field Dispatch Simulator</span>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] py-0.5 px-2 rounded-full font-bold">Rider interface</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-normal">
                    Simulate field dispatch courier riders updating delivery milestones in real-time. Use buttons below to change status.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {steps.map((st, sidx) => {
                      const alreadyPassed = sidx <= currentStepIndex;
                      const nextStep = sidx === currentStepIndex + 1;
                      return (
                        <button
                          key={st.status}
                          onClick={() => handleSimulateStep(st.status)}
                          disabled={alreadyPassed && st.status !== steps[currentStepIndex].status}
                          className={`py-1.5 px-3 rounded text-[10px] font-bold border transition ${
                            nextStep
                              ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                              : alreadyPassed
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-900 dark:border-slate-805'
                                : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {nextStep ? '▶ Move to: ' : ''}{st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
