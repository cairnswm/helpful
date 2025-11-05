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
        // values[0] corresponds to headers[1] (the join key)
        // headers[0] is the path and not included in values array
        const joinValue = inferType(values[0]);
        const parents = parentRecords.get(parentKey);
        
        if (parents) {
          const parent = parents.find(p => p.id === joinValue);
          
          if (parent) {
            // Build child record
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const childRecord: any = {};
            // Map headers[i] to values[i-1] (skip root path at headers[0])
            for (let i = 1; i < headers.length; i++) {
              const valueIndex = i - 1;
              if (valueIndex >= values.length) break;
              const fieldName = headers[i];
              if (fieldName !== joinKey) { // Don't include join key in child record
                childRecord[fieldName] = inferType(values[valueIndex]);
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
        // Parse the root path once for the block
        const pathSegments = parsePath(headers[0]);
        const rootKey = pathSegments[0].key;
        
        // Ensure the array exists in result
        if (!result[rootKey]) {
          result[rootKey] = [];
        }
        
        // Initialize parent records storage
        if (!parentRecords.has(rootKey)) {
          parentRecords.set(rootKey, []);
        }
        
        // Create a record for this row
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const record: any = {};
        
        // Add fields to the record (skip first header which is the path)
        // Map headers[j] to values[j-1] (skip root path at headers[0])
        for (let j = 1; j < headers.length; j++) {
          const valueIndex = j - 1;
          if (valueIndex >= values.length) break;
          record[headers[j]] = inferType(values[valueIndex]);
        }
        
        // Append to array and store for child block joins
        result[rootKey].push(record);
        parentRecords.get(rootKey)!.push(record);
      }
    }
  }
  
  return result;
}

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
