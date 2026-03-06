import { useEffect, useRef } from "react";

/**
 * Custom hook that calls a function after a delay when the value changes.
 * Useful for debouncing input changes.
 *
 * @param callback - Function to call after the delay
 * @param value - Value to watch for changes
 * @param delay - Delay in milliseconds before calling the callback
 */
export function useDebouncedEffect(
  callback: () => void,
  value: unknown,
  delay: number,
) {
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
}
