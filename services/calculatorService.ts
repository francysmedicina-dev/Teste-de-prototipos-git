
import { CalculatorType } from "../types";

// Helper to calculate age from birthdate if needed, currently assumes age is passed as number
// Helper for formatting
const formatNum = (n: number) => parseFloat(n.toFixed(2));

export const calculateScore = (type: CalculatorType, inputs: any): { score: number, interpretation: string } => {
  switch (type) {
    case 'BMI':
      return calculateBMI(inputs.weight, inputs.height);
    case 'CockcroftGault':
      return calculateCockcroftGault(inputs.age, inputs.weight, inputs.creatinine, inputs.gender);
    case 'Chadsvasc':
      return calculateChadsvasc(inputs);
    case 'HasBled':
      return calculateHasBled(inputs);
    case 'ChildPugh':
      return calculateChildPugh(inputs);
    case 'WellsDVT':
      return calculateWellsDVT(inputs);
    case 'CURB65':
      return calculateCURB65(inputs);
    case 'MELD':
        return calculateMELD(inputs);
    default:
      return { score: 0, interpretation: "Calculadora não implementada." };
  }
};

// --- Implementations ---

const calculateBMI = (weight: number, height: number) => {
  if (!weight || !height) return { score: 0, interpretation: "" };
  // Height usually in cm or m. Let's assume cm if > 3, else m
  const h = height > 3 ? height / 100 : height;
  const bmi = formatNum(weight / (h * h));
  
  let interpretation = "";
  if (bmi < 18.5) interpretation = "Abaixo do peso";
  else if (bmi < 24.9) interpretation = "Peso normal";
  else if (bmi < 29.9) interpretation = "Sobrepeso";
  else if (bmi < 34.9) interpretation = "Obesidade Grau I";
  else if (bmi < 39.9) interpretation = "Obesidade Grau II";
  else interpretation = "Obesidade Grau III (Mórbida)";

  return { score: bmi, interpretation };
};

const calculateCockcroftGault = (age: number, weight: number, creatinine: number, gender: 'male' | 'female') => {
  if (!age || !weight || !creatinine) return { score: 0, interpretation: "" };
  
  let clcr = ((140 - age) * weight) / (72 * creatinine);
  if (gender === 'female') clcr *= 0.85;

  const score = formatNum(clcr);
  let interpretation = "";
  if (score > 90) interpretation = "Função renal normal (Estágio 1)";
  else if (score >= 60) interpretation = "Disfunção leve (Estágio 2)";
  else if (score >= 30) interpretation = "Disfunção moderada (Estágio 3)";
  else if (score >= 15) interpretation = "Disfunção grave (Estágio 4)";
  else interpretation = "Falência renal (Estágio 5)";

  return { score, interpretation: `${interpretation} ml/min` };
};

const calculateChadsvasc = (inputs: any) => {
  let score = 0;
  if (inputs.age >= 75) score += 2;
  else if (inputs.age >= 65) score += 1;
  
  if (inputs.gender === 'female') score += 1;
  if (inputs.heartFailure) score += 1;
  if (inputs.hypertension) score += 1;
  if (inputs.stroke) score += 2;
  if (inputs.vascularDisease) score += 1;
  if (inputs.diabetes) score += 1;

  let interpretation = "";
  if (score === 0) interpretation = "Baixo Risco (0). Anticoagulação oral geralmente não recomendada.";
  else if (score === 1) interpretation = "Risco Intermediário (1). Considerar anticoagulação oral ou antiagregação.";
  else interpretation = "Alto Risco (>=2). Anticoagulação oral recomendada.";

  return { score, interpretation };
};

const calculateHasBled = (inputs: any) => {
  let score = 0;
  if (inputs.hypertension) score += 1; // SBP > 160
  if (inputs.renalDisease) score += 1;
  if (inputs.liverDisease) score += 1;
  if (inputs.stroke) score += 1;
  if (inputs.bleedingHistory) score += 1;
  if (inputs.labileInr) score += 1;
  if (inputs.elderly) score += 1; // > 65
  if (inputs.drugs) score += 1; // Antiplatelet/NSAIDs
  if (inputs.alcohol) score += 1;

  let interpretation = "";
  if (score >= 3) interpretation = "Alto risco de sangramento. Requer monitoramento frequente e correção de fatores de risco reversíveis.";
  else interpretation = "Risco de sangramento baixo a moderado.";

  return { score, interpretation };
};

