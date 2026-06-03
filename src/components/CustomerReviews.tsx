import React, { useState } from 'react';
import { Product, ProductReview } from '../types';
import { Star, MessageSquare, X, Filter, Sparkles, User, Calendar, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerReviewsProps {
  products: Product[];
  reviews: ProductReview[];
  onAddReview: (reviewData: { productId: string; userName: string; comment: string; rating: number }) => Promise<void>;
  isOffline: boolean;
}

export default function CustomerReviews({
  products,
  reviews,
  onAddReview,
  isOffline
}: CustomerReviewsProps) {
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('All');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [formProductId, setFormProductId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated email from metadata
  const userEmail = 'sheksonzamani@gmail.com';

  // Compute stats
  const filteredReviews = reviews.filter(r => {
    const matchProduct = selectedProductFilter === 'All' || r.productId === selectedProductFilter;
    const matchRating = selectedRatingFilter === 'All' || r.rating.toString() === selectedRatingFilter;
    const matchSearch = r.comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProduct && matchRating && matchSearch;
  });

  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  // Count per star level for progress bars
  const statCounts = [0, 0, 0, 0, 0, 0]; // index 1 to 5
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      statCounts[r.rating]++;
    }
  });

  const handleOpenModal = (productId: string = '') => {
    setFormProductId(productId || (products[0]?.id || ''));
    setFormName('');
    setFormRating(5);
    setFormComment('');
    setError(null);
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId) {
      setError('Please select a produce item.');
      return;
    }
    if (!formName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!formComment.trim()) {
      setError('Please provide written feedback commentary.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddReview({
        productId: formProductId,
        userName: formName,
        rating: formRating,
        comment: formComment
      });
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="customer-reviews-section" className="space-y-6">
      
      {/* Upper Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        
        {/* Core Appraisal Score card */}
        <div className="flex flex-col justify-center items-center p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 text-center">
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Verified Crop Appraisals</span>
          <div className="text-5xl font-extrabold text-slate-855 dark:text-white font-display mb-2">{avgRating}</div>
          
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= Math.round(Number(avgRating));
              return (
                <Star
                  key={star}
                  className={`w-5 h-5 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`}
                />
              );
            })}
          </div>
          <span className="text-xs text-slate-500 font-medium">Average across {totalReviewsCount} live reviews</span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="space-y-2.5 p-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Appraisal Distribution</span>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = statCounts[stars];
            const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic call to action card */}
        <div className="flex flex-col justify-between p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-emerald-950/20">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Shopper Voice</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Have you tasted our plateau harvests? Put down your true culinary experience to support organic farmers of Vom, Miango, and Shere Hills.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-600/10 transition-all font-display"
          >
            <Plus className="w-3.5 h-3.5" /> Write Produce Review
          </button>
        </div>

      </div>

      {/* Control Filtering Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-805">
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Produce selector filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Crop:</span>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="text-xs font-bold py-1.5 pl-2 pr-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white"
            >
              <option value="All">All Produce Items</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.id.replace('prod-', '#')} {p.name}</option>
              ))}
            </select>
          </div>

          {/* Rating filter selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Stars:</span>
            <select
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
              className="text-xs font-bold py-1.5 pl-2 pr-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>
        </div>

        {/* Feedback Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>

      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850/50 rounded-2xl">
          <span className="text-3xl">🥦</span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 font-display">No feedback matching query</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Try adjusting your crop filters, rating thresholds, or write a fresh appraisal!
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev) => {
              const product = products.find(p => p.id === rev.productId);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-805 shadow-sm space-y-3 relative text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {rev.userName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {rev.userEmail}
                      </p>
                    </div>

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-slate-100 dark:text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-350 italic leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850/50 text-[10px] text-slate-400 font-semibold font-mono">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450 uppercase">
                      {product?.image || '🥬'} {product?.name || 'Produce Item'}
                    </span>
                    <span className="flex items-center gap-1 font-normal text-slate-400 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 text-left relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-black text-slate-850 dark:text-white font-display">
                  Appraise Organic Crop
                </h3>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Appraisals help other local customers understand the organic taste and freshness of Jos Plateau crops, sourced direct to Vom & Miango.
              </p>

              {isOffline && (
                <div className="mb-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-955/20 text-amber-800 dark:text-amber-405 text-xs p-3 rounded-xl flex items-start gap-2">
                  <span>🛰️</span>
                  <p className="leading-snug">
                    You are in <strong>Offline Local Shunt</strong>mode. The feedback will queue locally on this device and synchronize once your mesh network re-establishes connectivity.
                  </p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Select produce item */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Select Produce Crop
                  </label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.image} {p.name} ({p.origin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating selection stars */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Your Rating Appraisal
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= formRating 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-slate-200 dark:text-slate-800'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Kuru"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Authenticated email placeholder */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Verified Customer Email
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/50 text-[11px] font-mono text-slate-500 py-2.5 px-3 rounded-lg flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {userEmail} <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Authenticated</span>
                  </div>
                </div>

                {/* Comment box */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Written Feedback & Commentary
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="How was the crop packaging, freshness index, and taste texture?"
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-white placeholder-slate-400 leading-normal"
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 border border-red-200/50 p-2 rounded-lg">
                    ⚠️ {error}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg hover:shadow-emerald-600/10 transition-all font-display"
                  >
                    {isSubmitting ? 'Posting Appraisal Coherence...' : 'Submit Appraisal'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
