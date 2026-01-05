
export interface Memory {
  id: string;
  date: string; // ISO format
  title: string;
  location: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number;
  image?: string; // base64
  category: 'Restaurante' | 'Parque' | 'Viagem' | 'Cinema' | 'Outro';
  updatedAt: number; // For sync conflict resolution
}

export type ViewType = 'timeline' | 'calendar';

export interface SyncConfig {
  familyKey: string;
  lastSynced: number;
  isAutoSyncEnabled: boolean;
}
