import { useState, useEffect } from 'react';

/**
 * Hook per debounce dei valori
 * Utile per ottimizzare le chiamate API durante la digitazione
 *
 * @param {any} value - Il valore da debounce
 * @param {number} delay - Il ritardo in millisecondi (default: 500ms)
 * @returns {any} - Il valore debounced
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Imposta un timer per aggiornare il valore debounced dopo il delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: cancella il timer se il valore cambia prima del delay
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;