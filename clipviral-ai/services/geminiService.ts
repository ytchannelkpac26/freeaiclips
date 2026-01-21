
import { GoogleGenAI, Type } from "@google/genai";
import { VideoSegment, Caption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVideoContent = async (
  fileName: string,
  base64Frames: string[]
): Promise<VideoSegment[]> => {
  // We send a few key frames to the model to represent the video for analysis
  // In a real production app, we would send the full video file to the Gemini File API
  // Here we simulate the segmentation logic by providing frames and requesting a JSON structure.

  const prompt = `
    Analyze this long-form video named "${fileName}". 
    1. Identify 3 potential viral segments (between 15-60 seconds each).
    2. For each segment, give it a catchy "TikTok style" title and a description explaining why it's viral (e.g., "high energy", "controversial hook", "educational value").
    3. Generate a set of word-by-word captions for the first 10 seconds of each segment.
    4. Provide a 'viralScore' from 0 to 100 based on engagement potential.
    
    Return the data in a structured JSON format.
  `;

  const frameParts = base64Frames.map(data => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: data.split(',')[1] // remove data:image/jpeg;base64,
    }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...frameParts,
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            startTime: { type: Type.NUMBER },
            endTime: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            viralScore: { type: Type.NUMBER },
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  start: { type: Type.NUMBER },
                  end: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["id", "startTime", "endTime", "title", "description", "viralScore", "captions"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Invalid response from AI model.");
  }
};
