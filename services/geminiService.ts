import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiSuggestionResponse, Institution } from "../types";
import { canRequestSuggestion } from "./usageService";

// Initialize the client correctly with the API key string
// Safely access environment variables to prevent runtime crashes
let apiKey = "";
try {
  // @ts-ignore - process might be replaced by Vite define
  apiKey = process.env.API_KEY || "";
} catch (e) {
  // Fallback or silence error
  console.warn("API Key lookup failed");
}

const ai = new GoogleGenerativeAI(apiKey);

export const suggestPrescription = async (
  diagnosis: string, 
  age: string,
  isPediatric: boolean = false,
  pediatricData: string = ""
): Promise<AiSuggestionResponse | null> => {
  
  // TEMPORARILY DISABLED FEATURE
  throw new Error("A função de IA está temporariamente desativada.");

  /* 
  // ENFORCE USAGE LIMITS (BACKEND GUARD)
  if (!canRequestSuggestion()) {
    throw new Error("Limite de uso atingido (Cooldown de 5min ou Limite Diário).");
  }

  try {
    const ageContext = isPediatric 
      ? `PACIENTE PEDIÁTRICO. Idade/Detalhes: ${pediatricData || age}.` 
      : `Paciente adulto de ${age} anos.`;

    const specialtyContext = isPediatric
      ? "Atue como um PEDIATRA especialista experiente no Brasil."
      : "Atue como um médico clínico especialista experiente no Brasil.";

    const prompt = `
      ${specialtyContext}
      Com base no diagnóstico "${diagnosis}" para: ${ageContext}, sugira uma prescrição médica padrão.
      As sugestões devem seguir os protocolos clínicos brasileiros.
      
      ${isPediatric ? "IMPORTANTE: Calcule as dosagens estritamente baseadas na faixa etária/peso informados. Prefira formas farmacêuticas adequadas para crianças (xarope, gotas, suspensão)." : ""}
      
      Retorne APENAS os medicamentos sugeridos em formato JSON estruturado.
      Inclua:
      1. Nome do medicamento (genérico + apresentação).
      2. Concentração/Dose.
      3. Frequência (Posologia).
      4. Duração.
      5. Instruções especiais.
      6. Quantidade total estimada para o tratamento (ex: se for 7 dias de antibiótico, calcule quantos frascos ou comprimidos são necessários).
      7. Unidade de fornecimento (Caixa, Frasco, Comprimido, etc).
      
      AVISO: Isso é apenas uma sugestão para auxílio médico.
    `;

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      // Basic JSON extraction if the model wraps it in markdown code blocks
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText) as AiSuggestionResponse;
    }
    return null;

  } catch (error) {
    console.error("Error generating prescription suggestion:", error);
    throw error;
  }
  */
};

export const checkInteractions = async (
  medications: string[], 
  isPregnant: boolean,
  isPediatric: boolean = false,
  pediatricData: string = ""
): Promise<string> => {
  // TEMPORARILY DISABLED FEATURE
  return "Verificação de interações temporariamente indisponível.";

  /*
  try {
    const list = medications.join(", ");
    
    let alertContext = "";
    if (isPregnant) {
      alertContext += " A paciente é GESTANTE. É CRUCIAL verificar a classificação de risco na gravidez (FDA/ANVISA). Alerte IMEDIATAMENTE se houver risco de teratogenicidade.";
    }
    if (isPediatric) {
      alertContext += ` O paciente é PEDIÁTRICO (Detalhes: ${pediatricData}). Verifique se os medicamentos, DOSAGENS e FORMAS FARMACÊUTICAS são seguros para esta faixa etária/peso. Alerte sobre contraindicações em crianças.`;
    }

    const prompt = `
      Analise a seguinte lista de medicamentos para possíveis interações medicamentosas graves, contraindicações importantes ou erros de dosagem óbvios: ${list}. 
      ${alertContext}
      Responda de forma breve e direta em Português do Brasil. 
      Se houver riscos para gestante ou crianças, destaque isso EM PRIMEIRO LUGAR.
      Se não houver interações graves conhecidas e for seguro, diga "Nenhuma interação grave detectada."
    `;

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Não foi possível verificar interações.";
  } catch (error) {
    console.error("Error checking interactions:", error);
    return "Erro ao verificar interações.";
  }
  */
};

export const findInstitutionDetails = async (query: string): Promise<Partial<Institution> | null> => {
  // TEMPORARILY DISABLED FEATURE
  return null;
  /*
  try {
    // Note: Google Search Grounding requires specific model/tool config which might vary by SDK version.
    // Assuming standard generation for now as placeholder.
    return null; 
  } catch (error) {
    console.error("Error searching institution:", error);
    return null;
  }
  */
};

export const generateCalculatorAdvice = async (
  calculatorId: string,
  score: number,
  inputs: any,
  patientContext: string = ""
): Promise<{ recommendation: string }> => {
  // TEMPORARILY DISABLED FEATURE
  return { recommendation: "Sugestão de conduta via IA temporariamente indisponível." };
  /*
  try {
    const prompt = `
      Atue como um médico especialista experiente.
      Analise o resultado da seguinte calculadora clínica: ${calculatorId}.
      Resultado (Score): ${score}.
      Dados de entrada: ${JSON.stringify(inputs)}.
      Contexto do paciente: ${patientContext}.

      Forneça uma recomendação clínica concisa e prática baseada neste resultado.
      Explique brevemente o significado clínico e sugira a próxima conduta médica (ex: exames, internação, ajuste de dose).
      Mantenha a resposta em Português do Brasil, profissional e direta. Máximo de 3 frases.
    `;

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return { recommendation: response.text() || "Sem recomendação gerada." };
  } catch (error) {
    console.error("Error generating calculator advice:", error);
    return { recommendation: "Erro ao gerar recomendação via IA." };
  }
  */
};