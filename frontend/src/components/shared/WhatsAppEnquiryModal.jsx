import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  Download,
  CheckCheck,
  Copy,
  Check,
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  buildProductWhatsAppMessage,
  buildWhatsAppUrl,
  copyProductImageToClipboard,
  downloadProductImage,
  getProductPricing,
  validateAndNormalizeWhatsAppNumber,
  toAbsoluteUrl,
  openDirectWhatsAppEnquiry,
} from '../../utils/whatsapp';

export default function WhatsAppEnquiryModal({
  isOpen,
  onClose,
  product,
  settings,
  selectedSize,
  selectedColor,
  qty = 1,
  currentImage,
  tracker,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('3:47 PM');

  useEffect(() => {
    try {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    } catch {
      setCurrentTimeStr('3:47 PM');
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // 1. Validate WhatsApp Number dynamically from Website Settings
  const rawPhone = settings?.purchaseWhatsApp || settings?.whatsappNumber || settings?.generalPhone;
  const phoneValidation = validateAndNormalizeWhatsAppNumber(rawPhone);

  // 2. Validate Product Pricing (Single Source of Truth)
  const pricing = getProductPricing(product);

  const rawImg = currentImage || product.images?.[0] || product.image || '/images/vmd_cricket_jersey.jpg';
  const imgUrl = (typeof rawImg === 'string' ? rawImg : rawImg?.url) || '/images/vmd_cricket_jersey.jpg';
  const absImgUrl = toAbsoluteUrl(imgUrl);
  const productUrl = product.slug ? toAbsoluteUrl(`/merchandise/${product.slug}`) : '';

  const extras = {
    selectedSize,
    selectedColor,
    qty,
    image: imgUrl,
  };

  let messageText = '';
  try {
    messageText = buildProductWhatsAppMessage(product, extras);
  } catch (err) {
    messageText = `Hello VMD Sports!\n\nI would like to enquire about this product.\n\nProduct: ${product?.name || 'VMD Product'}\n\nPlease share availability and further details.`;
  }

  // Action: Open direct WhatsApp chat with configured VMD number (Zero share panel, Zero contact picker)
  const handleOpenWhatsAppChat = async () => {
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    if (!pricing.isValid) {
      toast.error(pricing.error);
      return;
    }

    setSubmitting(true);
    try {
      await openDirectWhatsAppEnquiry({
        product,
        settings,
        extras,
        tracker,
        onError: (err) => toast.error(err),
      });

      toast.success(`Opening WhatsApp chat with VMD Sports (${phoneValidation.formatted})...`);
      onClose();
    } catch (err) {
      console.error('[WhatsApp Enquiry] Error opening chat:', err);
      toast.error('Could not open WhatsApp chat. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Copy message text
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedMsg(true);
      toast.success('Message text copied to clipboard!');
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      toast.error('Could not copy message text.');
    }
  };

  // Action: Download image
  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadProductImage(absImgUrl, product.slug || 'vmd-sports-product');
      toast.success('Product photo saved!');
    } catch {
      toast.error('Could not download image.');
    } finally {
      setDownloading(false);
    }
  };

  // Action: Copy image to clipboard
  const handleCopyImage = async () => {
    try {
      const res = await copyProductImageToClipboard(imgUrl);
      if (res.success) {
        setCopied(true);
        toast.success('Product photo copied! Paste (Ctrl+V) in WhatsApp.');
        setTimeout(() => setCopied(false), 2500);
      } else {
        toast.error('Clipboard copy not supported on this browser.');
      }
    } catch {
      toast.error('Could not copy image.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-sm sm:max-w-md bg-[#111B21] border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white my-auto flex flex-col font-sans"
        >
          {/* ─── 1. Phone Status Bar Mockup ─── */}
          <div className="bg-[#1F2C34] px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] text-[#8696A0] font-sans border-b border-white/5 select-none">
            <span className="font-semibold text-white/90">{currentTimeStr}</span>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-white/70 rounded-xs" />
                <span className="w-0.5 h-2 bg-white/70 rounded-xs" />
                <span className="w-0.5 h-2.5 bg-white/70 rounded-xs" />
                <span className="w-0.5 h-3 bg-white/70 rounded-xs" />
              </div>
              <div className="flex items-center gap-1 ml-1 text-[11px]">
                <div className="w-4 h-2.5 border border-white/70 rounded-xs p-0.5 flex items-center">
                  <div className="w-full h-full bg-white/90 rounded-2xs" />
                </div>
                <span>88%</span>
              </div>
            </div>
          </div>

          {/* ─── 2. WhatsApp App Header ─── */}
          <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center justify-between border-b border-white/10 select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 -ml-1 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Avatar circle */}
              <div className="relative w-10 h-10 rounded-full bg-black border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src="/images/vmd-logo.png"
                  alt="VMD Sports"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-display text-xs text-[#FF6B00] font-bold">VMD</span>
              </div>

              {/* Contact info */}
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-[#E9EDEF] tracking-tight">VMD Sports</h3>
                  <span className="w-4 h-4 rounded-full bg-[#00A884] flex items-center justify-center text-[10px] text-black font-extrabold">
                    ✓
                  </span>
                </div>
                <p className="text-[11px] text-[#8696A0]">
                  {phoneValidation.isValid ? phoneValidation.formatted : '+91 98194 83036'}
                </p>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-3 text-white/80">
              <Video size={18} className="cursor-pointer hover:text-white" />
              <Phone size={18} className="cursor-pointer hover:text-white" />
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* ─── Error Notification Banner if Phone or Price Invalid ─── */}
          {!phoneValidation.isValid && (
            <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center gap-2 text-red-300 text-xs font-sans">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{phoneValidation.error}</span>
            </div>
          )}

          {!pricing.isValid && (
            <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-amber-300 text-xs font-sans">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{pricing.error}</span>
            </div>
          )}

          {/* ─── 3. WhatsApp Chat Canvas (Doodle background) ─── */}
          <div className="p-3 sm:p-4 bg-[#0B141A] bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] max-h-[58vh] overflow-y-auto space-y-3">
            {/* "Today" Date Badge */}
            <div className="flex justify-center">
              <span className="bg-[#182229] text-[#8696A0] text-[11px] font-sans px-3 py-1 rounded-md shadow-sm border border-white/5 select-none">
                Today
              </span>
            </div>

            {/* ─── WhatsApp Outgoing Message Bubble (#005C4B) ─── */}
            <div className="ml-auto w-full max-w-[94%] bg-[#005C4B] rounded-2xl rounded-tr-xs overflow-hidden shadow-lg border border-black/20 text-[#E9EDEF]">
              {/* Product Image Frame */}
              <div className="relative aspect-[4/3] w-full bg-[#08221D] overflow-hidden select-none">
                <img
                  src={absImgUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/vmd_cricket_jersey.jpg';
                  }}
                />
                <span className="absolute bottom-2 left-2 text-[9px] font-sport uppercase tracking-wider bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-white/90 border border-white/10">
                  {product.category?.name || product.category || 'Official Sportswear'}
                </span>
              </div>

              {/* Message Details with Clickable Image & Page Links */}
              <div className="p-3 text-[13px] leading-relaxed select-text font-sans space-y-2">
                <p>Hello VMD Sports!</p>
                <p>I would like to enquire about this product.</p>

                <div className="pt-1 space-y-1 font-sans text-[13px]">
                  <p>
                    <span className="text-white/60">Product:</span>{' '}
                    <strong className="text-white font-bold">{product.name}</strong>
                  </p>
                  <p>
                    <span className="text-white/60">Price:</span>{' '}
                    <strong className="text-brand-lime font-mono font-bold">
                      {pricing.isValid ? pricing.formattedSellingPrice : '₹—'}
                    </strong>
                  </p>
                  {selectedSize && (
                    <p>
                      <span className="text-white/60">Size:</span> {selectedSize}
                    </p>
                  )}
                  {selectedColor && selectedColor !== 'Default' && (
                    <p>
                      <span className="text-white/60">Colour:</span> {selectedColor}
                    </p>
                  )}
                  {qty > 1 && (
                    <p>
                      <span className="text-white/60">Quantity:</span> {qty}
                    </p>
                  )}
                  {absImgUrl && (
                    <p className="break-all text-[11px] text-[#53BDEB]">
                      <span className="text-white/60">Product Image:</span>{' '}
                      <span className="underline">{absImgUrl}</span>
                    </p>
                  )}

                </div>

                <p className="pt-1">Please share availability and further details.</p>

                {/* Bubble Footer Time + Blue Double Checkmark */}
                <div className="pt-1 flex items-center justify-end gap-1 text-[11px] text-white/60 select-none">
                  <span>{currentTimeStr}</span>
                  <CheckCheck size={15} className="text-[#53BDEB]" />
                </div>
              </div>
            </div>

            {/* ─── WhatsApp Chat Input Bar Mockup ─── */}
            <div className="pt-2 flex items-center gap-2 select-none opacity-90">
              <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-2 flex items-center gap-2 text-[#8696A0] text-xs">
                <Smile size={18} className="text-[#8696A0]" />
                <span className="flex-1 text-[#8696A0]">Type a message</span>
                <Paperclip size={18} className="text-[#8696A0] rotate-45" />
                <Camera size={18} className="text-[#8696A0]" />
              </div>
              <div className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-md">
                <Send size={15} className="fill-current -ml-0.5" />
              </div>
            </div>
          </div>

          {/* ─── 4. Action Buttons ─── */}
          <div className="bg-[#1F2C34] p-3.5 border-t border-white/10 flex flex-col gap-2.5">
            {/* Primary Action: Direct WhatsApp Chat with +91 98194 83036 */}
            <button
              onClick={handleOpenWhatsAppChat}
              disabled={submitting || !phoneValidation.isValid || !pricing.isValid}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-black font-sport uppercase tracking-wider font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle size={18} className="fill-current" />
              <span>
                {submitting
                  ? 'Connecting to WhatsApp...'
                  : `WhatsApp Enquiry (${phoneValidation.isValid ? phoneValidation.formatted : '+91 98194 83036'})`}
              </span>
            </button>

            {/* Explanatory note */}
            <p className="text-[11px] text-[#8696A0] text-center font-sans">
              Opens direct WhatsApp conversation with <strong className="text-brand-lime font-mono">{phoneValidation.isValid ? phoneValidation.formatted : '+91 98194 83036'}</strong> with prefilled product details & clickable image link.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="py-2 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white text-[11px] font-sport uppercase tracking-wider font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Copy prefilled message text"
              >
                {copiedMsg ? <Check size={13} className="text-[#25D366]" /> : <Copy size={13} />}
                <span>{copiedMsg ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="py-2 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white text-[11px] font-sport uppercase tracking-wider font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Copy photo to clipboard"
              >
                {copied ? <Check size={13} className="text-[#25D366]" /> : <Copy size={13} />}
                <span>{copied ? 'Photo Copied!' : 'Copy Photo'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="py-2 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white text-[11px] font-sport uppercase tracking-wider font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                title="Download photo file"
              >
                <Download size={13} />
                <span>{downloading ? 'Saving...' : 'Save Photo'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
