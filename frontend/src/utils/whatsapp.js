/**
 * VMD Sports – WhatsApp Enquiry Utilities
 *
 * MAIN REQUIREMENT:
 * Directly opens the WhatsApp chat with VMD Sports' configured number (919819483036)
 * using the direct WhatsApp URL format:
 *   https://wa.me/919819483036?text=...
 *
 * RULES:
 * 1. Remove navigator.share() and Windows Web Share API from primary WhatsApp enquiry button.
 * 2. Do NOT open the Windows Share panel.
 * 3. Do NOT show contact selection or recipient options.
 * 4. Always open the configured VMD Sports WhatsApp number directly.
 * 5. Prefill the existing enquiry caption with correct product name, selling price, selected size and colour.
 * 6. Include actual product image URL and product page URL as clickable links in the prefilled message.
 * 7. Do not change product pricing logic, database prices or existing correct selling price.
 * 8. Preserve all existing product selection and enquiry functionality.
 */

/**
 * Validates and normalizes any phone number into clean international format (digits only without +, -, spaces).
 * Returns { isValid, normalized, formatted, error }.
 *
 * For Indian numbers:
 * - 10 digits starting with 6, 7, 8, or 9 -> '91' + 10 digits (12 digits)
 * - 12 digits starting with '91' and 3rd digit is 6-9 -> 12 digits
 * - Leading 0 stripped (e.g. 09819483036 -> 919819483036)
 */
export function validateAndNormalizeWhatsAppNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'VMD Sports WhatsApp number is not configured in Website Settings. Please set it in Admin → Website Settings.',
    };
  }

  let digits = String(rawPhone).replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'VMD Sports WhatsApp number is empty. Please configure a valid number in Website Settings.',
    };
  }

  // Strip leading zero if provided (e.g. 09819483036 -> 9819483036)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // If 10 digits and starts with 6, 7, 8, 9 (standard Indian mobile numbers)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = `91${digits}`;
  }

  // Indian number validation: 12 digits starting with 91 followed by 6-9
  const isIndianMobile = digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.substring(2));
  // General international validation (E.164: 10 to 15 digits)
  const isInternational = digits.length >= 10 && digits.length <= 15;

  if (!isIndianMobile && !isInternational) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: `Configured WhatsApp number "${rawPhone}" is invalid. Please enter a valid 10-digit mobile number with or without country code.`,
    };
  }

  const formatted = digits.length === 12 && digits.startsWith('91')
    ? `+91 ${digits.substring(2, 7)} ${digits.substring(7)}`
    : `+${digits}`;

  return {
    isValid: true,
    normalized: digits,
    formatted,
    error: null,
  };
}

/**
 * Backward compatibility helper.
 */
export function cleanWhatsAppNumber(phone) {
  const result = validateAndNormalizeWhatsAppNumber(phone);
  return result.isValid ? result.normalized : '';
}

/**
 * Extracts and validates product pricing based on the single source of truth:
 * - price = Regular MRP (Required, > 0)
 * - discountPrice = Selling / Deal Price (Optional, must be < price)
 *
 * WhatsApp Caption Rule: Show ONLY ONE price (the final selling price).
 * Website Display Rule: Show selling price, and show MRP separately if discount exists.
 */
export function getProductPricing(product) {
  if (!product) {
    return {
      isValid: false,
      sellingPrice: 0,
      mrp: 0,
      hasDiscount: false,
      discountPercent: 0,
      formattedSellingPrice: '',
      formattedMRP: '',
      error: 'Product data is missing.',
    };
  }

  const rawMrp = Number(product.price ?? product.productPrice);
  const rawDiscount =
    product.discountPrice != null && product.discountPrice !== ''
      ? Number(product.discountPrice)
      : null;

  if (isNaN(rawMrp) || rawMrp <= 0) {
    return {
      isValid: false,
      sellingPrice: 0,
      mrp: 0,
      hasDiscount: false,
      discountPercent: 0,
      formattedSellingPrice: '',
      formattedMRP: '',
      error: `Product "${product.name || 'Selected item'}" does not have a valid price configured in the database.`,
    };
  }

  const hasDiscount = Boolean(
    rawDiscount != null && !isNaN(rawDiscount) && rawDiscount > 0 && rawDiscount < rawMrp
  );
  const sellingPrice = hasDiscount ? rawDiscount : rawMrp;
  const discountPercent = hasDiscount
    ? Math.round(((rawMrp - sellingPrice) / rawMrp) * 100)
    : 0;

  return {
    isValid: true,
    mrp: rawMrp,
    sellingPrice,
    hasDiscount,
    discountPercent,
    formattedSellingPrice: `₹${sellingPrice.toLocaleString('en-IN')}`,
    formattedMRP: `₹${rawMrp.toLocaleString('en-IN')}`,
    error: null,
  };
}

