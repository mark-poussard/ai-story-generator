import React, { useState } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import { Character } from '../../types/story';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import styles from './CharacterBuilder.module.scss';
import AIHelperButton from '../AIHelperButton/AIHelperButton'; // Assuming this component exists

const CharacterBuilder: React.FC = () => {
    const { storyData, addCharacter, updateCharacter, removeCharacter } = useStoryContext();
    const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({ name: '', role: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string | null = null) => {
        const { name, value } = e.target;
        if (id) { // Editing existing character
            updateCharacter(id, { [name]: value });
        } else { // Creating new character
            setNewCharacter(prev => ({ ...prev, [name]: value }));
        }
    };

     const handleAddCharacter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCharacter.name) return; // Basic validation
        addCharacter({ ...newCharacter, id: uuidv4() } as Character);
        setNewCharacter({ name: '', role: '', description: '' }); // Reset form
    };

    const handleSuggestion = (id: string | null, field: keyof Character, suggestion: string) => {
         if (id) {
             updateCharacter(id, { [field]: suggestion });
         } else {
             setNewCharacter(prev => ({...prev, [field]: suggestion }));
         }
    };

    const startEditing = (character: Character) => {
        setEditingId(character.id);
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const getGenericAIContext = (): string => {
        let context = `Current story genre: ${storyData.genre}.\nSummary: ${storyData.briefSummary || 'Not specified'}.\n`
        if(storyData.characters.length > 0) {
            context += `Current characters : ${storyData.characters.map(c => `${c.name} (${c.role})`).join(', ')}.\n`;
        }
        return context;
    }

    const getNameAIContext = () => {
        let context = getGenericAIContext();
        return context;
    }

    const getRoleAIContext = () => {
        let context = getGenericAIContext();
        return context + (newCharacter.name ? `The new character name is ${newCharacter.name}\n` : '');
    }

    const getDescriptionAIContext = () => {
        let context = getGenericAIContext();
        context += `The new character name is ${newCharacter.name}.\n`;
        context += `The new character's role is ${newCharacter.role}.\n`
        return context;
    }

    return (
        <div className={styles.characterBuilder}>
            <h2>Characters</h2>

            {/* List Existing Characters */}
            <div className={styles.characterList}>
                {storyData.characters.length === 0 && <p>No characters added yet.</p>}
                {storyData.characters.map(char => (
                    <div key={char.id} className={styles.characterCard}>
                        {editingId === char.id ? (
                            // --- Editing Form ---
                            <div className={styles.editForm}>
                                <input
                                    type="text"
                                    name="name"
                                    value={char.name}
                                    onChange={(e) => handleInputChange(e, char.id)}
                                    placeholder="Name"
                                />
                                <input
                                    type="text"
                                    name="role"
                                    value={char.role}
                                    onChange={(e) => handleInputChange(e, char.id)}
                                    placeholder="Role (e.g., Protagonist, Antagonist, Mentor)"
                                />
                                <textarea
                                    name="description"
                                    value={char.description}
                                    onChange={(e) => handleInputChange(e, char.id)}
                                    placeholder="Description, personality, backstory..."
                                    rows={4}
                                ></textarea>
                                 <AIHelperButton
                                     promptContext={`Generate a character description for a ${storyData.genre} character named ${char.name} whose role is ${char.role}. Current description: ${char.description}`}
                                     onSuggestion={(suggestion) => handleSuggestion(char.id, 'description', suggestion)}
                                     buttonText="Suggest Description"
                                />
                                <button onClick={cancelEditing} className={styles.cancelButton}>Done Editing</button>
                                <button onClick={() => removeCharacter(char.id)} className={styles.removeButton}>Remove</button>
                            </div>
                        ) : (
                            // --- Display Mode ---
                            <div>
                                <h3>{char.name}</h3>
                                <p><strong>Role:</strong> {char.role || 'Not specified'}</p>
                                <p><strong>Description:</strong> {char.description || 'Not specified'}</p>
                                <button onClick={() => startEditing(char)} className={styles.editButton}>Edit</button>
                                <button onClick={() => removeCharacter(char.id)} className={styles.removeButton}>Remove</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Character Form */}
            <form onSubmit={handleAddCharacter} className={styles.addForm}>
                <h3>Add New Character</h3>
                <input
                    type="text"
                    name="name"
                    value={newCharacter.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    required
                />
                <AIHelperButton
                    promptContext={getNameAIContext()}
                    suggestionPrefix="Generate name suggestions for a new character."
                    numSuggestions={5}
                    onSuggestion={(suggestion) => handleSuggestion(null, 'name', suggestion)}
                    buttonText="Suggest Name"
                />
                <input
                    type="text"
                    name="role"
                    value={newCharacter.role}
                    onChange={handleInputChange}
                    placeholder="Role"
                />
                <AIHelperButton
                    promptContext={getRoleAIContext()}
                    suggestionPrefix="Generate role suggestions for the new character."
                    wordLimit={5}
                    numSuggestions={5}
                    onSuggestion={(suggestion) => handleSuggestion(null, 'role', suggestion)}
                    buttonText="Suggest Role"
                    disabled={!newCharacter.name} // Disable if no context
                />
                <textarea
                    name="description"
                    value={newCharacter.description}
                    onChange={handleInputChange}
                    placeholder="Description, personality, etc."
                    rows={3}
                 />
                 <AIHelperButton
                     promptContext={getDescriptionAIContext()}
                     suggestionPrefix="Generate a character description for the new character."
                     onSuggestion={(suggestion) => handleSuggestion(null, 'description', suggestion)}
                     buttonText="Suggest Description"
                     disabled={!newCharacter.name || !newCharacter.role} // Disable if no context
                 />
                <button type="submit">Add Character</button>
            </form>
        </div>
    );
};

export default CharacterBuilder;