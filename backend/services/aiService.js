/**
 * AI Virtual Try-On Service
 * Handles image processing and AI API integration
 */

const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Upload image to Cloudinary
 */
const uploadToCloudinary = async (filePath, folder = 'try-on') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      quality: 'auto',
      fetch_format: 'auto',
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Validate image file
 */
const validateImage = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('Image file not found');
    }

    const stat = fs.statSync(filePath);
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || 5242880);

    if (stat.size > maxSize) {
      throw new Error(`File size exceeds limit (max ${maxSize / 1048576}MB)`);
    }

    return true;
  } catch (error) {
    logger.error('Image validation error:', error);
    throw error;
  }
};

/**
 * Process virtual try-on with AI
 * This is a placeholder for actual AI implementation
 * You can integrate with OpenAI, RemoveBG API, or custom ML model
 */
const processVirtualTryOn = async (userImageUrl, productImageUrl) => {
  try {
    // TODO: Implement actual AI processing
    // Example with OpenAI Vision API:
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4-vision-preview",
    //   messages: [
    //     {
    //       role: "user",
    //       content: [
    //         { type: "text", text: "Apply this clothing to the person in the image" },
    //         { type: "image_url", image_url: { url: userImageUrl } },
    //         { type: "image_url", image_url: { url: productImageUrl } },
    //       ],
    //     },
    //   ],
    // });

    // For now, return a simulated response
    logger.info('Virtual try-on processing started', {
      userImageUrl,
      productImageUrl,
    });

    return {
      success: true,
      processedImageUrl: userImageUrl, // In production, return actual processed image
      confidence: 0.95,
    };
  } catch (error) {
    logger.error('Error processing virtual try-on:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Analyze style fit using OpenAI GPT-4o-mini vision
 * Accepts base64 image + item metadata, returns JSON style assessment
 */
/**
 * Fallback style analysis when OpenAI is unavailable
 */
const fallbackStyleAnalysis = (itemInfo) => {
  const { title, color, category } = itemInfo;
  const colorHints = {
    black: 'Negrul este extrem de versatil și se potrivește cu orice outfit.',
    white: 'Albul adaugă prospețime și luminozitate look-ului tău.',
    blue: 'Albastrul completează perfect tonurile neutre din garderobă.',
    red: 'Roșul este îndrăzneț și atrage atenția — purtați cu încredere!',
    green: 'Verdele este în tendințe și se combină bine cu nuanțele pământii.',
    default: 'Culoarea se armonizează bine cu tonurile naturale.',
  };
  const key = Object.keys(colorHints).find(k => (color || '').toLowerCase().includes(k)) || 'default';
  return {
    description: `"${title}" pare o alegere excelentă pentru stilul tău. Piesa se va integra armonios în garderoba ta și va crea un look echilibrat și elegant.`,
    styleScore: 8,
    tip: `Combină această piesă cu accesorii minimaliste pentru un efect modern și sofisticat.`,
    colorMatch: colorHints[key],
  };
};

const analyzeStyleFit = async (imageBase64, mediaType, itemInfo) => {
  const { title, brand, category, color, condition, size } = itemInfo;

  // If no API key, return a demo analysis
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai')) {
    logger.info('OpenAI key not set — returning fallback style analysis');
    return fallbackStyleAnalysis(itemInfo);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mediaType};base64,${imageBase64}`, detail: 'low' },
            },
            {
              type: 'text',
              text: `You are a personal fashion stylist. The person in this photo is considering buying: "${title}" by ${brand || 'unknown brand'} (category: ${category}, color: ${color || 'unknown'}, size: ${size || 'unknown'}, condition: ${condition || 'good'}).

Analyze their style from the photo and provide personalized advice. Reply ONLY with valid JSON, no markdown or extra text:
{"description":"Two vivid sentences about how this specific garment would look on this person based on what you see","styleScore":8,"tip":"One concrete styling tip for wearing this item","colorMatch":"One sentence on how the color works with what they are wearing or their skin tone"}`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // Quota exceeded or billing issue — return fallback instead of crashing
      if (response.status === 429 || response.status === 402) {
        logger.warn(`OpenAI quota/billing issue (${response.status}) — returning fallback analysis`);
        return fallbackStyleAnalysis(itemInfo);
      }
      throw new Error(errData.error?.message || `OpenAI API error ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    try {
      return JSON.parse(raw);
    } catch {
      return { description: raw, styleScore: 7, tip: '', colorMatch: '' };
    }
  } catch (err) {
    // Network errors or unexpected failures — return fallback
    if (err.message && (err.message.includes('quota') || err.message.includes('billing') || err.message.includes('429'))) {
      return fallbackStyleAnalysis(itemInfo);
    }
    throw err;
  }
};

module.exports = {
  uploadToCloudinary,
  validateImage,
  processVirtualTryOn,
  analyzeStyleFit,
  deleteFromCloudinary,
};
