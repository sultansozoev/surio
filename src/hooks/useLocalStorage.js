import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue, options = {}) => {
    const {
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        syncAcrossTabs = true,
    } = options;

    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) {
                if (initialValue !== undefined) {
                    window.localStorage.setItem(key, serialize(initialValue));
                }
                return initialValue;
            }
            return deserialize(item);
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if (valueToStore === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, serialize(valueToStore));
            }

            if (syncAcrossTabs) {
                window.dispatchEvent(new CustomEvent('local-storage-change', {
                    detail: { key, value: valueToStore }
                }));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, serialize, storedValue, syncAcrossTabs]);

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(undefined);

            if (syncAcrossTabs) {
                window.dispatchEvent(new CustomEvent('local-storage-change', {
                    detail: { key, value: undefined }
                }));
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, syncAcrossTabs]);

    useEffect(() => {
        if (!syncAcrossTabs) return;

        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== serialize(storedValue)) {
                try {
                    const newValue = e.newValue === null ? undefined : deserialize(e.newValue);
                    setStoredValue(newValue);
                } catch (error) {
                    console.error(`Error deserializing localStorage value for key "${key}":`, error);
                }
            }
        };

        const handleCustomStorageChange = (e) => {
            if (e.detail.key === key) {
                setStoredValue(e.detail.value);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-change', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-change', handleCustomStorageChange);
        };
    }, [key, serialize, deserialize, storedValue, syncAcrossTabs]);

    return [storedValue, setValue, removeValue];
};
export default useLocalStorage;
