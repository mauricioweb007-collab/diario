
import { GoogleGenAI } from "@google/genai";

// Always use the direct process.env.API_KEY as per initialization guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function enhanceMemoryDescription(title: string, description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Melhore o seguinte texto de um diário de casal para torná-lo mais poético e memorável, mantendo a essência. 
      Título do passeio: ${title}
      Descrição: ${description}
      Por favor, retorne apenas o texto melhorado em português.`,
    });
    // Use the .text property directly as per GenerateContentResponse guidelines
    return response.text || description;
  } catch (error) {
    console.error("Erro ao melhorar descrição:", error);
    return description;
  }
}

export async function generateTripSummary(memoriesCount: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O casal já registrou ${memoriesCount} aventuras juntos. Escreva uma mensagem curta, carinhosa e motivadora para incentivá-los a continuar explorando o mundo juntos.`,
    });
    // Use the .text property directly as per GenerateContentResponse guidelines
    return response.text || "Continuem criando memórias lindas juntos!";
  } catch (error) {
    return "Cada dia ao seu lado é uma nova aventura.";
  }
}
