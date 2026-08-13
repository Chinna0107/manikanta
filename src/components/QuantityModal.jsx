import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';

export function QuantityModal({ isOpen, onClose, onConfirm, productName }) {
  const [qty, setQty] = React.useState(1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (qty > 0) {
      onConfirm(qty);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-extrabold text-gray-900 mb-2 pr-8">
            Add to Cart
          </h3>
          <p className="text-sm text-gray-500 mb-6 line-clamp-2">
            Enter quantity for <span className="font-bold text-gray-700">{productName}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#D61A3C] hover:text-[#D61A3C] hover:bg-red-50 transition-all active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <input
                ref={inputRef}
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || '')}
                className="w-24 h-14 text-center text-2xl font-black text-gray-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#D61A3C] focus:ring-4 focus:ring-red-100 transition-all"
              />
              
              <button
                type="button"
                onClick={() => setQty(Number(qty) + 1)}
                className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#D61A3C] hover:text-[#D61A3C] hover:bg-red-50 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!qty || qty < 1}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-[#D61A3C] hover:bg-[#b81633] shadow-lg shadow-[#D61A3C]/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Confirm
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
