export interface Character {
    id: string;
    name: string;
    role: string;
    description: string; // Can be AI-assisted
    // Add more fields as needed (backstory, motivation, appearance, etc.)
    [key: string]: any; // Allow for dynamic additional details
  }
  
  export interface World {
    settingDescription: string;
    rules?: string; // e.g., magic system, physics
    technologyLevel?: string;
    locations?: { name: string; description: string }[];
    // Add more fields (history, factions, culture etc.)
    [key: string]: any;
  }
  
  export interface PlotPoint {
      id: string;
      summary: string;
      details?: string; // Can be AI-assisted
  }
  
  export interface StoryData {
    apiKey?: string; // Store temporarily, handle with care
    storyType: string; // e.g., Short Story, Novel Chapter, Screenplay Scene
    genre: string;
    briefSummary: string;
    characters: Character[];
    world: World;
    plotPoints: PlotPoint[];
    // Additional user notes/preferences for the final generation
    finalPromptNotes?: string;
  }
  
  // Initial empty state structure
  export const initialWorld: World = {
      settingDescription: '',
      rules: '',
      technologyLevel: '',
      locations: [],
  };
  
  export const initialStoryData: Omit<StoryData, 'apiKey'> = {
    storyType: 'Short Story',
    genre: 'Fantasy',
    briefSummary: '',
    characters: [],
    world: { ...initialWorld },
    plotPoints: [],
    finalPromptNotes: '',
  };