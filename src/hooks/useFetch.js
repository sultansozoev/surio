import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const {
        immediate = true,
        onSuccess,
        onError,
        transform,
        dependencies = [],
        cacheKey,
        cacheTime = 5 * 60 * 1000,
    } = options;

    const cache = useRef(new Map());

    const execute = useCallback(async (executeUrl = url, executeOptions = {}) => {
        if (!executeUrl) return;

        if (cacheKey && cache.current.has(cacheKey)) {
            const cached = cache.current.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheTime) {
                setData(cached.data);
                setLoading(false);
                setError(null);
                return cached.data;
            }
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
            let result;
            const requestMethod = executeOptions.method;
            const requestBody = executeOptions.body;
            const requestParams = executeOptions.params;

            if (requestMethod === 'POST') {
                result = await api.post(executeUrl, requestBody);
            } else if (requestMethod === 'PUT') {
                result = await api.put(executeUrl, requestBody);
            } else if (requestMethod === 'DELETE') {
                result = await api.delete(executeUrl);
            } else {
                result = await api.get(executeUrl, requestParams);
            }

            const transformedData = transform ? transform(result) : result;

            setData(transformedData);

            if (cacheKey) {
                cache.current.set(cacheKey, {
                    data: transformedData,
                    timestamp: Date.now(),
                });
            }

            if (onSuccess) {
                onSuccess(transformedData);
            }

            return transformedData;
        } catch (err) {
            if (err.name === 'AbortError') {
                return;
            }

            const errorMessage = err.message || 'Errore durante il caricamento';
            setError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }

            throw err;
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [url, transform, onSuccess, onError, cacheKey, cacheTime]);

    useEffect(() => {
        if (immediate && url) {
            execute();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [immediate, ...dependencies]);

    const refetch = useCallback((newUrl, newOptions) => {
        return execute(newUrl, newOptions);
    }, [execute]);

    const post = useCallback((postData, postUrl = url) => {
        return execute(postUrl, {
            method: 'POST',
            body: postData,
        });
    }, [execute, url]);

    const put = useCallback((putData, putUrl = url) => {
        return execute(putUrl, {
            method: 'PUT',
            body: putData,
        });
    }, [execute, url]);

    const del = useCallback((deleteUrl = url) => {
        return execute(deleteUrl, {
            method: 'DELETE',
        });
    }, [execute, url]);

    const clearCache = useCallback(() => {
        if (cacheKey) {
            cache.current.delete(cacheKey);
        }
    }, [cacheKey]);

    const clearAllCache = useCallback(() => {
        cache.current.clear();
    }, []);

    return {
        data,
        loading,
        error,
        execute,
        refetch,
        post,
        put,
        delete: del,
        clearCache,
        clearAllCache,
    };
};

export default useFetch;
