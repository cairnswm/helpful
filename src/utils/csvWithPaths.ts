/**
 * Utility functions for parsing and generating CSV-with-paths (AI Ready data format)
 * 
 * Format specification:
 * - Headers carry JSON-style paths with optional array indexes (1-based in notation, 0-based in JSON)
 * - Rows supply values for creating nested JSON structures
 * - Arrays via brackets: users[1] targets users[0] in JSON
 * - Multiple blocks separated by blank lines
 * - Supports child arrays with join keys
 */

/**
 * Represents a parsed path segment
 */
interface PathSegment {
  key: string;
  arrayIndex?: number; // 0-based (after conversion from 1-based notation)
  isArray: boolean;
}

/**
 * Parse a path string into segments
 * Example: "users[1].profile.email" -> [{key: "users", arrayIndex: 0, isArray: true}, {key: "profile"}, {key: "email"}]
 */
function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const parts = path.split('.');
  
  for (const part of parts) {
    const match = part.match(/^([^[]+)(?:\[(\d+)\])?$/);
    if (!match) {
      throw new Error(`Invalid path segment: ${part}`);
    }
    
    const [, key, index] = match;
    segments.push({
      key,
      arrayIndex: index ? parseInt(index, 10) - 1 : undefined, // Convert from 1-based to 0-based
      isArray: index !== undefined
    });
  }
  
  return segments;
}

