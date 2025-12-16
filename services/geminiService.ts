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

export const analyzeAsteroid = async (input: AsteroidInput): Promise<AnalysisResult> => {
  // Initialize client lazily to avoid top-level process.env crashes in browser
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Perform a rigorous dimensional analysis and impact assessment for an asteroid with the following parameters:
    Name: ${input.name}
    Diameter: ${input.diameter} meters
    Velocity: ${input.velocity} km/s relative to Earth
    Distance: ${input.distance} km from Earth
    Type: ${input.type}

    Task:
    1. Estimate Mass based on type density (Stony~3000kg/m3, Metallic~8000kg/m3, Icy~1000kg/m3).
    2. Calculate Kinetic Energy using E = 1/2 mv^2. Show unit conversions explicitly (km/s to m/s).
    3. Convert Energy to Megatons of TNT (1 MT = 4.184 x 10^15 Joules).
    4. Estimate Impact Probability. If distance < 50,000 km, assume High probability or Hit.
    5. Break down the likely chemical composition based on the type.
    
    Return a structured JSON response suitable for a dashboard, including a step-by-step "dimensionalProcess" array where you explicitly show unit cancellation (e.g., "17 km/s * (1000 m / 1 km)").
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are a NASA planetary defense expert. You are precise, scientific, but engaging. You strictly use Dimensional Analysis for all math.",
        temperature: 0.2
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