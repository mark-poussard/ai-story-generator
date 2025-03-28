import React, { useState, useEffect } from 'react';
import { StoryProvider, useStoryContext } from './context/StoryContext';
import ApiKeyInput from './components/ApiKeyInput/ApiKeyInput';
import StorySetup from './components/StorySetup/StorySetup';
import CharacterBuilder from './components/CharacterBuilder/CharacterBuilder';
import WorldBuilder from './components/WorldBuilder/WorldBuilder';
import PlotBuilder from './components/PlotBuilder/PlotBuilder';
import StoryOutput from './components/StoryOutput/StoryOutput';
import styles from './App.module.scss'; // Use CSS Modules for App-specific styles

// Define steps for navigation
type AppStep = 'apiKey' | 'setup' | 'characters' | 'world' | 'plot' | 'generate';

function AppContent() {
    const { storyData, isAIInitialized, aiError } = useStoryContext();
    const [currentStep, setCurrentStep] = useState<AppStep>(storyData.apiKey && isAIInitialized ? 'setup' : 'apiKey');

    useEffect(() => {
        // If API key is present and AI is initialized, advance to the setup step
        if (storyData.apiKey && isAIInitialized) {
            setCurrentStep('setup');
        } else {
            setCurrentStep('apiKey'); // Stay on API key input
        }
    }, [storyData.apiKey, isAIInitialized]);
    
    const handleApiKeySet = () => {
       //No action needed anymore due to useEffect doing the change

    };

    const nextStep = () => {
        switch (currentStep) {
            case 'apiKey': setCurrentStep('setup'); break;
            case 'setup': setCurrentStep('characters'); break;
            case 'characters': setCurrentStep('world'); break;
            case 'world': setCurrentStep('plot'); break;
            case 'plot': setCurrentStep('generate'); break;
            default: break;
        }
    };

    const prevStep = () => {
         switch (currentStep) {
            case 'setup': setCurrentStep('apiKey'); break; // Allow going back to change key
            case 'characters': setCurrentStep('setup'); break;
            case 'world': setCurrentStep('characters'); break;
            case 'plot': setCurrentStep('world'); break;
            case 'generate': setCurrentStep('plot'); break;
            default: break;
        }
    };

    return (
        <div className={styles.appContainer}>
            <header className={styles.header}>
                <h1>AI Story Generator</h1>
                {aiError && <p className={styles.errorBanner}>AI Error: {aiError}</p>}
            </header>

            <main className={styles.mainContent}>
                {currentStep === 'apiKey' && (
                    <ApiKeyInput onApiKeySet={handleApiKeySet} />
                )}

                {currentStep !== 'apiKey' && !isAIInitialized && (
                     <div className={styles.warning}>
                         <p>AI is not initialized. Please check your API Key.</p>
                         <button onClick={() => setCurrentStep('apiKey')}>Set API Key</button>
                    </div>
                )}

                {isAIInitialized && (
                    <>
                        {currentStep === 'setup' && <StorySetup />}
                        {currentStep === 'characters' && <CharacterBuilder />}
                        {currentStep === 'world' && <WorldBuilder />}
                        {currentStep === 'plot' && <PlotBuilder />}
                        {currentStep === 'generate' && <StoryOutput />}

                        <nav className={styles.navigation}>
                            {currentStep !== 'apiKey' && currentStep !== 'setup' && (
                                <button onClick={prevStep} className={styles.navButton}>Previous</button>
                            )}
                             {currentStep !== 'apiKey' && currentStep !== 'generate' && (
                                <button onClick={nextStep} className={styles.navButton} disabled={!isAIInitialized}>Next</button>
                            )}
                             {currentStep === 'generate' && (
                                <button onClick={prevStep} className={styles.navButton}>Back to Edit</button>
                             )}
                        </nav>
                    </>
                )}
            </main>

            <footer className={styles.footer}>
                <p>Powered by Google Generative AI</p>
                 {currentStep !== 'apiKey' && <button onClick={() => setCurrentStep('apiKey')} className={styles.footerLink}>Change API Key</button>}
            </footer>
        </div>
    );
}


// Wrap AppContent with the provider
function App() {
    return (
        <StoryProvider>
            <AppContent />
        </StoryProvider>
    );
}

export default App;