/**
 * Set a value in an object following a path
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setValueAtPath(obj: any, segments: PathSegment[], value: any): void {
  let current = obj;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    
    if (segment.isArray) {
      if (!current[segment.key]) {
        current[segment.key] = [];
      }
      
      const array = current[segment.key];
      const index = segment.arrayIndex!;
      
      // Ensure array has enough elements
      while (array.length <= index) {
        array.push({});
      }
      
      current = array[index];
    } else {
      if (!current[segment.key]) {
        current[segment.key] = {};
      }
      current = current[segment.key];
    }
  }
  
  // Set the final value
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.isArray) {
    if (!current[lastSegment.key]) {
      current[lastSegment.key] = [];
    }
    const array = current[lastSegment.key];
    const index = lastSegment.arrayIndex!;
    while (array.length <= index) {
      array.push({});
    }
    current[lastSegment.key][index] = value;
  } else {
    current[lastSegment.key] = value;
  }
}

/**
 * Infer the type of a value from string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function inferType(value: string): any {
  const trimmed = value.trim();
  
  // Empty or null
  if (trimmed === '' || trimmed.toLowerCase() === 'null') {
    return null;
  }
  
  // Boolean
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  
  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  
  // String
  return value;
}

/**
 * Parse a CSV line respecting quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Parse CSV-with-paths format to JSON
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCSVWithPaths(csvString: string): any {
  const lines = csvString.split('\n').map(line => line.trim());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  
  // Split into blocks (separated by blank lines)
  const blocks: string[][] = [];
  let currentBlock: string[] = [];
  
  for (const line of lines) {
    if (line === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
  }
  
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }
  
  // Process each block
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentRecords: Map<string, any[]> = new Map();
  
  for (const block of blocks) {
    if (block.length < 1) continue; // Skip empty blocks
    
    const headerLine = block[0];
    const headers = parseCSVLine(headerLine);
    const dataRows = block.slice(1);
    
    if (headers.length === 0) continue;
    
    // Parse the root path to determine if this is a parent or child block
    const rootPath = headers[0];
    const rootSegments = parsePath(rootPath);
    
    // Check if this is a child block (has a join key like user_id)
    let isChildBlock = false;
    let joinKey = '';
    let parentKey = '';
    
    if (headers.length > 1) {
      // Look for patterns like "user_id", "parent_id", etc.
      const potentialJoinKey = headers[1];
      if (potentialJoinKey.endsWith('_id') || potentialJoinKey === 'id') {
        // Check if root path suggests this is a child array
        if (rootSegments.length > 1 && rootSegments[rootSegments.length - 1].isArray) {
          isChildBlock = true;
          joinKey = potentialJoinKey;
          // Determine parent key from path
          parentKey = rootSegments[0].key;
        }
      }
    }
    
    // Process rows
    for (const rowLine of dataRows) {
      if (!rowLine.trim()) continue;
      
      const values = parseCSVLine(rowLine);
      
      if (isChildBlock && joinKey) {
        // Find parent record and attach child
        const joinValue = inferType(values[1]); // Assuming join key is second column
        const parents = parentRecords.get(parentKey);
        
        if (parents) {
          const parent = parents.find(p => p.id === joinValue);
          
          if (parent) {
            // Build child record
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const childRecord: any = {};
            for (let i = 1; i < headers.length; i++) { // Skip root path, start from actual fields
              if (i >= values.length) break;
              const fieldName = headers[i];
              if (fieldName !== joinKey) { // Don't include join key in child record
                childRecord[fieldName] = inferType(values[i]);
              }
            }
            
            // Add to parent's array
            const childArrayKey = rootSegments[rootSegments.length - 1].key;
            if (!parent[childArrayKey]) {
              parent[childArrayKey] = [];
            }
            parent[childArrayKey].push(childRecord);
          }
        }
      } else {
        // Parent block - create records normally
        for (let i = 0; i < headers.length; i++) {
          if (i >= values.length) break;
          
          if (i === 0) {
            // First column defines the root
            const pathSegments = parsePath(headers[i]);
            
            // Create a record for this row
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const record: any = {};
            
            // Add remaining fields to the record
            for (let j = 1; j < headers.length; j++) {
              if (j >= values.length) break;
              record[headers[j]] = inferType(values[j]);
            }
            
            // Store parent records for potential child block joins
            const rootKey = pathSegments[0].key;
            if (!parentRecords.has(rootKey)) {
              parentRecords.set(rootKey, []);
            }
            parentRecords.get(rootKey)!.push(record);
            
            // Add to result
            setValueAtPath(result, pathSegments, record);
          }
        }
      }
    }
  }
  
  return result;
}

// Commenting out unused function for now
// /**
//  * Get value at path in object
//  */
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function getValueAtPath(obj: any, path: string): any {
//   const segments = parsePath(path);
//   let current = obj;
//   
//   for (const segment of segments) {
//     if (current === undefined || current === null) {
//       return undefined;
//     }
//     
//     if (segment.isArray) {
//       current = current[segment.key];
//       if (Array.isArray(current) && segment.arrayIndex !== undefined) {
//         current = current[segment.arrayIndex];
//       }
//     } else {
//       current = current[segment.key];
//     }
//   }
//   
//   return current;
// }

/**
 * Escape CSV value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // If value contains comma, quotes, or newlines, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Flatten nested object to paths
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenObject(obj: any, prefix = ''): Map<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = new Map<string, any>();
  
  if (obj === null || obj === undefined) {
    return result;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const arrayPath = prefix ? `${prefix}[${index + 1}]` : `[${index + 1}]`;
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        // Flatten object properties
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'object' && value !== null) {
            const nested = flattenObject(value, `${arrayPath}.${key}`);
            nested.forEach((v, k) => result.set(k, v));
          } else {
            result.set(`${arrayPath}.${key}`, value);
          }
        }
      } else {
        result.set(arrayPath, item);
      }
    });
  } else if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        const nested = flattenObject(value, path);
        nested.forEach((v, k) => result.set(k, v));
      } else {
        result.set(path, value);
      }
    }
  } else {
    result.set(prefix, obj);
  }
  
  return result;
}

/**
 * Generate CSV-with-paths format from JSON
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCSVWithPaths(json: any): string {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Input must be a JSON object or array');
  }
  
  const lines: string[] = [];
  
  // Process top-level arrays directly
  for (const [key, value] of Object.entries(json)) {
    if (Array.isArray(value) && value.length > 0) {
      const arrayPath = `${key}[1]`;
      const arrayItems = value;
      
      if (arrayItems.length > 0) {
          // Get all unique keys from array items
          const keys = new Set<string>();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          arrayItems.forEach((item: any) => {
            if (typeof item === 'object' && item !== null) {
              Object.keys(item).forEach(k => {
                // Only add simple fields for now
                if (typeof item[k] !== 'object' || item[k] === null) {
                  keys.add(k);
                }
              });
            }
          });
        
        const fieldKeys = Array.from(keys);
        
        // Create header
        const header = [arrayPath, ...fieldKeys];
        lines.push(header.join(','));
        
        // Create rows
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arrayItems.forEach((item: any) => {
          const row = [
            ...fieldKeys.map(fkey => escapeCSVValue(item[fkey]))
          ];
          lines.push(row.join(','));
        });
        
        lines.push(''); // Blank line between blocks
        
        // Handle child arrays - collect all child array types first
        const childArrayTypes = new Set<string>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arrayItems.forEach((item: any) => {
          for (const itemKey of Object.keys(item)) {
            if (Array.isArray(item[itemKey])) {
              childArrayTypes.add(itemKey);
            }
          }
        });
        
        // Process each child array type once
        for (const childArrayKey of childArrayTypes) {
          const childPath = `${key}[1].${childArrayKey}[1]`;
          
          // Collect all unique keys from all child items
          const childKeys = new Set<string>();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          arrayItems.forEach((item: any) => {
            const childArray = item[childArrayKey];
            if (Array.isArray(childArray)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              childArray.forEach((childItem: any) => {
                if (typeof childItem === 'object' && childItem !== null) {
                  Object.keys(childItem).forEach(k => {
                    if (typeof childItem[k] !== 'object' || childItem[k] === null) {
                      childKeys.add(k);
                    }
                  });
                }
              });
            }
          });
          
          const childFieldKeys = Array.from(childKeys);
          
          // Check if parent has id for join key
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hasParentId = arrayItems.some((item: any) => item.id !== undefined);
          const headerKeys = hasParentId ? [`${key}_id`, ...childFieldKeys] : childFieldKeys;
          
          // Create child block header
          const childHeader = [childPath, ...headerKeys];
          lines.push(childHeader.join(','));
          
          // Create child rows from all parent items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          arrayItems.forEach((item: any) => {
            const childArray = item[childArrayKey];
            if (Array.isArray(childArray)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              childArray.forEach((childItem: any) => {
                const childRow = [
                  ...(hasParentId ? [escapeCSVValue(item.id)] : []),
                  ...childFieldKeys.map(k => escapeCSVValue(childItem[k]))
                ];
                lines.push(childRow.join(','));
              });
            }
          });
          
          lines.push(''); // Blank line between blocks
        }
      }
    }
  }
  
  // Remove trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  
  return lines.join('\n');
}
