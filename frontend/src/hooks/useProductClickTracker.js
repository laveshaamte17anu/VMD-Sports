import { useRef, useCallback } from 'react';
import { analyticsAPI } from '../services/api';
import { getProductPricing } from '../utils/whatsapp';

/**
 * useProductClickTracker
 *
 * Provides two tracking functions:
 *   - trackClick(product, eventType): records card_click or detail_view
 *   - trackWhatsappEnquiry(product, extras): records a whatsapp_enquiry BEFORE opening WA
 *
 * Both silently swallow errors to avoid disrupting the customer experience.
 * Avoids duplicate records from a single double-click.
 */
export function useProductClickTracker() {
  const clickSentRef = useRef(new Set());
  const enquirySentRef = useRef(new Map());

  // Returns true if product has an ObjectId
  const isObjectId = (id) => {
    return Boolean(id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));
  };

  /**
   * Track a product card click or detail page view.
   * eventType: 'card_click' | 'detail_view'
   */
  const trackClick = useCallback(async (product, eventType = 'card_click') => {
    if (!product?._id || !isObjectId(product._id)) return;

    const key = `click::${product._id}::${eventType}`;
    if (clickSentRef.current.has(key)) return;
    clickSentRef.current.add(key);

    try {
      await analyticsAPI.trackClick({
        productId: product._id,
        eventType,
      });
    } catch (err) {
      console.debug('[Analytics] trackClick failed silently:', err?.response?.status);
    }
  }, []);

  /**
   * Track a WhatsApp enquiry.
   * Call this BEFORE window.open('https://wa.me/...').
   * Prevents rapid duplicate submissions within 4 seconds.
   * Returns the enquiry ID on success (or null).
   */
  const trackWhatsappEnquiry = useCallback(async (product, extras = {}) => {
    if (!product) return null;

    // Deduplication check: prevent multiple records from a rapid single click / double-click
    const dedupKey = `${product._id || product.slug}::${extras?.selectedSize || ''}::${extras?.selectedColor || ''}`;
    const now = Date.now();
    const lastSent = enquirySentRef.current.get(dedupKey);
    if (lastSent && now - lastSent < 4000) {
      return null;
    }
    enquirySentRef.current.set(dedupKey, now);

    try {
      const rawImg = extras?.image || product.images?.[0] || product.image;
      const imgUrl = (typeof rawImg === 'string' ? rawImg : rawImg?.url) || null;

      // Extract pricing using the single source of truth
      const pricing = getProductPricing(product);
      const mrp = pricing.mrp || Number(product.price || 0);
      const sellingPrice = pricing.hasDiscount ? pricing.sellingPrice : null;

      const payload = {
        productId: isObjectId(product._id) ? product._id : undefined,
        productName: product.name,
        productPrice: mrp,
        productDiscountPrice: sellingPrice,
        productImageUrl: imgUrl,
        productSlug: product.slug,
        productCategory: product.category?.name || product.category || null,
        selectedSize: extras?.selectedSize || null,
        selectedColor: extras?.selectedColor || null,
      };

      const res = await analyticsAPI.trackWhatsappEnquiry(payload);
      return res.data?.enquiryId || null;
    } catch (err) {
      console.debug('[Analytics] trackWhatsappEnquiry failed silently:', err?.response?.status);
      return null;
    }
  }, []);

  return { trackClick, trackWhatsappEnquiry };
}
