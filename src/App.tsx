/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Layers,
  Truck,
  Database,
  Grid,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  User,
  LogOut,
  RefreshCcw,
  Check,
  PackageCheck,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  TrendingUp,
  Package,
  Star,
  MessageSquare,
  Heart
} from 'lucide-react';
import { Product, Order, Subscription, InventoryAlert, BackupLog, ERPIntegrationLog, CartItem, OfflineAction, ProductReview } from './types';
import SubscriptionForm from './components/SubscriptionForm';
import CardCreditCheckout from './components/CardCreditCheckout';
import InventoryManager from './components/InventoryManager';
import RealtimeLogisticsTracker from './components/RealtimeLogisticsTracker';
import AdminAnalytics from './components/AdminAnalytics';
import ToastNotificationBanner, { ToastMessage } from './components/ToastNotificationBanner';
import CustomerReviews from './components/CustomerReviews';
import UserProfileModal from './components/UserProfileModal';

export default function App() {
  // --- Global Theme & Preferences ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('josfresh-theme') === 'dark';
  });
  const [viewMode, setViewMode] = useState<'shop' | 'dashboard'>('shop');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'subscriptions' | 'logistics' | 'inventory' | 'analytics' | 'logistics-dispatch' | 'reviews'>('marketplace');

  // --- Core State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [erpLogs, setErpLogs] = useState<ERPIntegrationLog[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // --- Offline Sync Queue state ---
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => {
    const saved = localStorage.getItem('josfresh-offline-queue');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Wishlist State ---
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('josfresh-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Client UX state ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Grains', 'Dairy'];

  // --- Push Notification Trigger ---
  const triggerPushNotice = (type: 'success' | 'alert' | 'info' | 'system', title: string, body: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, title, body }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Sync offline Queue with LocalStorage ---
  useEffect(() => {
    localStorage.setItem('josfresh-offline-queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // --- Sync wishlist with LocalStorage ---
  useEffect(() => {
    localStorage.setItem('josfresh-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // --- Dynamic Theme class compiler ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('josfresh-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('josfresh-theme', 'light');
    }
  }, [darkMode]);

  // --- API State Loader ---
  const loadStateFromServer = async () => {
    try {
      // Parallel API reading
      const [resProducts, resOrders, resSubs, resAlerts, resBackups, resErp, resReviews] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/subscriptions').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/backups').then(r => r.json()),
        fetch('/api/erp-logs').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json())
      ]);

      setProducts(resProducts);
      setOrders(resOrders);
      setSubscriptions(resSubs);
      setAlerts(resAlerts);
      setBackups(resBackups);
      setErpLogs(resErp);
      setReviews(resReviews);
    } catch (err) {
      console.warn('Backend not fully operational yet or compiling assets. Loading default seed layouts.', err);
    }
  };

  useEffect(() => {
    loadStateFromServer();
    // Poll updates every 6 seconds for live, multi-user feel (stock decreases, logistics milestones, incoming inventory alerts)
    const interval = setInterval(() => {
      if (!isOffline) {
        loadStateFromServer();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isOffline]);

  // --- Modern View Mode switcher helper ---
  const handleSwitchViewMode = (newMode: 'shop' | 'dashboard') => {
    setViewMode(newMode);
    if (newMode === 'dashboard') {
      setActiveTab('analytics');
      triggerPushNotice('system', 'Operations Dashboard Active', 'Accessing secure cloud management systems.');
    } else {
      setActiveTab('marketplace');
      triggerPushNotice('success', 'JosFresh Market Active', 'Browse high-altitude organic produce crops.');
    }
  };

  // --- Add/Adjust Marketplace Cart Items ---
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      triggerPushNotice('alert', 'Crop is Out of Stock!', `${product.name} is currently sold out. Restocking initiated.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          triggerPushNotice('alert', 'Exceeded Stock Tonnage', `Only ${product.stock} ${product.unit} of ${product.name} currently remains in warehouse limits.`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      triggerPushNotice('success', 'Fresh Crop Added', `${product.name} has been placed in your market basket.`);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleAdjustCartQuantity = (prodId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === prodId) {
            const nextQty = item.quantity + delta;
            // Check stock limits before allowing increment
            if (delta > 0 && nextQty > item.product.stock) {
              triggerPushNotice('alert', 'Capacity Warning', `Cannot add more. Crop warehouse stock is fully locked.`);
              return item;
            }
            return { ...item, quantity: Math.max(0, nextQty) };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  // --- Transaction checkouts handler ---
  const handleCheckoutPayment = async (paymentMethod: 'card' | 'bank_transfer', deliveryAddress: string) => {
    const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const checkoutItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      unit: item.product.unit
    }));

    if (isOffline) {
      // Queue offline order
      const offlineAction: OfflineAction = {
        id: `act-${Date.now()}`,
        type: 'CREATE_ORDER',
        payload: {
          items: checkoutItems,
          totalAmount,
          paymentMethod,
          deliveryAddress,
          email: 'sheksonzamani@gmail.com'
        },
        timestamp: new Date().toISOString()
      };

      setOfflineQueue(prev => [...prev, offlineAction]);
      
      // Update local client states to show direct results immediately
      setProducts(prev =>
        prev.map(p => {
          const bought = checkoutItems.find(item => item.productId === p.id);
          if (bought) {
            return { ...p, stock: Math.max(0, p.stock - bought.quantity) };
          }
          return p;
        })
      );

      // Generate simulated order timeline for client navigation
      const mockOrder: Order = {
        id: `ord-off-${Date.now()}`,
        userId: 'sheksonzamani@gmail.com',
        items: checkoutItems,
        totalAmount,
        status: 'pending',
        paymentStatus: 'paid',
        paymentMethod,
        trackingNumber: `JF-OFF-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingLogistics: {
          carrier: 'JosFresh Express',
          timeline: [
            { timestamp: new Date().toISOString(), status: 'Order Placed', location: 'Offline Queue Depot', description: 'Queued on user offline client device.' }
          ]
        },
        deliveryAddress,
        createdAt: new Date().toISOString(),
        isSubscriptionOrder: false
      };

      setOrders(prev => [mockOrder, ...prev]);
      setCart([]);
      setShowCheckout(false);
      triggerPushNotice('system', 'Offline Order Queued', 'Your grocery checkout was added to the local device sync sync pipeline.');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          totalAmount,
          paymentMethod,
          deliveryAddress,
          email: 'sheksonzamani@gmail.com'
        })
      });

      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('success', 'Order Placed Successfully!', `Your dispatch ticket ${resData.order.trackingNumber} is being cooled.`);
        setCart([]);
        setShowCheckout(false);
        loadStateFromServer();
      } else {
        triggerPushNotice('alert', 'Checkout Denied', resData.error || 'Check stock levels.');
      }
    } catch (err) {
      triggerPushNotice('alert', 'Connection disrupted', 'SSL Handshake with checkout server failed.');
    }
  };

  // --- Subscription Box Create handler ---
  const handleCreateSubscription = async (subscriptionData: any) => {
    if (isOffline) {
      const offlineAction: OfflineAction = {
        id: `act-${Date.now()}`,
        type: 'CREATE_SUBSCRIPTION',
        payload: {
          ...subscriptionData,
          email: 'sheksonzamani@gmail.com'
        },
        timestamp: new Date().toISOString()
      };
      setOfflineQueue(prev => [...prev, offlineAction]);

      // Add a simulated sub locally
      const mockSub: Subscription = {
        id: `sub-off-${Math.floor(100 + Math.random() * 900)}`,
        userId: 'sheksonzamani@gmail.com',
        frequency: subscriptionData.frequency,
        dayOfWeek: subscriptionData.dayOfWeek,
        items: subscriptionData.items,
        totalAmount: subscriptionData.totalAmount,
        status: 'active',
        nextDeliveryDate: subscriptionData.dayOfWeek === 'Saturday' ? '2026-06-06' : '2026-06-10',
        deliveryAddress: subscriptionData.deliveryAddress,
        createdAt: new Date().toISOString()
      };

      setSubscriptions(prev => [mockSub, ...prev]);
      setShowSubscriptionModal(false);
      triggerPushNotice('system', 'Subscription Created Offline', 'Grocery recurring box added to client sync schedule.');
      return;
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subscriptionData,
          email: 'sheksonzamani@gmail.com'
        })
      });

      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('success', 'Subscription Box Activated!', `Weekly grocery delivery set for every ${subscriptionData.dayOfWeek}.`);
        setShowSubscriptionModal(false);
        loadStateFromServer();
      }
    } catch (err) {
      triggerPushNotice('alert', 'Billing sync failure', 'Could not establish recurring scheduling.');
    }
  };

  const handleUpdateSubscriptionStatus = async (subId: string, status: 'active' | 'paused' | 'cancelled') => {
    if (isOffline) {
      triggerPushNotice('alert', 'Connectivity action blocked', 'Subscription revisions require secure handshake validation.');
      return;
    }

    try {
      const response = await fetch(`/api/subscriptions/${subId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('info', 'Subscription Updated', `Fulfillment recurring schedule adjusted to ${status}.`);
        loadStateFromServer();
      }
    } catch (err) {
      triggerPushNotice('alert', 'Error', 'Failed to communicate status update.');
    }
  };

  // --- Multi-user Replenishments (Warehouse Manager) ---
  const handleReplenishStock = async (prodId: string, newStockLevel: number) => {
    if (isOffline) {
      const offlineAction: OfflineAction = {
        id: `act-${Date.now()}`,
        type: 'UPDATE_STOCK',
        payload: { id: prodId, overrideStock: newStockLevel },
        timestamp: new Date().toISOString()
      };
      setOfflineQueue(prev => [...prev, offlineAction]);

      // update locally
      setProducts(prev =>
        prev.map(p => (p.id === prodId ? { ...p, stock: newStockLevel } : p))
      );
      triggerPushNotice('system', 'Stock Level Queued Offline', `Outbound stock adjust scheduled.`);
      return;
    }

    try {
      const response = await fetch('/api/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prodId, overrideStock: newStockLevel })
      });
      const res = await response.json();
      if (res.success) {
        const prodName = products.find(p => p.id === prodId)?.name || 'Produce';
        triggerPushNotice('success', 'Inventory Tonnage Updated', `${prodName} stock set to ${newStockLevel} units in active cache.`);
        loadStateFromServer();
      }
    } catch (err) {
      triggerPushNotice('alert', 'Update aborted', 'Disrupted connectivity with warehouse database.');
    }
  };

  // --- Live Logistics timeline Updater ---
  const handleUpdateLogistics = async (orderId: string, status: string, location: string, description: string) => {
    if (isOffline) {
      triggerPushNotice('alert', 'Dispatched Rider Unavailable', 'Field dispatch tools require internet access to sync GPS nodes.');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/logistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, location, description })
      });

      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('info', 'Logistics Node Update', `Order status progressed to: ${status}`);
        loadStateFromServer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    if (isOffline) {
      triggerPushNotice('alert', 'Action forbidden', 'Alert clearance requires cryptographic handshake.');
      return;
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('info', 'Alert Acknowledged', 'Disaster trigger handled. Stock re-adjustment initialized.');
        loadStateFromServer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Wishlist Interaction handler ---
  const handleToggleWishlist = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setWishlist(prev => {
      const isSaved = prev.includes(productId);
      if (isSaved) {
        triggerPushNotice('info', 'Removed from Wishlist', `${prod?.name || 'Item'} was removed from your Saved Items.`);
        return prev.filter(id => id !== productId);
      } else {
        triggerPushNotice('success', 'Saved for Later', `${prod?.name || 'Item'} is now saved in your Profile Saved Items.`);
        return [...prev, productId];
      }
    });
  };

  // --- Cloud Backup & Recovery Snapshots ---
  const handleTriggerBackup = async () => {
    try {
      const response = await fetch('/api/backups/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'Manual Admin UI' })
      });
      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('success', 'AWS Backup Dispatched', `Snapshot ${resData.backup.id} securely packed.`);
        loadStateFromServer();
      }
    } catch (err) {
      triggerPushNotice('alert', 'Backup connection aborted', 'Destination cloud cluster timed out.');
    }
  };

  const handleRestoreFromBackup = async () => {
    try {
      const response = await fetch('/api/backups/restore', { method: 'POST' });
      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('system', 'Automated Disaster Recovery Complete', resData.message);
        loadStateFromServer();
      }
    } catch (err) {
      triggerPushNotice('alert', 'Restore Failure', 'Local file block index not intact.');
    }
  };

  // --- ERP systems log auditer manual sync ---
  const handleManualERPSync = async (system: string) => {
    try {
      const response = await fetch('/api/erp-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system })
      });
      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('success', `${system} Ledger reconciled`, 'Sales voucher structures validated.');
        loadStateFromServer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Add Customer Appraisals and Reviews ---
  const handleAddReview = async (reviewData: { productId: string; userName: string; comment: string; rating: number }) => {
    const userEmail = 'sheksonzamani@gmail.com';
    const payload = {
      ...reviewData,
      userEmail
    };

    if (isOffline) {
      // Queue offline review
      const offlineAction: OfflineAction = {
        id: `act-${Date.now()}`,
        type: 'ADD_REVIEW',
        payload,
        timestamp: new Date().toISOString()
      };
      setOfflineQueue(prev => [...prev, offlineAction]);

      // Optimistically add to state
      const optReview: ProductReview = {
        id: `rev-opt-${Date.now()}`,
        productId: reviewData.productId,
        userName: reviewData.userName,
        userEmail,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date().toISOString()
      };
      setReviews(prev => [optReview, ...prev]);
      triggerPushNotice('system', 'Offline Appraisal Queued', 'Your feedback will compile locally and sync when internet access is restored.');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || 'Failed to submit review');
      }

      const resData = await response.json();
      if (resData.success) {
        setReviews(prev => [resData.review, ...prev]);
        triggerPushNotice('success', 'Appraisal Registered', `Your review for ${reviewData.productId.replace('prod-', '#')} has been recorded on our ledger.`);
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      triggerPushNotice('alert', 'Feedback submission failure', err?.message || 'Server did not acknowledge review records.');
      throw err;
    }
  };

  // --- Trigger Bulk Synchronization of Queue ---
  const handleSynchronizeQueue = async () => {
    if (offlineQueue.length === 0) {
      triggerPushNotice('info', 'Synchronization Clean', 'Local queue has zero pending transactions.');
      return;
    }

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: offlineQueue })
      });

      const resData = await response.json();
      if (resData.success) {
        triggerPushNotice('success', 'Coherence Sync Completed', `Ledger balanced. ${resData.syncCount} pending operations synchronized.`);
        setOfflineQueue([]);
        loadStateFromServer();
      }
    } catch (err) {
      triggerPushNotice('alert', 'Sync pipeline choked', 'Host server is temporarily inaccessible.');
    }
  };

  // filtered crops in Customer View
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className={`min-h-screen transition-all ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900'} flex flex-col font-sans`}>
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🥬</span>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                JosFresh
                <span className="text-[10px] font-mono font-medium tracking-normal text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                  FarmDirect
                </span>
              </h1>
              <p className="text-[9px] text-slate-400 font-medium">Plateau Organic E-Commerce</p>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-3">
            
            {/* Connection mode toggle (Online/Offline simulator) */}
            <button
              onClick={() => {
                setIsOffline(!isOffline);
                triggerPushNotice('system', !isOffline ? 'Network Mode: Offline Simulated' : 'Network Mode: Returning Live', !isOffline ? 'Storage transactions are locally queued.' : 'Waking active sockets.');
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isOffline
                  ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}
              title="Simulate terminal offline state"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Live Network</span>
                </>
              )}
            </button>

            {/* Offline sync badge trigger */}
            {offlineQueue.length > 0 && (
              <button
                onClick={handleSynchronizeQueue}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 animate-pulse"
                title={`${offlineQueue.length} pending updates`}
              >
                <RefreshCcw className="w-3.5 h-3.5 text-white" />
                <span>Sync Queue ({offlineQueue.length})</span>
              </button>
            )}

            {/* High-Level Modern Portal Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
              <button
                onClick={() => handleSwitchViewMode('shop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'shop'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                }`}
              >
                <span>🌍</span> Shop
              </button>
              <button
                onClick={() => handleSwitchViewMode('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-slate-800 dark:bg-slate-800 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                }`}
              >
                <span>⚡</span> Dashboard
              </button>
            </div>

            {/* Ergonomic Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-xl"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Card shopping basket trigger */}
            {viewMode === 'shop' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-900 border border-slate-800 dark:bg-emerald-600 text-white p-2 md:px-3 md:py-2 rounded-xl flex items-center gap-1.5 relative hover:opacity-90 transition-all font-display"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden md:inline font-bold text-xs">My Basket</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {cart.reduce((s, c) => s + c.quantity, 0)}
                  </span>
                )}
              </button>
            )}

            {/* Saved Items (Wishlist) heart triggers */}
            {viewMode === 'shop' && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="bg-white hover:bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-white p-2 md:px-3 md:py-2 rounded-xl flex items-center gap-1.5 relative hover:opacity-95 transition-all font-display"
                title="View Saved Items"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
                <span className="hidden md:inline font-bold text-xs">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {wishlist.length}
                  </span>
                )}
              </button>
            )}

            {/* Profile email */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800 text-left hover:opacity-85 transition-all"
            >
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">Signed in as</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">sheksonzamani@gmail.com</span>
              </div>
            </button>

          </div>

        </div>
        
        {/* Mobile quick portal switch bar */}
        <div className="sm:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-[11px] font-mono">
          <button
            onClick={() => handleSwitchViewMode('shop')}
            className={`font-semibold uppercase tracking-tight py-1 px-3 rounded-lg ${viewMode === 'shop' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
          >
            🥬 Live Shop
          </button>
          <button
            onClick={() => handleSwitchViewMode('dashboard')}
            className={`font-semibold uppercase tracking-tight py-1 px-3 rounded-lg ${viewMode === 'dashboard' ? 'bg-slate-850 dark:bg-slate-800 text-white font-bold' : 'text-slate-500'}`}
          >
            📊 Operations
          </button>
        </div>
      </header>

      {/* 2. Main Portal Workspace Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 text-left">
        
        {/* CUSTOMER PORTAL */}
        {viewMode === 'shop' && (
          <div className="space-y-8">
            
            {/* Interactive Tab switches */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-6">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'marketplace'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Fresh Produce Hub
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'subscriptions'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" /> Weekly Subscribers Box
              </button>
              <button
                onClick={() => setActiveTab('logistics')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'logistics'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Truck className="w-4 h-4" /> Live GPS Steppers
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Star className="w-4 h-4" /> Customer Appraisals
              </button>
            </div>

            {/* Sub-tab 1: Fresh Produce Marketplace */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                
                {/* Visual Banner */}
                <div className="relative overflow-hidden bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-2xl p-6 md:p-8 text-white flex flex-col justify-end min-h-[140px] text-left">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 to-slate-950/70 -z-10" />
                  <div className="absolute -right-4 -bottom-10 opacity-15 text-9xl">🌿</div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-emerald-600 text-white py-0.5 px-2 rounded-full self-start mb-2 tracking-widest">
                    Pure & Direct harvest
                  </span>
                  <h2 className="text-xl md:text-2xl font-black max-w-lg leading-tight text-white">
                    Jos Plateau Premium Climate Farm Harvests
                  </h2>
                  <p className="text-xs text-slate-300 dark:text-slate-400 mt-1 max-w-md">
                    Cultivated in highly enriched organic red soils, nourished by cool climate altitude rain breezes.
                  </p>
                </div>

                {/* Categories filtering bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                  <div className="flex gap-1.5 overflow-x-auto pr-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition ${
                          selectedCategory === cat
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    Catalog: Showing {filteredProducts.length} crop lines
                  </p>
                </div>

                {/* Fresh Produce Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => {
                    const criticalLow = prod.stock <= prod.minStockThreshold;
                    const stockout = prod.stock === 0;
                    return (
                      <div
                        key={prod.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                      >
                        {/* High quality product banner picture */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-5xl">
                              {prod.image}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                          
                          {/* Floating Emoji origin badge */}
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 pointer-events-none">
                            <span className="text-lg leading-none">{prod.image}</span>
                            <span className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 tracking-tight">
                              {prod.origin.split(' ')[0]}
                            </span>
                          </div>

                          {/* Floating Saved Items trigger */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleWishlist(prod.id);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs bg-white/85 hover:bg-white dark:bg-slate-900/85 dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-800/55 text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-xs z-10"
                            title={wishlist.includes(prod.id) ? "Remove from Saved Items" : "Save for Later"}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-colors ${
                                wishlist.includes(prod.id) 
                                  ? 'fill-rose-500 text-rose-500' 
                                  : 'text-slate-500 dark:text-slate-450'
                              }`}
                            />
                          </button>

                          {/* Floating stock out label */}
                          {stockout && (
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center pointer-events-none">
                              <span className="bg-red-650 text-white font-black uppercase text-[10px] tracking-widest py-1.5 px-4 rounded-xl shadow-md border border-red-500/30">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Upper card crop segment */}
                        <div className="p-4 space-y-3 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 py-0.5 px-1.5 rounded font-bold">
                                {prod.category}
                              </span>
                              {prod.organic && (
                                <span className="text-[9px] font-mono uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 py-0.5 px-1.5 rounded font-bold">
                                  100% Organic
                                </span>
                              )}
                            </div>

                            {/* Subtle stock indicator */}
                            {!stockout && (
                              criticalLow ? (
                                <span className="bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-450 text-[9px] font-bold py-0.5 px-2 rounded-full animate-pulse">
                                  Only {prod.stock} left!
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold font-mono">
                                  IN STOCK
                                </span>
                              )
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                              {prod.name}
                            </h3>
                            {(() => {
                              const productReviews = reviews.filter(r => r.productId === prod.id);
                              const reviewCount = productReviews.length;
                              const avgProdRating = reviewCount > 0
                                ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
                                : null;
                              
                              if (avgProdRating) {
                                return (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-3 h-3 ${
                                            star <= Math.round(Number(avgProdRating))
                                              ? 'fill-amber-400 text-amber-400'
                                              : 'text-slate-250 dark:text-slate-800'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                      {avgProdRating} ({reviewCount} {reviewCount === 1 ? 'appraisal' : 'appraisals'})
                                    </span>
                                  </div>
                                );
                              } else {
                                return (
                                  <button
                                    onClick={() => {
                                      setActiveTab('reviews');
                                      triggerPushNotice('info', `Taste Appraisal for ${prod.name}`, 'Click "Write Produce Review" to add your feed appraisal.');
                                    }}
                                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 mt-0.5"
                                  >
                                    ⭐ Be the first to appraise
                                  </button>
                                );
                              }
                            })()}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                              {prod.description}
                            </p>
                          </div>
                        </div>

                        {/* Lower Action & price metrics segment */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] text-slate-400 font-mono font-semibold uppercase">FARM GATE PRICE</span>
                            <span className="text-lg font-black text-emerald-650 dark:text-emerald-400">
                              ₦{prod.price.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">/ {prod.unit}</span>
                            </span>
                            <span className="text-[9px] text-slate-400 truncate">From: {prod.origin}</span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(prod)}
                            disabled={stockout}
                            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold shadow-sm transition ${
                              stockout
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1'
                            }`}
                          >
                            Add to Basket
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Weekly subscriptions list & Form activator */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                
                {/* Banner builder prompt */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-emerald-400">
                      Manage Grocery Delivery Subscriptions
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                      Automate your family nutrition setup with organic vegetables, citrus, grains, and wild forest honey shipped directly to your house every single week or bi-weekly. Change content bundles anytime free.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-lg shadow transition"
                  >
                    Build Custom Subscriber Box
                  </button>
                </div>

                {/* Subscriptions modal layer */}
                {showSubscriptionModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <SubscriptionForm
                      products={products}
                      onCreateSubscription={handleCreateSubscription}
                      onClose={() => setShowSubscriptionModal(false)}
                      isOffline={isOffline}
                    />
                  </div>
                )}

                {/* Subscriptions list */}
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">My Existing Subscriptions</h3>
                  {subscriptions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 max-w-md mx-auto">
                      <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-xs">No active recurring grocery subscriptions. Build a custom box from catalog items and schedule weekend morning delivery!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {subscriptions.map((sub) => {
                        const isPaused = sub.status === 'paused';
                        return (
                          <div
                            key={sub.id}
                            className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden p-5 shadow-sm text-left flex flex-col justify-between ${
                              isPaused ? 'border-slate-200 dark:border-slate-800 opacity-70' : 'border-emerald-500/40 shadow-emerald-50/10 dark:shadow-none'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono font-bold text-slate-500">Box ID: {sub.id}</span>
                                  {sub.id.includes('off') && (
                                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 text-[8px] py-0.5 px-2 rounded-full font-bold">Offline Queue Pending</span>
                                  )}
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  sub.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {sub.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Ships: <strong>Every {sub.frequency === 'weekly' ? 'Week' : '2 Weeks'}</strong> on <strong>{sub.dayOfWeek}s</strong></span>
                              </div>

                              {/* Box crop item listings */}
                              <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3 my-2 space-y-1.5">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Box Harvest contents</span>
                                {sub.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-700 dark:text-slate-300">{item.productName}</span>
                                    <span className="font-mono text-slate-500 text-[11px]">{item.quantity} units</span>
                                  </div>
                                ))}
                              </div>

                              <div className="text-xs text-slate-500">
                                <div>Destination: <strong>{sub.deliveryAddress}</strong></div>
                                <div className="mt-1">Next Delivery Date: <strong className="text-slate-850 dark:text-slate-200">{sub.nextDeliveryDate}</strong></div>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-4 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-mono">RECURRING RATE</span>
                                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-450">
                                  ₦{sub.totalAmount.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex gap-1.5">
                                {sub.status === 'active' ? (
                                  <button
                                    onClick={() => handleUpdateSubscriptionStatus(sub.id, 'paused')}
                                    className="text-[10px] bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 font-bold py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                                  >
                                    Pause Box
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateSubscriptionStatus(sub.id, 'active')}
                                    className="text-[10px] bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded-lg transition"
                                  >
                                    Resume Box
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateSubscriptionStatus(sub.id, 'cancelled')}
                                  className="text-[10px] text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 px-2 rounded-lg font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Sub-tab 3: Logistics orders tracking */}
            {activeTab === 'logistics' && (
              <RealtimeLogisticsTracker
                orders={orders}
                onUpdateLogistics={handleUpdateLogistics}
                isOffline={isOffline}
                isAdmin={false}
              />
            )}

            {/* Sub-tab 4: Customer reviews & feedback */}
            {activeTab === 'reviews' && (
              <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2 md:p-6 rounded-2xl border border-slate-200/50 dark:border-slate-805">
                <CustomerReviews
                  products={products}
                  reviews={reviews}
                  onAddReview={handleAddReview}
                  isOffline={isOffline}
                />
              </div>
            )}

          </div>
        )}

        {/* OPERATIONS EXECUTIVE DASHBOARD */}
        {viewMode === 'dashboard' && (
          <div className="space-y-8 animate-slide-in">
            
            {/* High-density operational sub-navigation tab list */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-6">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Operations Overview
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'inventory'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                }`}
              >
                <Package className="w-4 h-4" /> Warehouse Inventory
              </button>
              <button
                onClick={() => setActiveTab('logistics-dispatch')}
                className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'logistics-dispatch'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                }`}
              >
                <Truck className="w-4 h-4" /> Fleet Logistics Coordinator
              </button>
            </div>

            {/* Dashboard Sub-view Panels */}
            {activeTab === 'analytics' && (
              <AdminAnalytics
                products={products}
                orders={orders}
                subscriptions={subscriptions}
                backups={backups}
                erpLogs={erpLogs}
                onTriggerBackup={handleTriggerBackup}
                onRestoreFromBackup={handleRestoreFromBackup}
                onManualERPSync={handleManualERPSync}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryManager
                products={products}
                alerts={alerts}
                onReplenishStock={handleReplenishStock}
                onResolveAlert={handleResolveAlert}
                isOffline={isOffline}
              />
            )}

            {activeTab === 'logistics-dispatch' && (
              <RealtimeLogisticsTracker
                orders={orders}
                onUpdateLogistics={handleUpdateLogistics}
                isOffline={isOffline}
                isAdmin={true}
              />
            )}

          </div>
        )}

      </main>

      {/* 3. Floating Client-side Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative animate-slide-left p-6">
            
            {/* Drawer top */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" />
                  My Grocery Basket
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-650 dark:hover:text-emerald-450 py-1 px-2 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Items listing */}
              {cart.length === 0 ? (
                <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-3">
                  <span className="text-5xl">🧺</span>
                  <p className="text-xs">Your farm basket is empty. Browse high-altitude produce crops on the marketplace!</p>
                </div>
              ) : (
                <div className="space-y-3.5 overflow-y-auto max-h-[550px] pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative shadow-3xs shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl leading-none">{item.product.image}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.product.name}</h4>
                          <span className="text-[10px] text-slate-500 font-bold">
                            ₦{item.product.price.toFixed(2)} / {item.product.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                        <button
                          onClick={() => handleAdjustCartQuantity(item.product.id, -1)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded font-extrabold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-250 px-1">{item.quantity}</span>
                        <button
                          onClick={() => handleAdjustCartQuantity(item.product.id, 1)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded font-extrabold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions checkout card */}
            {cart.length > 0 && (
              <div className="border-t border-slate-150 dark:border-slate-800 pt-4 mt-4 text-left">
                <div className="flex items-center justify-between text-xs mb-3 font-semibold">
                  <span className="text-slate-500">Produce Basket Subtotal</span>
                  <span className="font-extrabold text-emerald-650 dark:text-emerald-450 text-lg">
                    ₦{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setShowCheckout(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg text-center tracking-wide block relative"
                  >
                    Proceed to Payment Gateway
                  </button>
                  <button
                    onClick={() => setCart([])}
                    className="text-[10px] text-slate-400 hover:text-red-500 text-center py-1 font-bold"
                  >
                    Clear Basket List
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. Secure Checkout modal layer container */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <CardCreditCheckout
            cart={cart}
            totalAmount={cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
            onSubmitPayment={handleCheckoutPayment}
            onClose={() => setShowCheckout(false)}
            isOffline={isOffline}
          />
        </div>
      )}

      {/* Footer credits info */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 transition mt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-left leading-normal font-medium text-slate-400">
            © 2026 <strong>JosFresh Logistics Ltd</strong>. Cultivated with high pride on mountain slopes of Jos Plateau, Nigeria.
          </p>
          <div className="flex gap-4 text-slate-500 text-[11px] font-mono">
            <div>ERP Link: <span className="font-bold text-emerald-650">Active</span></div>
            <div>Database snapshot: <span className="font-bold text-emerald-650">Secured</span></div>
          </div>
        </div>
      </footer>

      {/* User Profile and Saved Items Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        products={products}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        cart={cart}
        isOffline={isOffline}
        onSync={handleSynchronizeQueue}
        syncQueueLength={offlineQueue.length}
      />

      {/* 5. Client active Push Banner notification alerts feed */}
      <ToastNotificationBanner toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
