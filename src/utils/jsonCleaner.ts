/**
 * Utility functions for cleaning and validating JSON with common formatting issues
 */

/**
 * Result of attempting to parse and clean JSON
 */
export interface JsonCleanResult {
  /** Whether the JSON is valid (either originally or after cleaning) */
  isValid: boolean;
  /** The cleaned JSON string (original if already valid, cleaned if auto-corrected) */
  cleanedJson: string;
  /** Whether the JSON was auto-corrected */
  wasCleaned: boolean;
}

/**
 * Cleans common JSON formatting issues
 * @param jsonString - The JSON string to clean
 * @returns The cleaned JSON string
 */
export const cleanJson = (jsonString: string): string => {
  let cleaned = jsonString.trim();
  
  // Remove leading/trailing quotes if the entire string is wrapped
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Fix escaped quotes that are common when copying from logs or code
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\'/g, "'");
  
  // Fix escaped backslashes
  cleaned = cleaned.replace(/\\\\/g, '\\');
  
  // Remove trailing commas before closing brackets/braces
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix single quotes to double quotes (JSON requires double quotes)
  // But be careful not to replace quotes inside strings
  cleaned = cleaned.replace(/(\s|^|[{[,:])\s*'([^']*?)'\s*(?=\s*[,}\]:])/g, '$1"$2"');
  
  // Fix common property name issues (unquoted property names)
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  
  // Remove any BOM (Byte Order Mark) characters
  cleaned = cleaned.replace(/^\uFEFF/, '');
  
  // Fix line breaks that might be escaped incorrectly
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
  
  // Handle common JSON-like formats that aren't valid JSON
  // Remove comments (// and /* */ style)
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Handle trailing commas in arrays and objects more thoroughly
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix undefined/NaN values to null
  cleaned = cleaned.replace(/\bundefined\b/g, 'null');
  cleaned = cleaned.replace(/\bNaN\b/g, 'null');
  
  return cleaned;
};

/**
 * Attempts to parse JSON, trying to clean it if initial parsing fails
 * @param jsonString - The JSON string to parse
 * @returns Result containing validity status, cleaned JSON, and whether it was cleaned
 */
export const parseAndCleanJson = (jsonString: string): JsonCleanResult => {
  if (!jsonString.trim()) {
    return {
      isValid: false,
      cleanedJson: '',
      wasCleaned: false
    };
  }
  
  try {
    // Try parsing original JSON first
    JSON.parse(jsonString);
    return {
      isValid: true,
      cleanedJson: jsonString,
      wasCleaned: false
    };
  } catch {
    // If original fails, try cleaning the JSON
    try {
      const cleaned = cleanJson(jsonString);
      JSON.parse(cleaned);
      return {
        isValid: true,
        cleanedJson: cleaned,
        wasCleaned: true
      };
    } catch {
      return {
        isValid: false,
        cleanedJson: jsonString,
        wasCleaned: false
      };
    }
  }
};
