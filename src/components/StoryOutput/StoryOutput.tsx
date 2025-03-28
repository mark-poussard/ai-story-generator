import React, { useState, useEffect, useCallback } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './StoryOutput.module.scss';

const StoryOutput: React.FC = () => {
    const { storyData, generateSuggestion, isAILoading, aiError } = useStoryContext();
    const [generatedStory, setGeneratedStory] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to construct the final prompt
    const constructFinalPrompt = useCallback((): string => {
        let prompt = `Write a ${storyData.storyType} in the ${storyData.genre} genre.\n\n`;

        if (storyData.briefSummary) {
            prompt += `**Brief Summary/Goal:**\n${storyData.briefSummary}\n\n`;
        }

        // Characters
        if (storyData.characters.length > 0) {
            prompt += "**Characters:**\n";
            storyData.characters.forEach(char => {
                prompt += `- **${char.name} (${char.role}):** ${char.description}\n`;
                // Include other character details if they exist
                Object.entries(char).forEach(([key, value]) => {
                    if (!['id', 'name', 'role', 'description'].includes(key) && value) {
                        prompt += `  - ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
                    }
                });
            });
            prompt += "\n";
        }

        // World Building
        prompt += "**World Details:**\n";
        prompt += `- Setting: ${storyData.world.settingDescription || 'Not specified'}\n`;
        if (storyData.world.rules) prompt += `- Rules/Magic System: ${storyData.world.rules}\n`;
        if (storyData.world.technologyLevel) prompt += `- Technology Level: ${storyData.world.technologyLevel}\n`;
        if (storyData.world.locations && storyData.world.locations.length > 0) {
             prompt += `- Key Locations:\n`;
             storyData.world.locations.forEach(loc => prompt += `  - ${loc.name}: ${loc.description}\n`);
        }
         // Include other world details
         Object.entries(storyData.world).forEach(([key, value]) => {
             if (!['settingDescription', 'rules', 'technologyLevel', 'locations'].includes(key) && value) {
                 prompt += `  - ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
             }
         });
        prompt += "\n";

        // Plot Points
        if (storyData.plotPoints.length > 0) {
            prompt += "**Plot Outline/Key Points:**\n";
            storyData.plotPoints.forEach((pp, index) => {
                prompt += `${index + 1}. ${pp.summary}\n`;
                if (pp.details) prompt += `   - Details: ${pp.details}\n`;
            });
            prompt += "\n";
        }

        // Final Notes
        if (storyData.finalPromptNotes) {
            prompt += `**Additional Notes/Instructions:**\n${storyData.finalPromptNotes}\n\n`;
        }

        prompt += "Now, please write the story based on all the details provided above.";
        return prompt;
    }, [storyData]);

    const handleGenerateStory = async () => {
        setIsGenerating(true);
        setGeneratedStory(null); // Clear previous story
        const prompt = constructFinalPrompt();
        const result = await generateSuggestion(prompt); // Use the context's generator
        setGeneratedStory(result);
        setIsGenerating(false);
    };

     // Optionally generate automatically when the component mounts/becomes visible
     // useEffect(() => {
     //    handleGenerateStory();
     // }, [constructFinalPrompt]); // Be careful with dependencies here

    return (
        <div className={styles.storyOutput}>
            <h2>Generate Your Story</h2>
            <p>Review your details below (or go back to edit). When ready, click Generate!</p>

             {/* Optional: Display a summary of the input data */}
             {/* <details className={styles.promptPreview}>
                <summary>View Full Prompt Details</summary>
                <pre>{constructFinalPrompt()}</pre>
             </details> */}

             <button
                onClick={handleGenerateStory}
                disabled={isGenerating || isAILoading}
                className={styles.generateButton}
            >
                {isGenerating || isAILoading ? <LoadingSpinner /> : 'Generate Story'}
            </button>

            {aiError && !isGenerating && <p className={styles.error}>Error generating story: {aiError}</p>}

            {(isGenerating || isAILoading) && <LoadingSpinner text="Generating story, this may take a moment..." />}

            {generatedStory && !isGenerating && (
                <div className={styles.storyResult}>
                    <h3>Generated Story:</h3>
                    {/* Render markdown or just plain text */}
                    <pre className={styles.storyText}>{generatedStory}</pre>
                    {/* Add copy button? */}
                </div>
            )}
             {!generatedStory && !isGenerating && !aiError && (
                 <p>Click the button above to generate the story based on your input.</p>
             )}
        </div>
    );
};

export default StoryOutput;