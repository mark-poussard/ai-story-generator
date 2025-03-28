import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { useState, useCallback, useMemo } from 'react';

const API_MODEL = "gemini-2.0-flash";

export const useGeminiAI = (apiKey: string | undefined) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function to attempt extracting JSON from potentially messy AI output
    function extractJsonArray(text: string): string[] | null {
        // Try finding JSON block ```json ... ```
        const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        let potentialJson = text.trim(); // Start with the raw text

        if (jsonBlockMatch && jsonBlockMatch[1]) {
            potentialJson = jsonBlockMatch[1].trim();
        } else {
            // Try finding JSON starting with [ and ending with ]
            const arrayMatch = text.match(/(\[[\s\S]*\])/);
            if (arrayMatch && arrayMatch[1]) {
                potentialJson = arrayMatch[1].trim();
            }
        }

        try {
            const parsed = JSON.parse(potentialJson);
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                return parsed as string[];
            }
            console.warn("Parsed content is not a string array:", parsed);
            return null; // Parsed correctly, but not the expected format
        } catch (e) {
            console.error("Failed to parse extracted text as JSON:", e);
            // Optional: Could try newline splitting as a fallback here
            // const lines = text.split('\n').map(line => line.replace(/^- /, '').trim()).filter(Boolean);
            // if(lines.length > 0) return lines;
            return null; // Parsing failed
        }
    }

    const genAI = useMemo(() => {
        if (!apiKey) return null;
        // Basic check - a real app would need better validation/handling
        if (apiKey.length < 10) {
            setError("Invalid API Key provided.");
            return null;
        }
        try {
            return new GoogleGenerativeAI(apiKey);
        } catch (err: any) {
             console.error("Error initializing GoogleGenerativeAI:", err);
             setError(`Failed to initialize AI Client: ${err.message || 'Unknown error'}`);
             return null;
        }
    }, [apiKey]);

    const model: GenerativeModel | null = useMemo(() => {
         if (!genAI) return null;
         try {
             return genAI.getGenerativeModel({ model: API_MODEL });
         } catch (err: any) {
             console.error("Error getting generative model:", err);
             setError(`Failed to get model '${API_MODEL}': ${err.message || 'Unknown error'}`);
             return null;
         }
    }, [genAI]);

    const generateContent = useCallback(async (prompt: string): Promise<string[] | null> => {
        prompt += `Format your response as a JSON array of strings. Ensure the output is ONLY the JSON array. Example: ["suggestion 1", "suggestion 2"]\n`
        if (!model) {
            setError("AI Model not initialized. Check your API Key.");
            return null;
        }
        setLoading(true);
        setError(null);
        console.log("Sending prompt to AI:\n", prompt); // For debugging

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            setLoading(false);
            console.log("Raw AI Response:", text);
            const suggestions = extractJsonArray(text);
            if (suggestions) {
                return suggestions; // Successfully parsed string array
            } else {
                // Parsing failed or format incorrect
                setError(`AI response format error: Could not parse response as a JSON array of strings. Raw response: "${text.substring(0, 100)}..."`);
                return null;
            }
        } catch (err: any) {
            console.error("Error generating content:", err);
            // Provide more specific error messages if possible
             let errorMessage = `AI Generation Failed: ${err.message || 'Unknown error'}`;
             if (err.message?.includes('API key not valid')) {
                 errorMessage = "AI Generation Failed: API Key is not valid. Please check your key.";
             } else if (err.message?.includes('quota')) {
                 errorMessage = "AI Generation Failed: You may have exceeded your API quota.";
             } else {
                errorMessage = `AI Generation Error: ${err.message}`;
             }
             setError(errorMessage);
            setLoading(false);
            return null;
        }
    }, [model]);

    return { generateContent, loading, error, isInitialized: !!model };
};