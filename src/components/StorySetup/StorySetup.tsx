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
    const handleSuggestion = (field: keyof StoryData, suggestions: string[]) => {
         // Append or replace based on preference
        const currentValue = storyData[field as keyof Omit<StoryData, 'characters' | 'world' | 'plotPoints'>] || ''; // Adjust type based on field
        const suggestion = suggestions.join(", ");
        updateStoryData(field, currentValue ? currentValue + '\n\n' + suggestion : suggestion);
    };

     // --- AI Context Generation ---
    const getAIContext = (field: KnownSetupField): string => {
        let context = "Starting a new story.\n";
        if (field !== 'genre' && storyData.genre) {
            context += `Selected Genre: ${storyData.genre}\n`;
        }
        if (field !== 'storyType' && storyData.storyType) {
            context += `Selected Type: ${storyData.storyType}\n`;
        }
        if (field === 'briefSummary' && (storyData.genre || storyData.storyType)) {
             context += `Looking for a summary for a ${storyData.storyType} in the ${storyData.genre} genre.`
        }
        // Could add more context later if needed
        return context;
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
                    <option value="Novel Chapter">Novel Chapter</option>
                    <option value="Flash Fiction">Flash Fiction</option>
                    <option value="Screenplay Scene">Screenplay Scene</option>
                    <option value="Fable">Fable</option>
                    <option value="Other">Other</option> {/* Allow custom? */}
                </select>
                {/* AI helper for story type? Maybe suggest based on summary later? */}
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
                     promptContext={getAIContext('genre')}
                     onSuggestion={(suggestion) => handleSuggestion('genre', suggestion)}
                     buttonText="Suggest Genres"
                     suggestionPrefix="Suggest 3-5 interesting genres or sub-genres, potentially blending ideas:"
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
                     promptContext={getAIContext('briefSummary')}
                     onSuggestion={(suggestion) => handleSuggestion('briefSummary', suggestion)}
                     buttonText="Suggest Summary Ideas"
                     suggestionPrefix="Generate 3 concise summary/logline ideas based on the selected genre and type:"
                 />
            </div>
            {/* Optionally add fields like Target Audience, Tone, Theme later */}

        </div>
    );
};

export default StorySetup;