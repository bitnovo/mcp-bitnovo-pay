// High-performance image processing utilities for QR code enhancement using Sharp
import axios from 'axios';
import sharp from 'sharp';
import qrImage from 'qr-image';
import { getLogger } from './logger.js';
import { getAssetPreloader } from './asset-preloader.js';
import { getQrCache } from './qr-cache.js';
const logger = getLogger();
// Image cache for fallback downloads
const imageCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamps = new Map();
/**
 * Download and cache an image from URL (fallback for non-preloaded assets)
 */
export async function downloadImage(url) {
    const cacheKey = url;
    const now = Date.now();
    // Check cache
    if (imageCache.has(cacheKey)) {
        const timestamp = cacheTimestamps.get(cacheKey);
        if (timestamp && now - timestamp < CACHE_TTL) {
            logger.debug('Using cached image', {
                url,
                operation: 'download_image_cache',
            });
            return imageCache.get(cacheKey);
        }
        else {
            // Cache expired
            imageCache.delete(cacheKey);
            cacheTimestamps.delete(cacheKey);
        }
    }
    try {
        logger.info('Downloading image', { url, operation: 'download_image' });
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 3000, // Reduced timeout for faster failure
            headers: {
                'User-Agent': 'MCP-Bitnovo-Pay/1.0.0',
            },
        });
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const buffer = Buffer.from(response.data);
        // Cache the image
        imageCache.set(cacheKey, buffer);
        cacheTimestamps.set(cacheKey, now);
        logger.debug('Image downloaded and cached', {
            url,
            size: buffer.length,
            operation: 'download_image_success',
        });
        return buffer;
    }
    catch (error) {
        logger.error('Failed to download image', error, {
            url,
            operation: 'download_image_error',
        });
        throw new Error(`Image download failed: ${error.message}`);
    }
}
/**
 * Generate fast QR code using qr-image (much faster than qrcode library)
 */
export function generateFastQrCode(data, size, errorCorrectionLevel = 'M') {
    const startTime = Date.now();
    try {
        const qrBuffer = qrImage.imageSync(data, {
            type: 'png',
            size: Math.floor(size / 25), // qr-image size is in modules, approximate conversion
            margin: 1,
            'ec_level': errorCorrectionLevel,
        });
        const duration = Date.now() - startTime;
        logger.debug('Fast QR generation completed', {
            dataLength: data.length,
            size,
            duration,
            operation: 'fast_qr_generation',
        });
        return qrBuffer;
    }
    catch (error) {
        logger.error('Fast QR generation failed', error, {
            dataLength: data.length,
            size,
            operation: 'fast_qr_error',
        });
        throw error;
    }
}
/**
 * Create circular logo mask using Sharp (much faster than Jimp pixel-by-pixel)
 */
