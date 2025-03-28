import React, { useState, useEffect, useCallback } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './AIHelperButton.module.scss';

interface AIHelperButtonProps {
    promptContext: string;
    onSuggestion: (suggestion: string) => void;
    buttonText?: string;
    disabled?: boolean;
    suggestionPrefix?: string;
    numSuggestions?: number;
    modalTitle?: string;
}

const AIHelperButton: React.FC<AIHelperButtonProps> = ({
    promptContext,
    onSuggestion,
    buttonText = "Get AI Suggestions",
    disabled = false,
    suggestionPrefix = "Generate creative suggestions based on this context: ",
    numSuggestions = 3,
    modalTitle = "AI Suggestions"
}) => {
    const { generateSuggestions, isAILoading: contextIsLoading, aiError: contextAiError } = useStoryContext();

    // --- State ---
    const [localLoading, setLocalLoading] = useState(false); // Loading for initial fetch
    const [localError, setLocalError] = useState<string | null>(null); // Error displayed near button

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false); // Loading state for refresh inside modal
    const [modalError, setModalError] = useState<string | null>(null); // Error displayed inside modal
    // --- End State ---


    // Combined loading state for the main button
    const isInitialLoading = contextIsLoading || localLoading;

    // --- Fetch Logic (used for initial and refresh) ---
    const fetchSuggestions = async (isRefresh: boolean = false) => {
        const setLoading = isRefresh ? setIsRefreshing : setLocalLoading;
        const setError = isRefresh ? setModalError : setLocalError;

        setLoading(true);
        setError(null); // Clear previous relevant error
        if (!isRefresh) {
             // Clear modal state only on initial fetch
             setCurrentSuggestions([]);
             setModalError(null);
             setIsRefreshing(false); // Ensure refresh state is off
        }

        // --- Modify prompt slightly for refresh to encourage different results ---
        const refreshInstructionPart = isRefresh
            ? `\n\nPlease provide ${numSuggestions} *different* or *alternative* distinct suggestion${numSuggestions > 1 ? 's' : ''}`
            : `\n\nPlease provide ${numSuggestions} distinct suggestion${numSuggestions > 1 ? 's' : ''}`;
        const jsonInstruction = `${refreshInstructionPart} formatted as a JSON array of strings. Ensure the output is ONLY the JSON array. Example: ["suggestion 1", "suggestion 2"]`;
        // ---

        const fullPrompt = `${suggestionPrefix}\n\nContext:\n${promptContext}\n${jsonInstruction}`;

        const suggestions = await generateSuggestions(fullPrompt);
        setLoading(false);

        if (suggestions) {
            if (suggestions.length > 0) {
                setCurrentSuggestions(suggestions);
                if (!isRefresh) {
                    setIsModalOpen(true); // Open modal only on initial successful fetch
                }
            } else {
                setError(isRefresh ? "The AI didn't provide any new suggestions." : "The AI didn't provide any suggestions.");
            }
        } else {
            // Hook likely set contextAiError, use that or a generic message
            setError(contextAiError || `Failed to get ${isRefresh ? 'new ' : ''}suggestions.`);
        }
    };

    // --- Event Handlers ---
    const handleInitialFetch = () => {
        if (isInitialLoading) return;
        fetchSuggestions(false); // False indicates it's the initial fetch
    };

    const handleRefresh = () => {
        if (isRefreshing || contextIsLoading) return; // Prevent concurrent refreshes or if context is busy
        fetchSuggestions(true); // True indicates it's a refresh
    };

    const handleSelectSuggestion = (selected: string) => {
        onSuggestion(selected);
        handleCloseModal(); // Close modal after selection
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSuggestions([]);
        // Reset modal-specific states on close
        setIsRefreshing(false);
        setModalError(null);
        // Keep localError related to the button click as is
    };

    // --- Keyboard Listener Effect ---
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleCloseModal();
        }
    }, []); // Define once

    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen, handleKeyDown]);

    // Determine combined disabled state for the main button
    const isButtonDisabled = disabled || isInitialLoading;

    return (
        <div className={styles.aiHelper}>
            {/* --- Main Button --- */}
            <button
                onClick={handleInitialFetch}
                disabled={isButtonDisabled}
                className={styles.aiButton}
                title={promptContext}
            >
                {isInitialLoading ? <LoadingSpinner size="small" /> : buttonText}
            </button>

            {/* --- Error near button (only if modal isn't open) --- */}
            {!isModalOpen && localError && <p className={styles.error}>{localError}</p>}
            {!isModalOpen && !localLoading && !localError && contextAiError && <p className={styles.error}>{contextAiError}</p>}


            {/* --- Modal Popup --- */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal} role="dialog" aria-modal="true">
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} >
                        {/* -- Modal Header -- */}
                        <div className={styles.modalHeader}>
                            <h3>{modalTitle}</h3>
                            <button onClick={handleCloseModal} className={styles.closeButton} aria-label="Close suggestions">×</button>
                        </div>

                        {/* -- Suggestions List -- */}
                        <ul className={styles.suggestionList}>
                            {currentSuggestions.length > 0 ? (
                                currentSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index} // Note: Using index is okay here as list won't drastically reorder on refresh
                                        className={styles.suggestionItem}
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectSuggestion(suggestion); }}
                                    >
                                        {suggestion}
                                    </li>
                                ))
                            ) : (
                                // Show only if not currently refreshing
                                !isRefreshing && <li className={styles.noSuggestions}>No suggestions available.</li>
                            )}
                            {/* Show loading spinner within list area during refresh */}
                            {isRefreshing && (
                                <li className={styles.refreshingIndicator}>
                                    <LoadingSpinner size="medium" text="Getting more suggestions..." />
                                </li>
                             )}
                        </ul>

                        {/* -- Modal Footer (for refresh button and errors) -- */}
                        <div className={styles.modalFooter}>
                            {/* Display modal-specific error */}
                            {modalError && <p className={styles.modalErrorText}>{modalError}</p>}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing || contextIsLoading} // Disable if refresh or context is busy
                                className={styles.refreshButton}
                            >
                                {isRefreshing ? <LoadingSpinner size="small" /> : "Get More Suggestions"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- End Modal Popup --- */}
        </div>
    );
};

export default AIHelperButton;