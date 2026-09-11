import { createSession, navigateTo, getPageSnapshot, clickByText, endSession } from './webcmdClient.js';

/**
 * Extract domain from URL.
 * @param {string} url
 */
function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Main explorer function.
 * @param {string} url
 * @returns {Promise<object>} Product data
 */
export async function exploreProduct(url) {
  const domain = getDomain(url);

  let sessionId;
  try {
    sessionId = await createSession();

    // Navigate to product page
    await navigateTo(sessionId, url);

    // Get initial snapshot
    const initialSnapshot = await getPageSnapshot(sessionId);
    const pageText = extractTextFromSnapshot(initialSnapshot);

    // Basic product detection
    const isAmazon = domain.includes('amazon');
    const isBlinkit = domain.includes('blinkit');

    if (!isAmazon && !isBlinkit) {
      // For non-supported domains, do a minimal extraction.
      return extractGenericProduct(pageText, url);
    }

    if (isAmazon) {
      return await exploreAmazon(sessionId, url, pageText);
    }

    if (isBlinkit) {
      return await exploreBlinkit(sessionId, url, pageText);
    }

    return {
      brand: 'Unknown',
      product: 'Unknown Product',
      ingredients: [],
      claims: [],
      nutrition: {}
    };
  } finally {
    if (sessionId) {
      try {
        await endSession(sessionId);
      } catch {
        // Ignore session cleanup errors in MVP
      }
    }
  }
}

/**
 * Explore Amazon product page.
 */
async function exploreAmazon(sessionId, url, pageText) {
  // Try to open "Product details" / "Ingredients" if present
  const targets = ['Product details', 'See more', 'Ingredients', 'About this item'];

  for (const hint of targets) {
    try {
      await clickByText(sessionId, hint);
      // Small delay could help in real browser; for MVP we skip explicit sleep.
    } catch {
      // Element may not exist; continue
    }
  }

  // Get updated snapshot after opening sections
  const finalSnapshot = await getPageSnapshot(sessionId);
  const text = extractTextFromSnapshot(finalSnapshot);

  return parseAmazonPage(text, url);
}

/**
 * Explore Blinkit product page.
 */
async function exploreBlinkit(sessionId, url, pageText) {
  const targets = ['Product details', 'Ingredients', 'More info', 'Description'];

  for (const hint of targets) {
    try {
      await clickByText(sessionId, hint);
    } catch {
      // ignore
    }
  }

  const finalSnapshot = await getPageSnapshot(sessionId);
  const text = extractTextFromSnapshot(finalSnapshot);

  return parseBlinkitPage(text, url);
}

/**
 * Very generic extraction for unsupported sites.
 */
function extractGenericProduct(pageText, url) {
  // Crude: take first line as product, second as brand-like.
  const lines = pageText.split(/\n+/).map(l => l.trim()).filter(Boolean);
  return {
    brand: 'Unknown',
    product: lines[0] || 'Unknown Product',
    ingredients: [],
    claims: [],
    nutrition: {}
  };
}

/* ---------- Parsing helpers (simple, MVP-grade) ---------- */

function extractTextFromSnapshot(snapshot) {
  // Snapshot shape depends on webcmd; often something like { text: "...", html: "..." }
  // Try common fields.
  if (typeof snapshot === 'string') return snapshot;
  if (snapshot?.text) return String(snapshot.text);
  if (snapshot?.content) return String(snapshot.content);
  if (snapshot?.raw) return String(snapshot.raw);
  // Fallback: JSON stringify
  return JSON.stringify(snapshot);
}

function parseAmazonPage(text, url) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

  // Crude heuristics:
  // - Product: often near top, before first long description.
  // - Brand: look for "Brand" or "by XYZ".
  // - Ingredients: near "Ingredients" heading.
  // - Claims: near bullets with "No Added Sugar", "High Protein", etc.

  const brand = extractBrandFromText(text, /(?:Brand|by)\s*[:\-]?\s*([A-Za-z0-9 &.]+)/i);
  const product = extractProductTitle(lines);

  const ingredients = extractIngredientsFromText(text);
  const claims = extractClaimsFromText(text);

  const nutrition = extractNutritionFromText(text);

  return {
    brand: brand || 'Unknown',
    product: product || 'Unknown Product',
    ingredients,
    claims,
    nutrition
  };
}

function parseBlinkitPage(text, url) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

  const brand = extractBrandFromText(text, /(?:Brand|by)\s*[:\-]?\s*([A-Za-z0-9 &.]+)/i);
  const product = extractProductTitle(lines);

  const ingredients = extractIngredientsFromText(text);
  const claims = extractClaimsFromText(text);
  const nutrition = extractNutritionFromText(text);

  return {
    brand: brand || 'Unknown',
    product: product || 'Unknown Product',
    ingredients,
    claims,
    nutrition
  };
}

function extractBrandFromText(text, regex) {
  const m = text.match(regex);
  return m ? m[1].trim() : null;
}

function extractProductTitle(lines) {
  // Take first non-noise line as product title.
  const noise = ['menu', 'cart', 'sign in', 'hello', 'account', 'prime', 'blinkit'];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (noise.some(n => lower.includes(n))) continue;
    if (line.length > 5 && line.length < 120) {
      return line;
    }
  }
  return lines[0] || 'Unknown Product';
}

function extractIngredientsFromText(text) {
  const ingredients = [];
  const lower = text.toLowerCase();

  const startIdx = lower.indexOf('ingredients');
  if (startIdx === -1) return ingredients;

  // Take next ~300 chars as ingredient region
  const region = text.slice(startIdx, startIdx + 400);
  const tokens = region.split(/[,;()]+/).map(t => t.trim()).filter(Boolean);

  const stopWords = new Set(['allergens', 'directions', 'usage', 'warning', 'store', 'manufactured']);
  for (const t of tokens) {
    const clean = t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9\s&./-]+$/g, '').trim();
    if (!clean) continue;
    if (stopWords.has(clean.toLowerCase())) break;
    if (clean.length > 2 && clean.length < 60) {
      ingredients.push(clean);
    }
  }

  // Deduplicate
  return [...new Set(ingredients)];
}

function extractClaimsFromText(text) {
  const claims = [];
  const claimPhrases = [
    'no added sugar',
    'high protein',
    'low fat',
    'gluten free',
    'sugar free',
    '100% natural',
    'no artificial flavors',
    'no preservatives'
  ];

  const lower = text.toLowerCase();
  for (const phrase of claimPhrases) {
    if (lower.includes(phrase)) {
      // Title case
      claims.push(phrase.replace(/\b\w/g, c => c.toUpperCase()));
    }
  }
  return claims;
}

function extractNutritionFromText(text) {
  const nutrition = {};
  const lower = text.toLowerCase();

  const proteinMatch = text.match(/protein\s*[:\-]?\s*(\d+\s*g)/i);
  const sugarMatch = text.match(/sugar(?:s)?\s*[:\-]?\s*(\d+\s*g)/i);
  const fatMatch = text.match(/(?:total\s+)?fat\s*[:\-]?\s*(\d+\s*g)/i);

  if (proteinMatch) nutrition.protein = proteinMatch[1];
  if (sugarMatch) nutrition.sugar = sugarMatch[1];
  if (fatMatch) nutrition.fat = fatMatch[1];

  return nutrition;
}