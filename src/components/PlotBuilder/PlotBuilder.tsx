import React, { useState } from 'react';
import { useStoryContext } from '../../context/StoryContext';
import { PlotPoint } from '../../types/story';
import { v4 as uuidv4 } from 'uuid';
import styles from './PlotBuilder.module.scss';
import AIHelperButton from '../AIHelperButton/AIHelperButton';

const PlotBuilder: React.FC = () => {
    const { storyData, addPlotPoint, updatePlotPoint, removePlotPoint } = useStoryContext();
    const [newPlotPoint, setNewPlotPoint] = useState<Omit<PlotPoint, 'id'>>({ summary: '', details: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string | null = null) => {
        const { name, value } = e.target;
        if (id) {
            updatePlotPoint(id, { [name]: value });
        } else {
            setNewPlotPoint(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddPlotPoint = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlotPoint.summary) return;
        addPlotPoint({ ...newPlotPoint, id: uuidv4() });
        setNewPlotPoint({ summary: '', details: '' }); // Reset form
    };

    const handleSuggestion = (id: string | null, field: keyof Omit<PlotPoint, 'id'>, suggestion: string) => {
        if (id) {
            // Append suggestion to existing details, or replace if desired
            updatePlotPoint(id, { [field]: (storyData.plotPoints.find(p => p.id === id)?.[field] || '') + '\n' + suggestion });
        } else {
            setNewPlotPoint(prev => ({ ...prev, [field]: (prev[field] || '') + '\n' + suggestion }));
        }
    };

    const startEditing = (plotPoint: PlotPoint) => {
        setEditingId(plotPoint.id);
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    // --- Prompt Context Generation ---
    const getAIContext = (pointId: string | null): string => {
        let context = `Current story genre: ${storyData.genre}. Summary: ${storyData.briefSummary || 'Not specified'}.\n`;
        if(storyData.characters.length > 0) {
            context += `Characters involved: ${storyData.characters.map(c => `${c.name} (${c.role})`).join(', ')}.\n`;
        }
        if(storyData.plotPoints.length > 0) {
             context += `Previous plot points:\n${storyData.plotPoints
                .slice(0, storyData.plotPoints.findIndex(p => p.id === pointId) > -1 ? storyData.plotPoints.findIndex(p => p.id === pointId) : storyData.plotPoints.length) // Get points before the current one
                .map((p, i) => `${i+1}. ${p.summary}`)
                .join('\n')}\n`;
        }

        if (pointId) {
            const currentPoint = storyData.plotPoints.find(p => p.id === pointId);
            context += `\nCurrently focusing on plot point: "${currentPoint?.summary}". Existing details: ${currentPoint?.details || 'None'}.`;
        } else {
             context += `\nAdding a new plot point. Current draft summary: "${newPlotPoint.summary}". Existing draft details: ${newPlotPoint.details || 'None'}.`;
        }
        return context;
    }

    return (
        <div className={styles.plotBuilder}>
            <h2>Plot Outline / Key Events</h2>
            <p>Define the major events or stages of your story. You can use the AI to help flesh out details for each point.</p>

            {/* List Existing Plot Points */}
            <div className={styles.plotList}>
                {storyData.plotPoints.length === 0 && <p>No plot points added yet. Start by adding the beginning of your story!</p>}
                {storyData.plotPoints.map((pp, index) => (
                    <div key={pp.id} className={styles.plotCard}>
                        {editingId === pp.id ? (
                            // --- Editing Form ---
                            <div className={styles.editForm}>
                                <label>Plot Point {index + 1} Summary:</label>
                                <input
                                    type="text"
                                    name="summary"
                                    value={pp.summary}
                                    onChange={(e) => handleInputChange(e, pp.id)}
                                    placeholder="Brief summary (e.g., Inciting Incident, Climax)"
                                />
                                <label>Details:</label>
                                <textarea
                                    name="details"
                                    value={pp.details || ''}
                                    onChange={(e) => handleInputChange(e, pp.id)}
                                    placeholder="Flesh out what happens here..."
                                    rows={5}
                                ></textarea>
                                <AIHelperButton
                                     promptContext={getAIContext(pp.id)}
                                     onSuggestion={(suggestion) => handleSuggestion(pp.id, 'details', suggestion)}
                                     buttonText="Suggest Details"
                                     suggestionPrefix="Based on the story context, suggest specific details or events for this plot point:"
                                />
                                <div className={styles.buttonGroup}>
                                     <button onClick={cancelEditing} className={styles.cancelButton}>Done Editing</button>
                                     <button onClick={() => removePlotPoint(pp.id)} className={styles.removeButton}>Remove</button>
                                </div>
                            </div>
                        ) : (
                            // --- Display Mode ---
                            <div>
                                <h3>{index + 1}. {pp.summary}</h3>
                                {pp.details && <p className={styles.plotDetails}><strong>Details:</strong> {pp.details}</p>}
                                {!pp.details && <p className={styles.noDetails}><i>No details added yet.</i></p>}
                                <div className={styles.buttonGroup}>
                                    <button onClick={() => startEditing(pp)} className={styles.editButton}>Edit</button>
                                    <button onClick={() => removePlotPoint(pp.id)} className={styles.removeButton}>Remove</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Plot Point Form */}
            <form onSubmit={handleAddPlotPoint} className={styles.addForm}>
                <h3>Add New Plot Point</h3>
                <input
                    type="text"
                    name="summary"
                    value={newPlotPoint.summary}
                    onChange={handleInputChange}
                    placeholder="Brief summary of the next plot point"
                    required
                />
                <textarea
                    name="details"
                    value={newPlotPoint.details || ''}
                    onChange={handleInputChange}
                    placeholder="Optional: Add initial details here..."
                    rows={3}
                 />
                 <AIHelperButton
                     promptContext={getAIContext(null)} // Context for the *new* point
                     onSuggestion={(suggestion) => handleSuggestion(null, 'details', suggestion)}
                     buttonText="Suggest Details"
                     disabled={!newPlotPoint.summary}
                     suggestionPrefix="Based on the story context so far, suggest details for this new plot point:"
                 />
                <button type="submit">Add Plot Point</button>
            </form>
        </div>
    );
};

export default PlotBuilder;