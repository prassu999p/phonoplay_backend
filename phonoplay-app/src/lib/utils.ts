// Utility functions for PhonoPlay
// This file is required for shadcn/ui components (e.g., Button) to work.

// Type for individual class names or conditional (falsy) values that will be filtered out.
// Numbers and booleans are not explicitly included here as they are less common for CSS classes
// and the .filter(Boolean) and .join(' ') would handle them in specific ways (e.g., true -> "true").
// Sticking to string | null | undefined aligns well with typical class name inputs.
type ConditionalClassValue = string | null | undefined;

// Type for an array of conditional class values. This defines one level of nesting.
// Deeper nesting is handled at runtime by .flat(Infinity).
type ClassValueArray = ConditionalClassValue[];

// Each argument to `cn` can be a single conditional class value or an array of them.
type CnArg = ConditionalClassValue | ClassValueArray;

/**
 * Combines class names conditionally. It's a utility function similar to `clsx` or `classnames`.
 * @param {...CnArg} args - A list of arguments. Each argument can be a string, null, undefined,
 *                         or an array of strings, nulls, or undefined values.
 *                         Deeper nesting of arrays is flattened at runtime.
 * @returns {string} A single string of space-separated class names, after filtering falsy values and flattening all arrays.
 */
export function cn(...args: CnArg[]): string {
  return args
    .flat(Infinity) // Step 1: Flatten any nested arrays into a single-level array.
                    // For example, ['a', ['b', 'c'], 'd'] becomes ['a', 'b', 'c', 'd'].
    .filter(Boolean) // Step 2: Remove all "falsy" values (null, undefined, false, 0, NaN, empty string).
                     // This allows for conditional inclusion of class names, e.g., condition && 'my-class'.
    .join(' ');      // Step 3: Join the remaining truthy values (expected to be strings) with a space.
                     // For example, ['class1', 'class2'] becomes "class1 class2".
}
