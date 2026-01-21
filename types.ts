export interface PhotoEntry {
  id: string;
  imageSrc: string; // Base64 data URL
  description: string;
  timestamp: number;
}

export type ViewMode = 'edit' | 'preview';