const calculateChildPugh = (inputs: any) => {
    let score = 0;
    
    // Bilirubin
    if (inputs.bilirubin < 2) score += 1;
    else if (inputs.bilirubin <= 3) score += 2;
    else score += 3;

    // Albumin
    if (inputs.albumin > 3.5) score += 1;
    else if (inputs.albumin >= 2.8) score += 2;
    else score += 3;

    // INR
    if (inputs.inr < 1.7) score += 1;
    else if (inputs.inr <= 2.3) score += 2;
    else score += 3;

    // Ascites (1=None, 2=Mild, 3=Severe)
    score += parseInt(inputs.ascites || 1);

    // Encephalopathy (1=None, 2=G1-2, 3=G3-4)
    score += parseInt(inputs.encephalopathy || 1);

    let interpretation = "";
    if (score <= 6) interpretation = "Classe A (Doença bem compensada). Sobrevida 1 ano: 100%.";
    else if (score <= 9) interpretation = "Classe B (Comprometimento funcional significativo). Sobrevida 1 ano: 80%.";
    else interpretation = "Classe C (Doença descompensada). Sobrevida 1 ano: 45%.";

    return { score, interpretation };
};

const calculateWellsDVT = (inputs: any) => {
    let score = 0;
    if (inputs.cancer) score += 1;
    if (inputs.paralysis) score += 1;
    if (inputs.bedridden) score += 1;
    if (inputs.tenderness) score += 1;
    if (inputs.swollenLeg) score += 1;
    if (inputs.calfSwelling) score += 1; // >3cm
    if (inputs.pittingEdema) score += 1;
    if (inputs.collateralVeins) score += 1;
    if (inputs.previousDVT) score += 1;
    if (inputs.altDiagnosis) score -= 2; // Alternative diagnosis as likely

    let interpretation = "";
    if (score <= 0) interpretation = "Baixa probabilidade de TVP.";
    else if (score <= 2) interpretation = "Moderada probabilidade de TVP.";
    else interpretation = "Alta probabilidade de TVP.";

    return { score, interpretation };
};

const calculateCURB65 = (inputs: any) => {
    let score = 0;
    if (inputs.confusion) score += 1;
    if (inputs.urea > 42.8) score += 1; // mg/dL (approx 7mmol/L)
    if (inputs.respRate >= 30) score += 1;
    if (inputs.lowBP) score += 1; // SBP < 90 or DBP <= 60
    if (inputs.age >= 65) score += 1;

    let interpretation = "";
    if (score <= 1) interpretation = "Baixo Risco. Considerar tratamento ambulatorial.";
    else if (score === 2) interpretation = "Risco Moderado. Considerar internação (enfermaria curta).";
    else interpretation = "Alto Risco (3-5). Internação necessária. Considerar UTI para escores 4-5.";

    return { score, interpretation };
};

const calculateMELD = (inputs: any) => {
    // MELD = 3.78×ln(bilirubin) + 11.2×ln(INR) + 9.57×ln(creatinine) + 6.43
    // Ensure min values of 1 to avoid log(0) or negative logs
    const bili = Math.max(inputs.bilirubin, 1);
    const inr = Math.max(inputs.inr, 1);
    const creat = Math.max(inputs.creatinine, 1); // Creatinine cap is usually 4.0 in classic MELD, handled by inputs?
    
    let score = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(creat) + 6.43;
    
    if (inputs.dialysis) {
        // If dialysis twice in past week, creatinine is set to 4.0
        // Re-calc logic simplified here, usually simply capping Creat to 4.0
        score = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(4.0) + 6.43;
    }

    score = Math.round(score);

    let interpretation = "";
    if (score >= 40) interpretation = "Mortalidade em 3 meses: 71.3%";
    else if (score >= 30) interpretation = "Mortalidade em 3 meses: 52.6%";
    else if (score >= 20) interpretation = "Mortalidade em 3 meses: 19.6%";
    else if (score >= 10) interpretation = "Mortalidade em 3 meses: 6.0%";
    else interpretation = "Mortalidade em 3 meses: 1.9%";

    return { score, interpretation };
}
