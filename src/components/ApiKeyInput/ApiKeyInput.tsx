import React, { useState, useEffect } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import styles from './ApiKeyInput.module.scss'; // Use CSS Modules

interface ApiKeyInputProps {
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ }) => {
    const { storyData, setApiKey, aiError, isAIInitialized } = useStoryContext();
    const [key, setKey] = useState(storyData.apiKey || '');
    const [saveKey, setSaveKey] = useState(false);
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
        setApiKey(key.trim(), saveKey);
    };

    return (
        <div className={styles.apiKeyContainer}>
            <h2>Enter Your Google AI Studio API Key</h2>

            {saveKey && <p className={styles.warning}>
                <strong>Security Warning:</strong> The API key will be saved in your browser local cache.
            </p>}
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
            <div className={styles.saveKeyInputGroup}>
                <label htmlFor="saveKey">Save API Key to local storage:</label>
                <input
                    type="checkbox" // Use password type to obscure
                    id="saveKey"
                    checked={saveKey}
                    onChange={(e) => setSaveKey(e.target.checked)}
                    className={styles.apiKeyInput}
                />
            </div>
            {localError && <p className={styles.error}>{localError}</p>}
            {!localError && isAIInitialized && key && <p className={styles.success}>API Key accepted and AI initialized.</p>}

            <p>You can generate an API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</p>
        </div>
    );
};

export default ApiKeyInput;