async function createCircularLogo(logoBuffer, size) {
    try {
        // Create circular mask using SVG
        const mask = Buffer.from(`
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `);
        // Process logo with circular mask
        const circularLogo = await sharp(logoBuffer)
            .resize(size, size, { fit: 'cover' })
            .composite([{
                input: mask,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();
        return circularLogo;
    }
    catch (error) {
        logger.error('Failed to create circular logo', error, {
            size,
            operation: 'create_circular_logo_error',
        });
        throw error;
    }
}
/**
 * Fast logo overlay using Sharp composite operations
 */
export async function overlayLogoOnQr(qrBuffer, logoAsset, qrSize) {
    const startTime = Date.now();
    try {
        // Calculate logo size (15% of QR code)
        const logoSize = Math.floor(qrSize * 0.15);
        const centerX = Math.floor((qrSize - logoSize) / 2);
        const centerY = Math.floor((qrSize - logoSize) / 2);
        // Create white circular background (slightly larger than logo)
        const backgroundSize = logoSize + 8;
        const backgroundX = Math.floor((qrSize - backgroundSize) / 2);
        const backgroundY = Math.floor((qrSize - backgroundSize) / 2);
        const whiteCircle = Buffer.from(`
      <svg width="${backgroundSize}" height="${backgroundSize}">
        <circle cx="${backgroundSize / 2}" cy="${backgroundSize / 2}" r="${backgroundSize / 2}" fill="white"/>
      </svg>
    `);
        // Create circular logo
        const circularLogo = await createCircularLogo(logoAsset.buffer, logoSize);
        // Composite everything together in one operation
        const result = await sharp(qrBuffer)
            .composite([
            {
                input: whiteCircle,
                top: backgroundY,
                left: backgroundX,
            },
            {
                input: circularLogo,
                top: centerY,
                left: centerX,
            }
        ])
            .png()
            .toBuffer();
        const duration = Date.now() - startTime;
        logger.debug('Logo overlay completed', {
            qrSize,
            logoSize,
            duration,
            operation: 'logo_overlay_success',
        });
        return result;
    }
    catch (error) {
        logger.error('Failed to overlay logo on QR code', error, {
            qrSize,
            operation: 'logo_overlay_error',
        });
        // Return original QR code on error
        return qrBuffer;
    }
}
/**
 * Fast branding addition using Sharp text and SVG operations
 */
export async function addBitnovoBranding(qrBuffer, qrSize, currencySymbol) {
    const startTime = Date.now();
    try {
        // Calculate dimensions
        const brandingHeight = 60;
        const totalHeight = qrSize + brandingHeight;
        const totalWidth = qrSize;
        // Create branding SVG
        let brandingSvg = `
      <svg width="${totalWidth}" height="${brandingHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${totalWidth}" height="${brandingHeight}" fill="white"/>
        <line x1="10" y1="1" x2="${totalWidth - 10}" y2="1" stroke="#e5e5e5" stroke-width="1"/>
    `;
        let textY = 15;
        // Add currency symbol if provided
        if (currencySymbol) {
            brandingSvg += `
        <text x="${totalWidth / 2}" y="${textY}" text-anchor="middle" fill="#374151"
              font-family="Arial, sans-serif" font-size="10" font-weight="bold">
          ${currencySymbol.toUpperCase()}
        </text>
      `;
            textY += 15;
        }
        // Add "Powered by" text
        brandingSvg += `
      <text x="${totalWidth / 2}" y="${textY}" text-anchor="middle" fill="#6b7280"
            font-family="Arial, sans-serif" font-size="8">
        Powered by
      </text>
    `;
        textY += 12;
        // Add Bitnovo Pay text (fallback if logo fails)
        brandingSvg += `
      <text x="${totalWidth / 2}" y="${textY}" text-anchor="middle" fill="#1e40af"
            font-family="Arial, sans-serif" font-size="12" font-weight="bold">
        Bitnovo Pay
      </text>
    `;
        brandingSvg += '</svg>';
        const brandingBuffer = Buffer.from(brandingSvg);
        // Composite QR code and branding
        const result = await sharp({
            create: {
                width: totalWidth,
                height: totalHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite([
            {
                input: qrBuffer,
                top: 0,
                left: 0,
            },
            {
                input: brandingBuffer,
                top: qrSize,
                left: 0,
            }
        ])
            .png()
            .toBuffer();
        const duration = Date.now() - startTime;
        logger.debug('Branding added successfully', {
            qrSize,
            brandingHeight,
            currencySymbol,
            duration,
            operation: 'add_branding_success',
        });
        return {
            buffer: result,
            width: totalWidth,
            height: totalHeight,
        };
    }
    catch (error) {
        logger.error('Failed to add Bitnovo branding', error, {
            qrSize,
            currencySymbol,
            operation: 'add_branding_error',
        });
        // Return original QR code on error
        return {
            buffer: qrBuffer,
            width: qrSize,
            height: qrSize,
        };
    }
}
/**
 * High-performance QR code processing with caching
 */
export async function processQrCode(qrBuffer, options) {
    const startTime = Date.now();
    try {
        // Check cache first if enabled
        if (options.useCache !== false) {
            const cache = getQrCache();
            const cacheKey = `${qrBuffer.toString('base64').slice(0, 32)}-${options.size}-${options.style}-${options.includeBranding}`;
            // Quick cache check (simplified key for performance)
            const cached = cache.get(cacheKey, 'processed', options.size, options.style, options.includeBranding);
            if (cached) {
                logger.debug('QR processing cache hit', {
                    cacheKey: cacheKey.slice(0, 16) + '...',
                    operation: 'process_qr_cache_hit',
                });
                return {
                    buffer: Buffer.from(cached.data.replace('data:image/png;base64,', ''), 'base64'),
                    width: options.size,
                    height: options.size,
                };
            }
        }
        let processedBuffer = qrBuffer;
        // Step 1: Overlay logo if requested and available
        if (options.style === 'branded') {
            const assetPreloader = getAssetPreloader();
            let logoAsset = null;
            if (options.isGatewayUrl) {
                // For gateway URLs, use Bitnovo Pay logo
                logoAsset = assetPreloader.getAsset('BITNOVO');
            }
            else if (options.currencySymbol) {
                // For cryptocurrency payments, use cryptocurrency logo
                logoAsset = assetPreloader.getAssetWithFallback(options.currencySymbol);
            }
            if (logoAsset) {
                logger.debug('Overlaying logo from preloaded assets', {
                    currency: options.currencySymbol,
                    isGateway: options.isGatewayUrl,
                    logoFormat: logoAsset.format,
                    logoSize: logoAsset.size,
                    operation: 'process_qr_logo_overlay',
                });
                processedBuffer = await overlayLogoOnQr(processedBuffer, logoAsset, options.size);
            }
            else if (options.logoUrl) {
                // Fallback to downloading logo (slower path)
                logger.debug('Falling back to logo download', {
                    logoUrl: options.logoUrl,
                    operation: 'process_qr_logo_download_fallback',
                });
                try {
                    const logoBuffer = await downloadImage(options.logoUrl);
                    const logoAsset = {
                        buffer: logoBuffer,
                        width: options.size,
                        height: options.size,
                        format: 'png',
                        optimized: false,
                        size: logoBuffer.length,
                    };
                    processedBuffer = await overlayLogoOnQr(processedBuffer, logoAsset, options.size);
                }
                catch (logoError) {
                    logger.warn('Logo download fallback failed, continuing without logo', {
                        logoUrl: options.logoUrl,
                        error: logoError.message,
                        operation: 'logo_download_fallback_error',
                    });
                }
            }
        }
        // Step 2: Add Bitnovo branding if requested
        let result;
        if (options.includeBranding) {
            const brandingSymbol = options.isGatewayUrl ? 'Gateway' : options.currencySymbol;
            result = await addBitnovoBranding(processedBuffer, options.size, brandingSymbol);
        }
        else {
            result = {
                buffer: processedBuffer,
                width: options.size,
                height: options.size,
            };
        }
        // Cache the result if caching is enabled
        if (options.useCache !== false) {
            const cache = getQrCache();
            const cacheKey = `${qrBuffer.toString('base64').slice(0, 32)}-${options.size}-${options.style}-${options.includeBranding}`;
            const qrData = {
                data: `data:image/png;base64,${result.buffer.toString('base64')}`,
                format: 'png',
                style: options.style,
                dimensions: `${result.width}x${result.height}`,
            };
            cache.set(cacheKey, 'processed', options.size, options.style, options.includeBranding, qrData);
        }
        const duration = Date.now() - startTime;
        logger.debug('QR processing completed', {
            size: options.size,
            style: options.style,
            branding: options.includeBranding,
            duration,
            operation: 'process_qr_success',
        });
        return result;
    }
    catch (error) {
        logger.error('QR code processing failed', error, {
            options,
            operation: 'process_qr_error',
        });
        // Return original QR on any error
        return {
            buffer: qrBuffer,
            width: options.size,
            height: options.size,
        };
    }
}
/**
 * Generate optimized QR code with all enhancements
 */
export async function generateOptimizedQrCode(data, options) {
    const startTime = Date.now();
    try {
        // Use higher error correction if logo will be overlaid
        const errorCorrectionLevel = options.style === 'branded' ? 'H' : 'M';
        // Generate base QR code using fast qr-image
        const baseQrBuffer = generateFastQrCode(data, options.size, errorCorrectionLevel);
        // Resize to exact dimensions using Sharp (qr-image size approximation)
        const resizedQrBuffer = await sharp(baseQrBuffer)
            .resize(options.size, options.size, {
            fit: 'fill',
            kernel: sharp.kernel.nearest, // Preserve sharp QR edges
        })
            .png()
            .toBuffer();
        // Process with enhancements
        const result = await processQrCode(resizedQrBuffer, options);
        const duration = Date.now() - startTime;
        logger.info('Optimized QR generation completed', {
            dataLength: data.length,
            size: options.size,
            style: options.style,
            branding: options.includeBranding,
            duration,
            operation: 'generate_optimized_qr_success',
        });
        return result;
    }
    catch (error) {
        logger.error('Optimized QR generation failed', error, {
            dataLength: data.length,
            options,
            operation: 'generate_optimized_qr_error',
        });
        throw error;
    }
}
/**
 * Clear the image cache (useful for testing or memory management)
 */
export function clearImageCache() {
    imageCache.clear();
    cacheTimestamps.clear();
    logger.debug('Image cache cleared', { operation: 'clear_cache' });
}
/**
 * Get cache statistics
 */
export function getCacheStats() {
    let totalSize = 0;
    for (const buffer of imageCache.values()) {
        totalSize += buffer.length;
    }
    return {
        entries: imageCache.size,
        totalSize,
    };
}
/**
 * Backward compatibility function - download Bitnovo logo
 */
export async function downloadBitnovoLogo() {
    const assetPreloader = getAssetPreloader();
    const asset = assetPreloader.getAsset('BITNOVO');
    if (asset) {
        return asset.buffer;
    }
    // Fallback to download
    const logoUrl = 'https://dev-paytest.bitnovo.com/logos/bitnovoPay.svg';
    return downloadImage(logoUrl);
}
//# sourceMappingURL=image-utils-old.js.map