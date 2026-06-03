/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Bell, ShieldAlert, CloudLightning, ShoppingBag, Layers, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'alert' | 'info' | 'system';
  title: string;
  body: string;
}

interface ToastNotificationBannerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastNotificationBanner({
  toasts,
  onDismiss
}: ToastNotificationBannerProps) {
  
  // Auto-dismiss toasts after 5 seconds to prevent drawer clutter
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => {
      onDismiss(latest.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const icons = {
          success: <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />,
          alert: <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />,
          info: <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          system: <CloudLightning className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        };

        const bgTypes = {
          success: 'bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500',
          alert: 'bg-white dark:bg-slate-900 border-l-4 border-l-red-500',
          info: 'bg-white dark:bg-slate-900 border-l-4 border-l-blue-500',
          system: 'bg-white dark:bg-slate-900 border-l-4 border-l-amber-500'
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-in relative ${bgTypes[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type]}
            </div>

            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Bell className="w-3" />
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal pr-5">
                {toast.body}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="absolute top-2.5 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
