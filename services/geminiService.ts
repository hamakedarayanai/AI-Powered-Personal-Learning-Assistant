// FIX: The module specifier in an import declaration must be a string literal. The .replace() call is invalid.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { GraphData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const knowledgeGraphSchema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'The name of the concept.' },
          group: { type: Type.INTEGER, description: 'A number to categorize the concept.' },
        },
        required: ['id', 'group'],
      },
    },
    links: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, description: 'The ID of the source node.' },
          target: { type: Type.STRING, description: 'The ID of the target node.' },
          value: { type: Type.INTEGER, description: 'The strength of the connection, from 1 to 10.' },
        },
        required: ['source', 'target', 'value'],
      },
    },
  },
  required: ['nodes', 'links'],
};

export const generateKnowledgeGraph = async (topic: string): Promise<GraphData> => {
  const prompt = `Given the topic "${topic}", generate a knowledge graph of key concepts and their relationships. The graph should represent foundational concepts, main sub-topics, and related ideas. Create around 10-15 nodes. Output should be a JSON object with 'nodes' and 'links' arrays.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: knowledgeGraphSchema,
    },
  });

  const jsonString = response.text.trim();
  const parsed = JSON.parse(jsonString) as GraphData;

  // Basic validation to ensure we have some data
  if (!parsed.nodes || !parsed.links) {
    throw new Error("Invalid graph data received from API.");
  }
  return parsed;
};

export const generateExplanation = async (topic: string, concept: string): Promise<string> => {
  const prompt = `Explain the concept of "${concept}" within the context of "${topic}". Be clear, concise, and aim for an audience that is new to the topic. Use paragraphs for readability.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const generateExample = async (topic: string, concept: string): Promise<string> => {
  const prompt = `Provide a simple, real-world example or an easy-to-understand analogy to explain the concept of "${concept}" as it relates to "${topic}".`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const generateDiagram = async (topic: string, concept: string): Promise<string> => {
  // 1. Generate a descriptive prompt for the image generator
  const descriptionPrompt = `Create a very simple and clear prompt for an AI image generator to create a conceptual diagram explaining "${concept}" from "${topic}". The style should be minimalist, like a whiteboard drawing with clear labels. Focus on the core idea.`;
  const descriptionResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: descriptionPrompt,
  });

  const imagePrompt = descriptionResponse.text;

  // 2. Generate the image
  const imageResponse = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '16:9',
    },
  });

  const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

export { ai };
