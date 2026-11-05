import { useRef, useCallback } from 'react';
import { analyticsAPI } from '../services/api';

/**
 * useProductClickTracker
 *
 * Provides two tracking functions:
 *   - trackClick(product, eventType): records card_click or detail_view
 *   - trackWhatsappEnquiry(product): records a whatsapp_enquiry BEFORE opening WA
 *
 * Both are deduplicated per component lifecycle via a ref-based Set.
 * Both silently swallow errors to avoid disrupting the customer experience.
 */
export function useProductClickTracker() {
  const sentRef = useRef(new Set());

  // Returns true if product is a real DB product (not a default/fallback)
  const isRealProduct = (product) => {
    if (!product?._id) return false;
    if (typeof product._id === 'string' && product._id.startsWith('default-')) return false;
    return true;
  };

  /**
   * Track a product card click or detail page view.
   * eventType: 'card_click' | 'detail_view'
   */
  const trackClick = useCallback(async (product, eventType = 'card_click') => {
    if (!isRealProduct(product)) return;

    const key = `click::${product._id}::${eventType}`;
    if (sentRef.current.has(key)) return;
    sentRef.current.add(key);

    try {
      await analyticsAPI.trackClick({
        productId: product._id,
        eventType,
      });
    } catch (err) {
      // Log but don't disrupt UX
      console.debug('[Analytics] trackClick failed silently:', err?.response?.status);
    }
  }, []);

  /**
   * Track a WhatsApp enquiry.
   * Call this BEFORE window.open('https://wa.me/...').
   * Returns the enquiry ID on success (can be ignored).
   */
  const trackWhatsappEnquiry = useCallback(async (product) => {
    if (!isRealProduct(product)) return null;

    // Don't dedup enquiries — each button click should be tracked
    try {
      const res = await analyticsAPI.trackWhatsappEnquiry({
        productId: product._id,
      });
      return res.data?.enquiryId || null;
    } catch (err) {
      console.debug('[Analytics] trackWhatsappEnquiry failed silently:', err?.response?.status);
      return null;
    }
  }, []);

  return { trackClick, trackWhatsappEnquiry };
}
