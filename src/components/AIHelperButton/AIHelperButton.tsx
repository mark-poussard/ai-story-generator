import React, { useState } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'; // Assuming this component exists
import styles from './AIHelperButton.module.scss';

interface AIHelperButtonProps {
    promptContext: string; // The specific context for the AI prompt
    onSuggestion: (suggestions: string[]) => void; // Callback with the AI's suggestion
    buttonText?: string;
    disabled?: boolean;
    suggestionPrefix?: string; // Text to prepend to the prompt (e.g., "Generate 3 ideas for...")
}

const AIHelperButton: React.FC<AIHelperButtonProps> = ({
    promptContext,
    onSuggestion,
    buttonText = "Get AI Suggestion",
    disabled = false,
    suggestionPrefix = "Generate a creative suggestion based on this context: "
}) => {
    const { generateSuggestion, isAILoading, aiError: contextAiError } = useStoryContext();
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleClick = async () => {
        setLocalLoading(true);
        setLocalError(null);
        const fullPrompt = `${suggestionPrefix}\n\nContext:\n${promptContext}`;

        const suggestion = await generateSuggestion(fullPrompt);
        setLocalLoading(false);

        if (suggestion) {
            onSuggestion(suggestion);
        } else {
            // Error handled by context, but set local error too for direct feedback
            setLocalError(contextAiError || "Failed to get suggestion.");
        }
    };

    // Disable if AI is loading globally OR locally OR if explicitly disabled
    const isDisabled = isAILoading || localLoading || disabled;

    return (
        <div className={styles.aiHelper}>
            <button
                onClick={handleClick}
                disabled={isDisabled}
                className={styles.aiButton}
                title={promptContext} // Show context on hover
            >
                {localLoading ? <LoadingSpinner size="small" /> : buttonText}
            </button>
            {localError && <p className={styles.error}>{localError}</p>}
        </div>
    );
};

export default AIHelperButton;