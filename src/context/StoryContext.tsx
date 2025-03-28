import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { StoryData, Character, World, PlotPoint, initialStoryData, initialWorld } from '../types/story';
import { useGeminiAI } from '../hooks/useGeminiAI';

interface StoryContextProps {
    storyData: StoryData;
    updateStoryData: (field: keyof StoryData, value: any) => void;
    addCharacter: (character: Character) => void;
    updateCharacter: (id: string, updatedCharacter: Partial<Character>) => void;
    removeCharacter: (id: string) => void;
    addPlotPoint: (plotPoint: PlotPoint) => void;
    updatePlotPoint: (id: string, updatedPlotPoint: Partial<PlotPoint>) => void;
    removePlotPoint: (id: string) => void;
    updateWorld: (field: keyof World, value: any) => void;
    resetStory: () => void;
    setApiKey: (key: string) => void;
    generateSuggestion: (prompt: string) => Promise<string[] | null>;
    isAILoading: boolean;
    aiError: string | null;
    isAIInitialized: boolean;
}

const StoryContext = createContext<StoryContextProps | undefined>(undefined);

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [storyData, setStoryData] = useState<StoryData>({
        ...initialStoryData,
        apiKey: localStorage.getItem('geminiApiKey') || undefined, // Load from storage
    });

    const { generateContent, loading: isAILoading, error: aiError, isInitialized: isAIInitialized } = useGeminiAI(storyData.apiKey);

    const setApiKey = useCallback((key: string) => {
        // Basic security warning
        console.warn("Storing API Key in localStorage is insecure for production applications.");
        localStorage.setItem('geminiApiKey', key);
        setStoryData(prev => ({ ...prev, apiKey: key }));
    }, []);

    const updateStoryData = useCallback((field: keyof StoryData, value: any) => {
        setStoryData(prev => ({ ...prev, [field]: value }));
    }, []);

    // --- Character Management ---
    const addCharacter = useCallback((character: Character) => {
        setStoryData(prev => ({ ...prev, characters: [...prev.characters, character] }));
    }, []);

    const updateCharacter = useCallback((id: string, updatedCharacter: Partial<Character>) => {
        setStoryData(prev => ({
            ...prev,
            characters: prev.characters.map(char =>
                char.id === id ? { ...char, ...updatedCharacter } : char
            ),
        }));
    }, []);

     const removeCharacter = useCallback((id: string) => {
        setStoryData(prev => ({
            ...prev,
            characters: prev.characters.filter(char => char.id !== id),
        }));
    }, []);

    // --- Plot Point Management ---
     const addPlotPoint = useCallback((plotPoint: PlotPoint) => {
        setStoryData(prev => ({ ...prev, plotPoints: [...prev.plotPoints, plotPoint] }));
    }, []);

    const updatePlotPoint = useCallback((id: string, updatedPlotPoint: Partial<PlotPoint>) => {
        setStoryData(prev => ({
            ...prev,
            plotPoints: prev.plotPoints.map(pp =>
                pp.id === id ? { ...pp, ...updatedPlotPoint } : pp
            ),
        }));
    }, []);

     const removePlotPoint = useCallback((id: string) => {
        setStoryData(prev => ({
            ...prev,
            plotPoints: prev.plotPoints.filter(pp => pp.id !== id),
        }));
    }, []);

    // --- World Management ---
    const updateWorld = useCallback((field: keyof World, value: any) => {
        setStoryData(prev => ({
            ...prev,
            world: { ...prev.world, [field]: value },
        }));
    }, []);

     // --- Reset ---
    const resetStory = useCallback(() => {
        setStoryData(prev => ({
            ...initialStoryData,
            apiKey: prev.apiKey, // Keep the API key
            world: { ...initialWorld }, // Ensure world is fully reset
            characters: [], // Ensure arrays are empty
            plotPoints: [],
        }));
    }, []);

    const contextValue = useMemo(() => ({
        storyData,
        updateStoryData,
        addCharacter,
        updateCharacter,
        removeCharacter,
        addPlotPoint,
        updatePlotPoint,
        removePlotPoint,
        updateWorld,
        resetStory,
        setApiKey,
        generateSuggestion: generateContent, // Pass down the hook's function
        isAILoading,
        aiError,
        isAIInitialized,
    }), [
        storyData, updateStoryData, addCharacter, updateCharacter, removeCharacter,
        addPlotPoint, updatePlotPoint, removePlotPoint, updateWorld, resetStory,
        setApiKey, generateContent, isAILoading, aiError, isAIInitialized
    ]);


    return (
        <StoryContext.Provider value={contextValue}>
            {children}
        </StoryContext.Provider>
    );
};

export const useStoryContext = () => {
    const context = useContext(StoryContext);
    if (context === undefined) {
        throw new Error('useStoryContext must be used within a StoryProvider');
    }
    return context;
};