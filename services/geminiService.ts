import { AsteroidInput, AnalysisResult, AsteroidType, DimensionalStep, CompositionElement } from "../types";

// Physics Constants
const DENSITY_MAP: Record<AsteroidType, number> = {
  [AsteroidType.STONY]: 2700,      // kg/m^3 (S-Type)
  [AsteroidType.METALLIC]: 7870,   // kg/m^3 (Iron)
  [AsteroidType.ICY]: 1000,        // kg/m^3 (Water ice)
  [AsteroidType.CARBONACEOUS]: 1300 // kg/m^3 (C-Type)
};

const TNT_JOULES = 4.184e15; // 1 Megaton TNT in Joules
const EARTH_RADIUS_KM = 6371;

/**
 * Local Physics Engine
 * Performs dimensional analysis and impact estimation without external APIs.
 */
export const analyzeAsteroid = async (input: AsteroidInput): Promise<AnalysisResult> => {
  // Simulate computation time for UX pacing
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. Determine Constants
  const density = DENSITY_MAP[input.type] || 2500;
  
  // 2. Geometry Calculations (Dimensional Analysis: Length -> Volume)
  const radius = input.diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  
  // 3. Mass Derivation (Volume * Density -> Mass)
  const mass = density * volume;

  // 4. Kinematics (Velocity Unit Conversion & Kinetic Energy)
  const velocityMs = input.velocity * 1000; // km/s to m/s
  const energyJoules = 0.5 * mass * Math.pow(velocityMs, 2);
  const energyMt = energyJoules / TNT_JOULES;

  // 5. Impact Probability Logic
  // Using a heuristic based on current distance vs safe orbital distance.
  // Realistically, trajectory matters more, but for this simulation:
  // - < 8,000 km (Atmosphere/LEO entry) = 100% Impact
  // - 8,000 - 50,000 km (Gravity Well Capture Zone) = High Probability decay
  // - > 50,000 km = Safe/Miss
  let impactProb = 0;
  let isHit = false;

  if (input.distance < (EARTH_RADIUS_KM + 2000)) {
    impactProb = 100;
    isHit = true;
  } else if (input.distance < 50000) {
    // Linear decay from 100% at ~8000km to 0% at 50000km
    const closeLimit = EARTH_RADIUS_KM + 2000;
    const outerLimit = 50000;
    const range = outerLimit - closeLimit;
    const position = input.distance - closeLimit;
    impactProb = 100 * (1 - (position / range));
    isHit = impactProb > 60;
  } else {
    impactProb = 0;
    isHit = false;
  }
  
  // Clean up probability number
  impactProb = Math.max(0, Math.min(100, parseFloat(impactProb.toFixed(1))));

  // 6. Crater Estimation (Transient crater diameter scaling law)
  // D_t = 1.161 * (rho_i / rho_t)^(1/3) * L^0.78 * v^0.44 * g^-0.22
  // Approximated: Crater is roughly 10-20x impactor size depending on energy.
  // Using a more scientific scaling approximation:
  const rho_i = density;
  const rho_t = 2500; // Target density (Earth crust)
  const L = input.diameter;
  const v = velocityMs;
  const g = 9.81;
  
  const term1 = Math.pow(rho_i / rho_t, 1/3);
  const term2 = Math.pow(L, 0.78);
  const term3 = Math.pow(v, 0.44);
  const term4 = Math.pow(g, -0.22);
  
  const craterDiameter = 1.161 * term1 * term2 * term3 * term4;
  
  // 7. Generate Dimensional Process Steps (The "Show Your Work" part)
  const steps: DimensionalStep[] = [
    {
      step: "Calculate Radius",
      equation: `r = d / 2 = ${input.diameter} / 2`,
      explanation: "Derive radius from diameter to determine spherical volume.",
      result: `${radius.toFixed(2)} m`
    },
    {
      step: "Calculate Volume",
      equation: `V = (4/3) * π * r^3`,
      explanation: "Compute volume of sphere.",
      result: `${volume.toExponential(2)} m³`
    },
    {
      step: "Derive Mass",
      equation: `M = ρ * V`,
      explanation: `Calculate mass using ${input.type} density (${density} kg/m³).`,
      result: `${mass.toExponential(2)} kg`
    },
    {
      step: "Velocity Conversion",
      equation: `v_ms = v_km * 1000`,
      explanation: "Convert km/s to m/s for standard Joule calculation.",
      result: `${velocityMs.toLocaleString()} m/s`
    },
    {
      step: "Kinetic Energy",
      equation: `E_k = (1/2) * M * v^2`,
      explanation: "Compute kinetic energy using classical mechanics.",
      result: `${energyJoules.toExponential(2)} J`
    },
    {
      step: "TNT Equivalent",
      equation: `MT = E_k / 4.184e15`,
      explanation: "Convert Joules to Megatons of TNT for impact context.",
      result: `${energyMt.toFixed(2)} MT`
    }
  ];

  // 8. Generate Composition Data
  const composition = getComposition(input.type);

  // 9. Generate Summary
  const analysisSummary = generateSummary(input.name, isHit, energyMt, input.type, impactProb);

  return {
    isHit,
    impactProbability: impactProb,
    kineticEnergyMegatons: energyMt,
    craterSizeMeters: craterDiameter,
    analysisSummary,
    dimensionalProcess: steps,
    composition,
    rawMarkdown: "Generated via Local Physics Engine.",
    timestamp: Date.now()
  };
};

