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
        // Could potentially copy character data to a separate editing state
        // for better cancellation, but direct update via context is simpler for now.
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

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
                <input
                    type="text"
                    name="role"
                    value={newCharacter.role}
                    onChange={handleInputChange}
                    placeholder="Role"
                />
                <textarea
                    name="description"
                    value={newCharacter.description}
                    onChange={handleInputChange}
                    placeholder="Description, personality, etc."
                    rows={3}
                 />
                 <AIHelperButton
                     promptContext={`Generate a character description for a new ${storyData.genre} character named ${newCharacter.name || '[Unnamed]'} whose role is ${newCharacter.role || '[No Role]'}.`}
                     onSuggestion={(suggestion) => handleSuggestion(null, 'description', suggestion)}
                     buttonText="Suggest Description"
                     disabled={!newCharacter.name && !newCharacter.role} // Disable if no context
                 />
                <button type="submit">Add Character</button>
            </form>
        </div>
    );
};

export default CharacterBuilder;