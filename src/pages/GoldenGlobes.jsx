import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Star, Check, Lock, Loader } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import '../styles/goldenglobes.css';

// ========================================
// API Configuration
// ========================================
const API_BASE_URL = 'https://surio.ddns.net:4000/api/golden-globes';
const CURRENT_YEAR = 2026;

const NomineeCard = ({ nominee, isSelected, onSelect, isLocked, categoryId }) => {
    // Determine display name and subtitle based on available data
    const displayName = nominee.title || nominee.person_name || nominee.movie_title || nominee.serie_title || 'Sconosciuto';
    
    // Build subtitle dynamically
    let subtitle = null;
    if (nominee.additional_info) {
        // Parse additional_info if it's a string
        const info = typeof nominee.additional_info === 'string' 
            ? JSON.parse(nominee.additional_info) 
            : nominee.additional_info;
        
        subtitle = info.director || info.artist || info.writer || info.platform || info.country || info.movie_title || info.series;
    }
    
    // Fallback subtitle from direct fields
    if (!subtitle) {
        subtitle = nominee.person_name || nominee.movie_title || nominee.serie_title;
    }

    // Get image URL with fallback
    const imageUrl = nominee.image_url || nominee.movie_poster || nominee.serie_poster || 
                     'https://via.placeholder.com/500x750?text=No+Image';

    return (
        <motion.div
            className={`nominee-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => !isLocked && onSelect(nominee.nomination_id)}
            whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
            whileTap={!isLocked ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="nominee-image-container">
                <img 
                    src={imageUrl} 
                    alt={displayName} 
                    className="nominee-image"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                    }}
                />
                <div className="nominee-overlay">
                    {isSelected && (
                        <motion.div
                            className="selected-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Check size={32} />
                        </motion.div>
                    )}
                    {isLocked && (
                        <div className="locked-badge">
                            <Lock size={24} />
                        </div>
                    )}
                </div>
            </div>
            <div className="nominee-info">
                <h4 className="nominee-name">{displayName}</h4>
                {subtitle && <p className="nominee-subtitle">{subtitle}</p>}
            </div>
            {isSelected && !isLocked && (
                <motion.div
                    className="golden-glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            )}
        </motion.div>
    );
};

const AwardCategory = ({ category, selectedNominee, onSelectNominee, isLocked }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <motion.div
            className="award-category"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="category-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="category-title-container">
                    <Award className="category-icon" size={28} />
                    <h3 className="category-title">{category.category_name}</h3>
                </div>
                <div className="category-status">
                    {selectedNominee && (
                        <motion.div
                            className="selected-indicator"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <Star size={20} fill="gold" color="gold" />
                        </motion.div>
                    )}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="expand-icon"
                    >
                        ▼
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="nominees-grid"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {category.nominees.map((nominee) => (
                            <NomineeCard
                                key={nominee.nomination_id}
                                nominee={nominee}
                                isSelected={selectedNominee === nominee.nomination_id}
                                onSelect={(id) => onSelectNominee(category.category_id, id)}
                                isLocked={isLocked}
                                categoryId={category.category_id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const GoldenGlobes = () => {
    const { loading: authLoading } = useAuth();
    
    // State management
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selections, setSelections] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [userPredictions, setUserPredictions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // ========================================
    // API CALLS
    // ========================================
    
    // Fetch categories and nominations
    const fetchNominations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(
                `${API_BASE_URL}/${CURRENT_YEAR}/nominations-by-category`
            );

            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                throw new Error('Failed to fetch nominations');
            }
        } catch (err) {
            console.error('Error fetching nominations:', err);
            setError(err.message || 'Errore nel caricamento delle nomination. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's predictions
    const fetchUserPredictions = async () => {
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/${CURRENT_YEAR}/my-predictions`
            );
            
            if (response.data.success) {
                setUserPredictions(response.data.data);
                
                // Map predictions to selections format
                const predictionsMap = {};
                response.data.data.forEach(pred => {
                    predictionsMap[pred.category_id] = pred.nomination_id;
                });
                
                setSelections(predictionsMap);
                setIsSubmitted(Object.keys(predictionsMap).length > 0);
            }
        } catch (err) {
            console.error('Error fetching user predictions:', err);
        }
    };

    // Save predictions to backend
    const savePredictions = async () => {
        try {
            setIsSaving(true);
            
            // Convert selections to array format
            const predictions = Object.keys(selections).map(categoryId => ({
                category_id: parseInt(categoryId),
                nomination_id: selections[categoryId]
            }));

            const response = await axiosInstance.post(
                `${API_BASE_URL}/${CURRENT_YEAR}/predict`,
                { predictions }
            );

            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.error || 'Failed to save predictions');
            }
        } catch (err) {
            console.error('Error saving predictions:', err);
            alert('Errore nel salvataggio delle previsioni. Riprova.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // ========================================
    // EFFECTS
    // ========================================
    
    useEffect(() => {
        // Aspetta che l'AuthContext abbia finito di caricare
        if (!authLoading) {
            fetchNominations();
        }
    }, [authLoading]);

    useEffect(() => {
        if (categories.length > 0) {
            fetchUserPredictions();
        }
    }, [categories]);

    // ========================================
    // HANDLERS
    // ========================================
    
    const handleSelectNominee = (categoryId, nomineeId) => {
        if (isSubmitted) return;
        
        setSelections((prev) => ({
            ...prev,
            [categoryId]: nomineeId
        }));
    };

    const handleSubmit = async () => {
        const allSelected = categories.every((cat) => selections[cat.category_id]);
        
        if (!allSelected) {
            alert('Seleziona un vincitore per ogni categoria prima di inviare!');
            return;
        }

        const success = await savePredictions();
        
        if (success) {
            setIsSubmitted(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            
            // Refresh predictions
            fetchUserPredictions();
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Sei sicuro di voler modificare le tue previsioni?')) {
            return;
        }
        
        setIsSubmitted(false);
        setShowConfetti(false);
    };

    // ========================================
    // COMPUTED VALUES
    // ========================================
    
    const selectedCount = Object.keys(selections).length;
    const totalCategories = categories.length;
    const progress = totalCategories > 0 ? (selectedCount / totalCategories) * 100 : 0;

    // ========================================
    // LOADING & ERROR STATES
    // ========================================
    
    if (authLoading || loading) {
        return (
            <div className="golden-globes-page">
                <div className="loading-container">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader size={64} />
                    </motion.div>
                    <p>{authLoading ? 'Verifica autenticazione...' : 'Caricamento nomination Golden Globes 2026...'}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="golden-globes-page">
                <div className="error-container">
                    <Trophy size={64} className="error-icon" />
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={fetchNominations} className="retry-btn">
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="golden-globes-page">
                <div className="error-container">
                    <Trophy size={64} />
                    <h2>Nessuna Nomination Disponibile</h2>
                    <p>Le nomination per i Golden Globes 2026 non sono ancora state pubblicate.</p>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDER
    // ========================================
    
    return (
        <div className="golden-globes-page">
            {showConfetti && <div className="confetti-container" />}
            
            <div className="gg-hero">
                <motion.div
                    className="gg-hero-content"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Trophy className="gg-hero-icon" size={80} />
                    <h1 className="gg-title">Golden Globes 2026</h1>
                    <p className="gg-subtitle">Scegli i tuoi vincitori preferiti</p>
                </motion.div>

                <div className="gg-progress-container">
                    <div className="progress-info">
                        <span className="progress-text">
                            {selectedCount} / {totalCategories} categorie completate
                        </span>
                        <span className="progress-percentage">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            <div className="gg-container">
                <div className="categories-list">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.category_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <AwardCategory
                                category={category}
                                selectedNominee={selections[category.category_id]}
                                onSelectNominee={handleSelectNominee}
                                isLocked={isSubmitted}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="gg-actions">
                    {!isSubmitted ? (
                        <motion.button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={selectedCount < totalCategories || isSaving}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSaving ? (
                                <>
                                    <Loader size={24} className="spinning" />
                                    Salvataggio...
                                </>
                            ) : (
                                <>
                                    <Trophy size={24} />
                                    Invia Previsioni ({selectedCount}/{totalCategories})
                                </>
                            )}
                        </motion.button>
                    ) : (
                        <div className="submitted-actions">
                            <motion.div
                                className="submitted-message"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                            >
                                <Check size={32} />
                                <span>Previsioni Salvate!</span>
                            </motion.div>
                            <motion.button
                                className="reset-btn"
                                onClick={handleReset}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Modifica Previsioni
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoldenGlobes;
