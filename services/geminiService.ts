import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AsteroidInput, AnalysisResult } from "../types";

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    isHit: { type: Type.BOOLEAN, description: "Whether the asteroid is likely to hit Earth based on distance (assume hit if < 20000km for this simulation) or trajectory." },
    impactProbability: { type: Type.NUMBER, description: "Probability of impact in percentage (0-100)." },
    kineticEnergyMegatons: { type: Type.NUMBER, description: "Calculated Kinetic Energy in Megatons of TNT." },
    craterSizeMeters: { type: Type.NUMBER, description: "Estimated crater diameter in meters." },
    analysisSummary: { type: Type.STRING, description: "A brief, dramatic summary of the outcome." },
    dimensionalProcess: {
      type: Type.ARRAY,
      description: "Step-by-step dimensional analysis showing unit cancellations.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.STRING },
          equation: { type: Type.STRING, description: "The math equation used" },
          explanation: { type: Type.STRING },
          result: { type: Type.STRING, description: "The result of this step with units" }
        }
      }
    },
    composition: {
      type: Type.ARRAY,
      description: "Estimated chemical composition breakdown.",
      items: {
        type: Type.OBJECT,
        properties: {
          element: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
          fill: { type: Type.STRING, description: "Hex color code for the chart" }
        }
      }
    },
    rawMarkdown: { type: Type.STRING, description: "A detailed scientific explanation in Markdown format." }
  },
  required: ["isHit", "impactProbability", "kineticEnergyMegatons", "dimensionalProcess", "composition", "rawMarkdown"]
};

export const analyzeAsteroid = async (input: AsteroidInput, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const model = "gemini-2.5-flash";
  
  // Explicit physics constants to ensure accuracy
  const prompt = `
    Perform a rigorous dimensional analysis and impact assessment for an asteroid.
    
    INPUT DATA:
    Name: ${input.name}
    Diameter: ${input.diameter} meters
    Velocity: ${input.velocity} km/s relative to Earth
    Distance: ${input.distance} km from Earth
    Type: ${input.type}

    REFERENCE CONSTANTS (Use these for calculation):
    - Density (Stony): 2700 kg/m^3
    - Density (Metallic): 8000 kg/m^3
    - Density (Icy): 1000 kg/m^3
    - Density (Carbonaceous): 1300 kg/m^3
    - 1 Megaton TNT = 4.184 x 10^15 Joules
    - Volume of Sphere = (4/3) * pi * (radius^3)

    TASK:
    1. Calculate Radius (Diameter / 2).
    2. Calculate Volume (m^3).
    3. Calculate Mass (kg) = Density * Volume.
    4. Calculate Kinetic Energy (Joules) = 0.5 * Mass * (Velocity in m/s)^2. 
       *IMPORTANT*: Convert Velocity from km/s to m/s (multiply by 1000) BEFORE squaring.
    5. Convert Energy to Megatons (MT).
    6. Estimate Impact Probability: If distance < 50,000 km, probability is > 90%.
    
    OUTPUT:
    Return a structured JSON response.
    In the "dimensionalProcess" array, you MUST show the full unit cancellation path.
    Example format for step: "17 km/s * (1000 m / 1 km) = 17,000 m/s".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are a NASA planetary defense physics engine. You perform calculations with extreme precision. You always show your work.",
        temperature: 0.1 // Low temperature for consistent math
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const data = JSON.parse(text) as AnalysisResult;
    return { ...data, timestamp: Date.now() };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};