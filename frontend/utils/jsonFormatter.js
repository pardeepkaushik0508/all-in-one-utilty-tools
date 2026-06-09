// Parses JSON text safely and returns either data or an error.
export function parseJsonSafe(input) {
  try {
    const data = JSON.parse(input);
    return { data, error: '' };
  } catch (error) {
    return { data: null, error: `Invalid JSON: ${error.message}` };
  }
}

// Formats parsed JSON using 2-space indentation.
export function formatJson(input) {
  const { data, error } = parseJsonSafe(input);
  if (error) return { output: '', error };
  return { output: JSON.stringify(data, null, 2), error: '' };
}

// Minifies parsed JSON by removing extra whitespace.
export function minifyJson(input) {
  const { data, error } = parseJsonSafe(input);
  if (error) return { output: '', error };
  return { output: JSON.stringify(data), error: '' };
}

// Converts parser errors into user-friendly validation messages.
export function getValidationMessage(input) {
  const { error } = parseJsonSafe(input);
  return error || 'JSON is valid.';
}