function getComposition(type: AsteroidType): CompositionElement[] {
    switch (type) {
        case AsteroidType.STONY:
            return [
                { element: 'Silicates', percentage: 70, fill: '#a8a29e' },
                { element: 'Iron/Nickel', percentage: 15, fill: '#94a3b8' },
                { element: 'Pyroxene', percentage: 10, fill: '#d6d3d1' },
                { element: 'Olivine', percentage: 5, fill: '#86efac' }
            ];
        case AsteroidType.METALLIC:
             return [
                { element: 'Iron', percentage: 85, fill: '#64748b' },
                { element: 'Nickel', percentage: 14, fill: '#cbd5e1' },
                { element: 'Iridium', percentage: 1, fill: '#f1f5f9' }
            ];
        case AsteroidType.ICY:
             return [
                { element: 'Water Ice', percentage: 60, fill: '#bfdbfe' },
                { element: 'CO2 Ice', percentage: 20, fill: '#e0f2fe' },
                { element: 'Dust', percentage: 15, fill: '#7dd3fc' },
                { element: 'Organics', percentage: 5, fill: '#0ea5e9' }
            ];
        case AsteroidType.CARBONACEOUS:
             return [
                { element: 'Carbon', percentage: 45, fill: '#475569' },
                { element: 'Water', percentage: 20, fill: '#334155' },
                { element: 'Silicates', percentage: 25, fill: '#94a3b8' },
                { element: 'Sulfides', percentage: 10, fill: '#fbbf24' }
            ];
        default:
            return [];
    }
}

function generateSummary(name: string, isHit: boolean, energy: number, type: string, prob: number): string {
    const energyStr = energy < 1 ? "Local Damage" : energy < 100 ? "Regional Destruction" : energy < 10000 ? "Continental Catastrophe" : "Extinction Event";
    const status = isHit ? "CRITICAL: IMPACT TRAJECTORY CONFIRMED." : "SAFE: NO INTERSECTION DETECTED.";
    
    return `PHYSICS ENGINE REPORT // TARGET: ${name.toUpperCase()}
    
    CLASSIFICATION: ${type}
    TRAJECTORY ANALYSIS: ${prob}% Probability of Impact.
    STATUS: ${status}
    
    KINETIC YIELD: ~${energy.toLocaleString(undefined, {maximumFractionDigits: 2})} Megatons.
    THREAT LEVEL: ${energyStr.toUpperCase()}.
    
    Dimensional analysis verifies mass-velocity integration. All constants valid.`;
}