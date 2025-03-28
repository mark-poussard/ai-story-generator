import React from 'react';
import { useStoryContext } from '../../context/StoryContext';
import styles from './StorySetup.module.scss';
import AIHelperButton from '../AIHelperButton/AIHelperButton';
import { StoryData } from '../../types/story'; // Import StoryData type

// Define the fields we are handling here for type safety
type KnownSetupField = 'storyType' | 'genre' | 'briefSummary';


const StorySetup: React.FC = () => {
    const { storyData, updateStoryData } = useStoryContext();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateStoryData(name as keyof StoryData, value);
    };

    // Handle updates via AI suggestion
    const handleSuggestion = (field: keyof StoryData, suggestion: string) => {
        updateStoryData(field, suggestion);
    };

     // --- AI Context Generation ---
    const getAIContext = (field: KnownSetupField): string => {
        let context = "Starting a new story.\n";
        if (field === 'briefSummary' && (storyData.genre || storyData.storyType)) {
             context += `Looking for a summary for a ${storyData.storyType} in the ${storyData.genre} genre.`
        }
        return context;
    }

    const getGenreAIContext = () => {
        return storyData.genre ? `Draft genre : ${storyData.genre}\n` : '';
    }

    const getBriefAIContext = () => {
        return `Story genre : ${storyData.genre}\n` + (storyData.briefSummary ? `Current summary : ${storyData.briefSummary}.\n` : '');
    }


    return (
        <div className={styles.storySetup}>
            <h2>Basic Story Setup</h2>
            <p>Let's start with the core ideas for your story.</p>

            <div className={styles.formGroup}>
                <label htmlFor="storyType">Type of Story:</label>
                <select
                    id="storyType"
                    name="storyType"
                    value={storyData.storyType}
                    onChange={handleInputChange}
                >
                    <option value="Short Story">Short Story</option>
                    <option value="Novel Chapter" disabled>Novel Chapter</option>
                    <option value="Flash Fiction" disabled>Flash Fiction</option>
                    <option value="Screenplay Scene" disabled>Screenplay Scene</option>
                    <option value="Fable" disabled>Fable</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="genre">Genre:</label>
                <input
                    type="text"
                    id="genre"
                    name="genre"
                    value={storyData.genre}
                    onChange={handleInputChange}
                    placeholder="e.g., Fantasy, Sci-Fi, Mystery, Romance, Horror"
                 />
                  <AIHelperButton
                     promptContext={getGenreAIContext()}
                     onSuggestion={(suggestion) => handleSuggestion('genre', suggestion)}
                     buttonText="Suggest Genres"
                     suggestionPrefix="Generate story genre suggestions"
                     numSuggestions={5}
                     wordLimit={5}
                 />
            </div>

             <div className={styles.formGroup}>
                <label htmlFor="briefSummary">Brief Summary / Logline / Core Idea:</label>
                <textarea
                    id="briefSummary"
                    name="briefSummary"
                    value={storyData.briefSummary}
                    onChange={handleInputChange}
                    placeholder="What is the story about in one or two sentences? What is the main goal or conflict?"
                    rows={4}
                />
                 <AIHelperButton
                     promptContext={getBriefAIContext()}
                     onSuggestion={(suggestion) => handleSuggestion('briefSummary', suggestion)}
                     buttonText="Suggest Summary Ideas"
                     suggestionPrefix="Generate story summary suggestions"
                     disabled={!storyData.genre}
                 />
            </div>
            {/* Optionally add fields like Target Audience, Tone, Theme later */}

        </div>
    );
};

export default StorySetup;