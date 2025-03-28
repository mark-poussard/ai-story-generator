import React, { useState } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import styles from './WorldBuilder.module.scss';
import AIHelperButton from '../AIHelperButton/AIHelperButton';
import { World } from '../../types/story'; // Import World type

// Define the fields we know about for type safety
type KnownWorldField = 'settingDescription' | 'rules' | 'technologyLevel';

const WorldBuilder: React.FC = () => {
    const { storyData, updateWorld } = useStoryContext();

    // Handle direct field updates
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        updateWorld(name as keyof World, value); // Cast name to keyof World
    };

    // Handle updates via AI suggestion
    const handleSuggestion = (field: keyof World, suggestion: string) => {
        // Append or replace based on preference
        const currentValue = storyData.world[field] || '';
        updateWorld(field, currentValue ? currentValue + '\n\n' + suggestion : suggestion);
    };

     // --- Dynamic Location Handling (Example of extendable world feature) ---
    const handleAddLocation = () => {
        const newLocation = { name: 'New Location', description: '' };
        const currentLocations = storyData.world.locations || [];
        updateWorld('locations', [...currentLocations, newLocation]);
    };

    const handleLocationChange = (index: number, field: 'name' | 'description', value: string) => {
        const currentLocations = [...(storyData.world.locations || [])];
        if (currentLocations[index]) {
            currentLocations[index] = { ...currentLocations[index], [field]: value };
            updateWorld('locations', currentLocations);
        }
    };

     const handleRemoveLocation = (index: number) => {
        const currentLocations = [...(storyData.world.locations || [])];
        currentLocations.splice(index, 1);
        updateWorld('locations', currentLocations);
    };

    // --- Prompt Context ---
    const getAIContext = (field: KnownWorldField): string => {
        let context = `Story Genre: ${storyData.genre}. Brief Summary: ${storyData.briefSummary || 'None'}.\n`;
        if (field !== 'settingDescription' && storyData.world.settingDescription) {
            context += `Setting Description: ${storyData.world.settingDescription}\n`;
        }
        if (field !== 'rules' && storyData.world.rules) {
            context += `Existing Rules/Magic: ${storyData.world.rules}\n`;
        }
         if (field !== 'technologyLevel' && storyData.world.technologyLevel) {
            context += `Existing Tech Level: ${storyData.world.technologyLevel}\n`;
        }
        // Add character info if relevant?
        // context += `Main Characters: ${storyData.characters.map(c => c.name).join(', ')}\n`;
        return context;
    }


    return (
        <div className={styles.worldBuilder}>
            <h2>World Building</h2>
            <p>Describe the setting, rules, and other important details about the world your story takes place in.</p>

            <div className={styles.formGroup}>
                <label htmlFor="settingDescription">Overall Setting Description:</label>
                <textarea
                    id="settingDescription"
                    name="settingDescription"
                    value={storyData.world.settingDescription || ''}
                    onChange={handleInputChange}
                    placeholder="Describe the time period, environment, atmosphere (e.g., futuristic city, medieval fantasy kingdom, post-apocalyptic wasteland)"
                    rows={5}
                />
                 <AIHelperButton
                     promptContext={getAIContext('settingDescription')}
                     onSuggestion={(suggestion) => handleSuggestion('settingDescription', suggestion)}
                     buttonText="Suggest Setting Ideas"
                     suggestionPrefix="Generate ideas or expand on the setting description for this story:"
                 />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="rules">Rules / Magic System / Physics:</label>
                <textarea
                    id="rules"
                    name="rules"
                    value={storyData.world.rules || ''}
                    onChange={handleInputChange}
                    placeholder="Are there special rules? How does magic work (if any)? Unique physics?"
                    rows={4}
                />
                <AIHelperButton
                     promptContext={getAIContext('rules')}
                     onSuggestion={(suggestion) => handleSuggestion('rules', suggestion)}
                     buttonText="Suggest Rule/Magic Ideas"
                      suggestionPrefix="Generate ideas for rules, magic systems, or unique physics based on the story context:"
                 />
            </div>

             <div className={styles.formGroup}>
                <label htmlFor="technologyLevel">Technology Level:</label>
                <input
                    type="text"
                    id="technologyLevel"
                    name="technologyLevel"
                    value={storyData.world.technologyLevel || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Stone Age, Medieval, Industrial Revolution, Modern, Futuristic, Sci-Fi"
                />
                 <AIHelperButton
                     promptContext={getAIContext('technologyLevel')}
                     onSuggestion={(suggestion) => handleSuggestion('technologyLevel', suggestion)}
                     buttonText="Suggest Tech Details"
                     suggestionPrefix="Suggest details or implications of the technology level based on the story context:"
                 />
            </div>

            {/* Dynamic Locations Example */}
            <div className={styles.locationsSection}>
                <h3>Key Locations</h3>
                 {(storyData.world.locations || []).length === 0 && <p>No specific locations added yet.</p>}
                {(storyData.world.locations || []).map((loc, index) => (
                    <div key={index} className={styles.locationItem}>
                        <input
                            type="text"
                            value={loc.name}
                            onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                            placeholder="Location Name"
                            className={styles.locationName}
                        />
                        <textarea
                            value={loc.description}
                            onChange={(e) => handleLocationChange(index, 'description', e.target.value)}
                            placeholder="Brief description of the location"
                            rows={2}
                             className={styles.locationDesc}
                        />
                        {/* AI Helper for location description? */}
                         {/* <AIHelperButton ... /> */}
                        <button
                             onClick={() => handleRemoveLocation(index)}
                             className={styles.removeLocationButton}
                             title="Remove Location"
                        >
                            × {/* Simple 'x' delete icon */}
                        </button>
                    </div>
                ))}
                <button onClick={handleAddLocation} className={styles.addLocationButton}>
                    + Add Location
                </button>
            </div>

             {/* Add more fields as needed (History, Factions, Culture etc.) */}
             {/* Example:
             <div className={styles.formGroup}>
                <label htmlFor="history">Brief History:</label>
                <textarea id="history" name="history" ... />
                <AIHelperButton ... />
             </div>
             */}

        </div>
    );
};

export default WorldBuilder;