export const PRODUCTION_BASE_URL = 'https://vmd-sports.vercel.app';

/**
 * Converts any relative path or localhost URL into an absolute LIVE production URL:
 * https://vmd-sports.vercel.app/...
 * Never outputs localhost, 127.0.0.1, or a dev server origin.
 */
export function toAbsoluteUrl(path) {
  if (!path || typeof path !== 'string') return '';

  let clean = path.trim();

  // Strip any localhost or 127.0.0.1 origin including port
  clean = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');

  // If it's an external URL (e.g. Cloudinary, AWS S3), keep it
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // Ensure leading slash
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }

  return `${PRODUCTION_BASE_URL}${clean}`;
}

export const toProductionUrl = toAbsoluteUrl;

/**
 * Extracts primary image URL from product object as full absolute URL.
 */
export function getProductImageUrl(product) {
  if (!product) return '';
  const raw = product.images?.[0] || product.image || product.productImageUrl;
  if (!raw) return '';
  const url = typeof raw === 'string' ? raw : raw?.url || '';
  return toAbsoluteUrl(url);
}

/**
 * Constructs the exact WhatsApp pre-filled enquiry message:
 *
 * Hello VMD Sports!
 *
 * I would like to enquire about this product.
 *
 * Product: [Actual Product Name]
 * Price: [Actual Final Selling Price]
 * Size: [Selected Size]
 * Colour: [Selected Colour]
 *
 * Product Image: [Actual Image URL]
 *
 *
 * Please share availability and further details.
 *
 * RULES:
 * - Single selling price ONLY.
 * - NO MRP in caption.
 * - Actual product image URL and product page URL included as clickable links.
 */
export function buildProductWhatsAppMessage(product, extras = {}) {
  const pricing = getProductPricing(product);
  if (!pricing.isValid) {
    throw new Error(pricing.error);
  }

  const name = product?.name || product?.productName || 'VMD Sports Product';
  const size = extras.selectedSize;
  const colour = extras.selectedColor;
  const qty = extras.qty;

  // Resolve absolute product image URL
  const rawImg = extras.image || product?.images?.[0] || product?.image || product?.productImageUrl;
  const imgUrl = (typeof rawImg === 'string' ? rawImg : rawImg?.url) || '/images/vmd_cricket_jersey.jpg';
  const absImgUrl = toAbsoluteUrl(imgUrl);

  // Resolve absolute product page URL
  const slug = product?.slug || '';
  const productUrl = slug ? toAbsoluteUrl(`/merchandise/${slug}`) : '';

  const lines = [
    'Hello VMD Sports!',
    '',
    'I would like to enquire about this product.',
    '',
    `Product: ${name}`,
    `Price: ${pricing.formattedSellingPrice}`,
  ];

  if (size) {
    lines.push(`Size: ${size}`);
  }
  if (colour && colour !== 'Default') {
    lines.push(`Colour: ${colour}`);
  }
  if (qty && qty > 1) {
    lines.push(`Quantity: ${qty}`);
  }

  if (absImgUrl) {
    lines.push('');
    lines.push(`Product Image: ${absImgUrl}`);
  }

  lines.push('');
  lines.push('Please share availability and further details.');

  return lines.join('\n');
}

export const buildCleanEnquiryMessage = buildProductWhatsAppMessage;

/**
 * Builds direct WhatsApp click-to-chat URL:
 * https://wa.me/COUNTRYCODEPHONENUMBER?text=ENCODED_MESSAGE
 */
