/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, CheckCircle, Info, Sparkles, Building } from 'lucide-react';
import { CartItem } from '../types';

interface CardCreditCheckoutProps {
  cart: CartItem[];
  totalAmount: number;
  onSubmitPayment: (paymentMethod: 'card' | 'bank_transfer', deliveryAddress: string) => void;
  onClose: () => void;
  isOffline: boolean;
}

export default function CardCreditCheckout({
  cart,
  totalAmount,
  onSubmitPayment,
  onClose,
  isOffline
}: CardCreditCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!deliveryAddress.trim()) {
      setError('Please provide a delivery address.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 15) {
        setError('Please present a valid card number.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setError('Expiry format must be MM/YY.');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        setError('Card security verification CVC is too short.');
        return;
      }
    }

    setProcessing(true);

    // Dynamic processing delay simulation
    setTimeout(() => {
      setProcessing(false);
      if (isOffline) {
        // Safe offline queue
        onSubmitPayment(paymentMethod, deliveryAddress);
        setSuccess(true);
      } else {
        onSubmitPayment(paymentMethod, deliveryAddress);
        setSuccess(true);
      }
    }, 1800);
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full mx-auto text-center shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {isOffline ? 'Order Queued Offline!' : 'Payment Securely Authorized!'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
          {isOffline 
            ? 'Your device is currently offline. Order is locally registered. It will be submitted to JosFresh servers as soon as network returns.'
            : 'Merchant gateway processed transaction successfully. Your fresh farm produce order reference has been created.'}
        </p>
        <button
          onClick={onClose}
          className="mt-6 bg-slate-900 dark:bg-emerald-600 text-white font-medium text-xs py-2 px-6 rounded-lg hover:bg-emerald-700 transition"
        >
          Track My Box Now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-slate-50 dark:from-slate-950 dark:to-slate-900 p-5 border-b border-slate-100 dark:border-slate-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest font-mono">
              Secure Checkout Gateway
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
          Pay JosFresh Logistics
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs">
          <span className="text-slate-500">Order Due Amount</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">
            ₦{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Delivery Address Field */}
        <div className="text-left">
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Physical Delivery Point
          </label>
          <textarea
            required
            rows={2}
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="No. 12 Vom Road, Rayfield Estate, Jos North, Plateau State..."
            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
          />
        </div>

        {/* Picker for Card vs Bank Transfer */}
        <div className="text-left">
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Choose Payment Gateway
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                paymentMethod === 'card'
                  ? 'bg-slate-900 dark:bg-emerald-950 border-slate-900 dark:border-emerald-500 text-white dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Credit/Debit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                paymentMethod === 'bank_transfer'
                  ? 'bg-slate-900 dark:bg-emerald-950 border-slate-900 dark:border-emerald-500 text-white dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Core Bank Wire
            </button>
          </div>
        </div>

        {paymentMethod === 'card' ? (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/55 dark:border-slate-850 p-3 rounded-xl text-left">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500" /> Card Details
            </div>
            
            {/* Cardholder Name */}
            <div>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Name on Card"
                required={paymentMethod === 'card'}
                className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Card Number */}
            <div>
              <input
                type="text"
                maxLength={19}
                value={cardNumber}
                onChange={handleCardChange}
                placeholder="0000 0000 0000 0000"
                required={paymentMethod === 'card'}
                className="w-full text-xs p-2 font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Expiry & CVC */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                required={paymentMethod === 'card'}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full text-xs p-2 font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-450"
              />
              <input
                type="password"
                placeholder="CVC"
                maxLength={3}
                required={paymentMethod === 'card'}
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                className="w-full text-xs p-2 font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-450"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-emerald-50/40 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 p-3.5 rounded-xl text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">
              Transfer Routing Instructions
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Please route exact amount (<strong>₦{totalAmount.toFixed(2)}</strong>) to:
            </p>
            <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 space-y-0.5">
              <div>Bank: <strong>Plains Microfinance Co.</strong></div>
              <div>Acct Name: <strong>JosFresh Organic Dist.</strong></div>
              <div>Acct Number: <strong>1019-3829-0012</strong></div>
            </div>
            <p className="text-[9px] text-slate-400 italic">
              *Your order moves into processing once our automated webhook receives the settlement notification.
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

        <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono font-bold">PCI-DSS Secure</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-md transition disabled:bg-slate-400"
          >
            {processing ? 'Connecting SSL...' : 'Authorize Checkout'}
          </button>
        </div>
      </form>
    </div>
  );
}
