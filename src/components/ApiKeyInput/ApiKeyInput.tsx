import React, { useState, useEffect } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import styles from './ApiKeyInput.module.scss'; // Use CSS Modules

interface ApiKeyInputProps {
    onApiKeySet: () => void; // Callback when key is potentially set successfully
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
    const { storyData, setApiKey, aiError, isAIInitialized } = useStoryContext();
    const [key, setKey] = useState(storyData.apiKey || '');
    const [localError, setLocalError] = useState<string | null>(null);

     // Update local state if context changes (e.g., loaded from localStorage)
    useEffect(() => {
        setKey(storyData.apiKey || '');
    }, [storyData.apiKey]);

    // Display AI initialization errors
    useEffect(() => {
        if(aiError && !isAIInitialized && key) { // Only show error if key is entered but init failed
             setLocalError(`API Key Check Failed: ${aiError}. Please verify your key.`);
        } else {
            setLocalError(null); // Clear local error if AI initializes or key is cleared
        }
    }, [aiError, isAIInitialized, key]);


    const handleSave = () => {
        setLocalError(null); // Clear previous errors
        if (!key.trim()) {
            setLocalError("API Key cannot be empty.");
            return;
        }
        setApiKey(key.trim());
        // We don't know immediately if it's valid, the hook will update `isAIInitialized` and `aiError`
        // Call the callback to potentially trigger navigation in App.tsx
        onApiKeySet();
    };

    return (
        <div className={styles.apiKeyContainer}>
            <h2>Enter Your Google AI Studio API Key</h2>
            <p className={styles.warning}>
                <strong>Security Warning:</strong> For development purposes only. Avoid committing your API key or deploying this code publicly with the key stored in the browser. Use a backend proxy for production.
            </p>
            <div className={styles.inputGroup}>
                <label htmlFor="apiKey">API Key:</label>
                <input
                    type="password" // Use password type to obscure
                    id="apiKey"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Paste your API key here"
                    className={styles.apiKeyInput}
                />
                 <button onClick={handleSave} className={styles.saveButton}>Save and Continue</button>
            </div>
            {localError && <p className={styles.error}>{localError}</p>}
            {!localError && isAIInitialized && key && <p className={styles.success}>API Key accepted and AI initialized.</p>}

            <p>You can generate an API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</p>
        </div>
    );
};

export default ApiKeyInput;