// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue, options = {}) => {
    const {
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        syncAcrossTabs = true,
    } = options;

    // Stato interno
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) {
                // Se l'item non esiste, salva il valore iniziale
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

    // Funzione per aggiornare il valore
    const setValue = useCallback((value) => {
        try {
            // Permetti value di essere una funzione così possiamo usare la sintassi di setState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if (valueToStore === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, serialize(valueToStore));
            }

            // Dispatch custom event per sincronizzazione cross-tab
            if (syncAcrossTabs) {
                window.dispatchEvent(new CustomEvent('local-storage-change', {
                    detail: { key, value: valueToStore }
                }));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, serialize, storedValue, syncAcrossTabs]);

    // Funzione per rimuovere il valore
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

    // Listener per storage events (sincronizzazione cross-tab)
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

// Hook specializzato per array
export const useLocalStorageArray = (key, initialArray = []) => {
    const [array, setArray, removeArray] = useLocalStorage(key, initialArray);

    const addItem = useCallback((item) => {
        setArray(currentArray => {
            const newArray = Array.isArray(currentArray) ? [...currentArray] : [];
            return [...newArray, item];
        });
    }, [setArray]);

    const removeItem = useCallback((index) => {
        setArray(currentArray => {
            const newArray = Array.isArray(currentArray) ? [...currentArray] : [];
            newArray.splice(index, 1);
            return newArray;
        });
    }, [setArray]);

    const updateItem = useCallback((index, item) => {
        setArray(currentArray => {
            const newArray = Array.isArray(currentArray) ? [...currentArray] : [];
            newArray[index] = item;
            return newArray;
        });
    }, [setArray]);

    const findItem = useCallback((predicate) => {
        return Array.isArray(array) ? array.find(predicate) : undefined;
    }, [array]);

    const clearArray = useCallback(() => {
        setArray([]);
    }, [setArray]);

    return {
        array: Array.isArray(array) ? array : [],
        setArray,
        addItem,
        removeItem,
        updateItem,
        findItem,
        clearArray,
        removeArray,
    };
};

// Hook per oggetti con merge
export const useLocalStorageObject = (key, initialObject = {}) => {
    const [object, setObject, removeObject] = useLocalStorage(key, initialObject);

    const updateProperty = useCallback((property, value) => {
        setObject(currentObject => ({
            ...(typeof currentObject === 'object' && currentObject !== null ? currentObject : {}),
            [property]: value,
        }));
    }, [setObject]);

    const removeProperty = useCallback((property) => {
        setObject(currentObject => {
            if (typeof currentObject !== 'object' || currentObject === null) {
                return {};
            }
            const newObject = { ...currentObject };
            delete newObject[property];
            return newObject;
        });
    }, [setObject]);

    const mergeObject = useCallback((newData) => {
        setObject(currentObject => ({
            ...(typeof currentObject === 'object' && currentObject !== null ? currentObject : {}),
            ...newData,
        }));
    }, [setObject]);

    return {
        object: typeof object === 'object' && object !== null ? object : {},
        setObject,
        updateProperty,
        removeProperty,
        mergeObject,
        removeObject,
    };
};

export default useLocalStorage;
