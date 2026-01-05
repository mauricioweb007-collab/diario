
import { Memory } from '../types';

const LOCAL_STORAGE_KEY = 'aventuras_casal_local';
const FAMILY_KEY_STORAGE = 'aventuras_family_key';

// Bucket público para persistência real entre dispositivos
const CLOUD_API_URL = 'https://kvdb.io/A6j5Lp8YnE7G4k9M2q1s'; 

export const SyncService = {
  // Salva no navegador (Imediato)
  saveLocal(memories: Memory[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memories));
    } catch (e) {
      console.error("Erro ao salvar localmente (provavelmente falta de espaço):", e);
    }
  },

  // Recupera do navegador
  getLocal(): Memory[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // SINCRONIZA COM A NUVEM
  async pushToCloud(familyKey: string, memories: Memory[]): Promise<boolean> {
    if (!familyKey || familyKey.length < 3) return false;
    
    try {
      const response = await fetch(`${CLOUD_API_URL}/${familyKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: memories,
          lastUpdate: Date.now()
        }),
      });
      return response.ok;
    } catch (e) {
      console.warn("Erro de rede ao sincronizar:", e);
      return false;
    }
  },

  // BUSCA DADOS DA NUVEM
  async pullFromCloud(familyKey: string): Promise<Memory[] | null> {
    if (!familyKey || familyKey.length < 3) return null;
    
    try {
      const response = await fetch(`${CLOUD_API_URL}/${familyKey}`);
      if (!response.ok) return null;
      
      const json = await response.json();
      return json.data || [];
    } catch (e) {
      return null;
    }
  },

  // Fix: Added missing generateFamilyKey method to generate a unique short code for sharing
  generateFamilyKey() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  generateId() {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};
