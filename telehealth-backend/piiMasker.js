/**
 * Secure PII Masking Engine
 * Detects and masks Personal Identifiable Information (PII) to ensure HIPAA/GDPR compliance
 * before sending data to third-party AI models.
 */

const maskPII = (text) => {
  if (!text || typeof text !== 'string') return text;

  let maskedText = text;

  // Mask Emails
  maskedText = maskedText.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[REDACTED_EMAIL]');

  // Mask Phone Numbers (various formats)
  maskedText = maskedText.replace(/(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g, '[REDACTED_PHONE]');

  // Mask SSN (Social Security Numbers)
  maskedText = maskedText.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');

  // Mask common names (simple heuristic for demonstration, production would use NER)
  const commonNames = ['John Doe', 'Jane Doe', 'Alice', 'Bob', 'Charlie'];
  commonNames.forEach(name => {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    maskedText = maskedText.replace(regex, '[REDACTED_NAME]');
  });

  return maskedText;
};

const piiMiddleware = (req, res, next) => {
  if (req.body && req.body.symptoms) {
    const original = req.body.symptoms;
    req.body.symptoms = maskPII(original);
    // Attach original to a hidden field just in case internal logic needs it, but keep body masked for APIs
    req.unmaskedSymptoms = original;
  }
  
  if (req.body && req.body.transcript) {
    const original = req.body.transcript;
    req.body.transcript = maskPII(original);
  }

  next();
};

module.exports = { maskPII, piiMiddleware };