export function buildWhatsAppUrl(phoneNumber, message) {
  const validation = validateAndNormalizeWhatsAppNumber(phoneNumber);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  return `https://wa.me/${validation.normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Copies a product image to system clipboard as an image/png blob.
 */
export async function copyProductImageToClipboard(imageUrl) {
  if (typeof window === 'undefined' || !navigator?.clipboard?.write) {
    return { success: false, reason: 'Clipboard API not supported in this browser' };
  }
  try {
    const absUrl = toAbsoluteUrl(imageUrl);
    const res = await fetch(absUrl, { mode: 'cors' });
    if (!res.ok) {
      throw new Error(`Failed to fetch image: status ${res.status}`);
    }
    const blob = await res.blob();

    let pngBlob = blob;
    if (blob.type !== 'image/png') {
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    }

    if (!pngBlob) {
      return { success: false, reason: 'Could not generate PNG blob from image' };
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob })
    ]);
    return { success: true };
  } catch (err) {
    console.debug('[Clipboard] Image copy skipped or failed:', err?.message);
    return { success: false, reason: err?.message };
  }
}

/**
 * Downloads product image file locally.
 */
export async function downloadProductImage(imgUrl, filename = 'vmd-sports-product') {
  if (!imgUrl || typeof window === 'undefined') return false;
  try {
    const absUrl = toAbsoluteUrl(imgUrl);
    const res = await fetch(absUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return true;
  } catch {
    window.open(imgUrl, '_blank');
    return true;
  }
}

/**
 * PRIMARY DIRECT WHATSAPP ENQUIRY:
 *
 * 1. Validates configured VMD WhatsApp number dynamically from Website Settings.
 * 2. Validates product pricing (Single selling price, NO MRP).
 * 3. Records enquiry event in MongoDB.
 * 4. Builds direct WhatsApp URL: https://wa.me/919819483036?text=...
 * 5. Directly opens WhatsApp chat with +91 98194 83036.
 *
 * NO navigator.share(), NO Windows share panel, NO contact picker.
 */
export async function openDirectWhatsAppEnquiry({
  product,
  settings,
  extras = {},
  tracker,
  onSuccess,
  onError,
}) {
  if (!product) {
    const err = 'No product selected for enquiry.';
    if (onError) onError(err);
    return { success: false, error: err };
  }

  // 1. Validate WhatsApp Number dynamically from Website Settings
  const rawPhone = settings?.purchaseWhatsApp || settings?.whatsappNumber || settings?.generalPhone;
  const phoneValidation = validateAndNormalizeWhatsAppNumber(rawPhone);
  if (!phoneValidation.isValid) {
    if (onError) onError(phoneValidation.error);
    return { success: false, error: phoneValidation.error };
  }

  // 2. Validate Product Pricing
  const pricing = getProductPricing(product);
  if (!pricing.isValid) {
    if (onError) onError(pricing.error);
    return { success: false, error: pricing.error };
  }

  // 3. Resolve exact image of the selected product
  const rawImg = extras.image || product.images?.[0] || product.image || product.productImageUrl;
  const imgUrl = (typeof rawImg === 'string' ? rawImg : rawImg?.url) || '/images/vmd_cricket_jersey.jpg';

  // 4. Record enquiry in MongoDB before opening chat
  if (tracker?.trackWhatsappEnquiry) {
    try {
      await tracker.trackWhatsappEnquiry(product, { ...extras, image: imgUrl });
    } catch (err) {
      console.debug('[WhatsApp Enquiry] MongoDB tracking non-critical warning:', err);
    }
  }

  // 5. Build direct click-to-chat URL: https://wa.me/{normalizedPhone}?text=...
  const message = buildProductWhatsAppMessage(product, { ...extras, image: imgUrl });
  const waUrl = buildWhatsAppUrl(phoneValidation.normalized, message);

  // 6. Direct WhatsApp Chat Opening (NO navigator.share, NO Windows share panel, NO contact selection)
  if (typeof window !== 'undefined') {
    const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = waUrl;
    }
  }

  if (onSuccess) {
    onSuccess({
      waUrl,
      phoneFormatted: phoneValidation.formatted,
      message,
    });
  }

  return { success: true, waUrl };
}

export const openProductWhatsAppEnquiry = openDirectWhatsAppEnquiry;
