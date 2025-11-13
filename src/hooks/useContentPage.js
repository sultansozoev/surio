import { useState } from 'react';
import useFetch from './useFetch';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook per gestire la logica comune delle pagine di contenuti (Movies/Series)
 * @param {Object} config - Configurazione del hook
 * @param {string} config.type - Tipo di contenuto ('movie' o 'series')
 * @param {Object} config.endpoints - Oggetto con gli endpoint API
 * @param {string} config.endpoints.genres - Endpoint per recuperare i generi
 * @param {string} config.endpoints.all - Endpoint per tutti i contenuti
 * @param {Function} config.endpoints.byGenre - Funzione che ritorna l'endpoint per un genere specifico
 * @param {number} config.itemsPerPage - Numero di elementi per pagina (default: 24)
 */
export const useContentPage = ({ type, endpoints, itemsPerPage = 24 }) => {
    // Usa solo localStorage per la persistenza, senza URL params
    const [selectedGenre, setSelectedGenre] = useLocalStorage(`${type}-genre`, '');
    const [sortBy, setSortBy] = useLocalStorage(`${type}-sort`, 'popularity');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useLocalStorage(`${type}-view`, 'grid');

    // Fetch dei generi
    const { data: genres } = useFetch(endpoints.genres, {
        immediate: true,
        cacheKey: `${type}-genres`,
        cacheTime: 30 * 60 * 1000,
    });

    // Determina l'endpoint da usare in base al genere selezionato
    const getContentEndpoint = () => {
        if (selectedGenre) {
            return endpoints.byGenre(selectedGenre);
        }
        return endpoints.all;
    };

    // Fetch del contenuto principale
    const {
        data: content,
        loading: contentLoading,
        error: contentError,
        refetch: refetchContent
    } = useFetch(getContentEndpoint(), {
        immediate: true,
        cacheKey: `${type}-${selectedGenre}`,
        cacheTime: 10 * 60 * 1000,
        dependencies: [selectedGenre],
    });

    // Ottieni i dati correnti
    const getCurrentData = () => {
        return content || [];
    };

    // Ordina e pagina i dati
    const getSortedAndPaginatedData = () => {
        let data = [...getCurrentData()];

        data.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'release_date':
                    return new Date(b.release_date) - new Date(a.release_date);
                case 'vote_average':
                    return (b.vote_average || 0) - (a.vote_average || 0);
                case 'added_date':
                    return new Date(b.added_date) - new Date(a.added_date);
                case 'popularity':
                default:
                    return (b.popularity || 0) - (a.popularity || 0);
            }
        });

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            items: data.slice(startIndex, endIndex),
            totalItems: data.length,
            totalPages: Math.ceil(data.length / itemsPerPage)
        };
    };

    const { items: displayedItems, totalItems, totalPages } = getSortedAndPaginatedData();

    // Handler per cambio genere
    const handleGenreChange = (genreId) => {
        const newGenreId = genreId ? genreId.toString() : '';

        // Aggiorna lo stato (che automaticamente salva in localStorage)
        setSelectedGenre(newGenreId);
        setCurrentPage(1);
    };

    // Handler per cambio ordinamento
    const handleSortChange = (sort) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    // Handler per cambio pagina
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isLoading = contentLoading;
    const hasError = contentError;

    return {
        // State
        selectedGenre,
        sortBy,
        currentPage,
        viewMode,
        genres,
        displayedItems,
        totalItems,
        totalPages,
        isLoading,
        hasError,

        // Handlers
        handleGenreChange,
        handleSortChange,
        handlePageChange,
        setViewMode,
        refetchContent,
    };
};