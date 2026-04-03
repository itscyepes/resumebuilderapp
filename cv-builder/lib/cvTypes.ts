// lib/cvTypes.ts

export type TemplateId =
  | 'classic'
  | 'modern'
  | 'compact'
  | 'executive'
  | 'minimal'
  | 'bold'
  | 'sidebar-dark'
  | 'timeline';

export type ColorScheme = {
  id: string;
  name: string;
  primary: string;    // hex without #
  secondary: string;  // hex without #
  accent: string;     // hex without #
  text: string;       // hex without #
  light: string;      // hex without # — light bg tint
};

export const COLOR_SCHEMES: ColorScheme[] = [
  { id: 'ocean',     name: 'Ocean',       primary: '185FA5', secondary: '378ADD', accent: 'B5D4F4', text: '042C53', light: 'E6F1FB' },
  { id: 'forest',    name: 'Forest',       primary: '1D9E75', secondary: '3B6D11', accent: 'C0DD97', text: '04342C', light: 'EAF3DE' },
  { id: 'slate',     name: 'Slate',        primary: '444441', secondary: '888780', accent: 'D3D1C7', text: '2C2C2A', light: 'F1EFE8' },
  { id: 'crimson',   name: 'Crimson',      primary: 'A32D2D', secondary: 'E24B4A', accent: 'F7C1C1', text: '501313', light: 'FCEBEB' },
  { id: 'violet',    name: 'Violet',       primary: '534AB7', secondary: '7F77DD', accent: 'CECBF6', text: '26215C', light: 'EEEDFE' },
  { id: 'amber',     name: 'Amber',        primary: '854F0B', secondary: 'BA7517', accent: 'FAC775', text: '412402', light: 'FAEEDA' },
  { id: 'rose',      name: 'Rose',         primary: '993556', secondary: 'D4537E', accent: 'F4C0D1', text: '4B1528', light: 'FBEAF0' },
  { id: 'teal',      name: 'Teal',         primary: '0F6E56', secondary: '1D9E75', accent: '9FE1CB', text: '04342C', light: 'E1F5EE' },
  { id: 'midnight',  name: 'Midnight',     primary: '1a1a2e', secondary: '16213e', accent: '0f3460', text: 'e94560', light: 'e8e8f0' },
  { id: 'sage',      name: 'Sage',         primary: '4a6741', secondary: '6b8f67', accent: 'b8d4b4', text: '2d4028', light: 'edf4ec' },
];

export type Experience = {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
};

export type CVData = {
  template: TemplateId;
  colorScheme: string;
  personal: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    github: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  certifications: string[];
  skills: string[];
};

export const EMPTY_CV: CVData = {
  template: 'classic',
  colorScheme: 'ocean',
  personal: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    github: '',
  },
  summary: '',
  experience: [],
  education: [],
  certifications: [],
  skills: [],
};

export const TEMPLATE_META: Record<TemplateId, { name: string; desc: string; atsScore: number; twoColumn: boolean }> = {
  classic:      { name: 'Classic',      desc: 'Single-column. Max ATS compatibility.',       atsScore: 100, twoColumn: false },
  modern:       { name: 'Modern',       desc: 'Left sidebar with contact info.',              atsScore: 85,  twoColumn: true  },
  compact:      { name: 'Compact',      desc: 'Dense layout. Fits more on one page.',         atsScore: 95,  twoColumn: false },
  executive:    { name: 'Executive',    desc: 'Bold accent header. Senior-level roles.',      atsScore: 95,  twoColumn: false },
  minimal:      { name: 'Minimal',      desc: 'Ultra-clean whitespace-heavy design.',         atsScore: 100, twoColumn: false },
  bold:         { name: 'Bold',         desc: 'High-contrast typography. Stands out.',        atsScore: 90,  twoColumn: false },
  'sidebar-dark': { name: 'Sidebar Dark', desc: 'Dark sidebar accent. Creative roles.',      atsScore: 80,  twoColumn: true  },
  timeline:     { name: 'Timeline',     desc: 'Visual timeline for experience section.',      atsScore: 88,  twoColumn: false },
};
