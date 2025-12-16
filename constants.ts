import { AsteroidType } from "./types";

export const DEFAULT_INPUT = {
  name: 'Neo-X1',
  diameter: 50,
  velocity: 17,
  distance: 384400, // Distance to moon approx
  type: AsteroidType.STONY
};

export const ASTEROID_TYPES = [
  { value: AsteroidType.STONY, label: '🪨 Stony (S-Type)', desc: 'Common, silicate rock' },
  { value: AsteroidType.METALLIC, label: '⚙️ Metallic (M-Type)', desc: 'Dense, iron-nickel' },
  { value: AsteroidType.ICY, label: '❄️ Icy (Comet)', desc: 'Low density, volatile' },
  { value: AsteroidType.CARBONACEOUS, label: '🌑 Carbonaceous (C-Type)', desc: 'Dark, primitive' },
];

export const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
