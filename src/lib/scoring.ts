import { DiagnosticData, QuestionOption, ScoreResult } from '@/types/diagnostic';
import dicionario from '@/content/dicionario.json';

// Question weights as specified (recalculated for 6 questions)
const WEIGHTS = {
  Q1: 0.25,
  Q2: 0.20,
  Q3: 0.15,
  Q4: 0.20,
  Q5: 0.15,
  Q6: 0.05
};

// Option scores
const OPTION_SCORES: Record<QuestionOption, number> = {
  A: 0,
  B: 2,
  C: 3.5,
  D: 5
};

export function calculateScore(data: DiagnosticData): ScoreResult {
  // Calculate base scores (0-5 scale)
  const rawScores = {
    Q1: OPTION_SCORES[data.Q1],
    Q2: OPTION_SCORES[data.Q2], 
    Q3: OPTION_SCORES[data.Q3],
    Q4: OPTION_SCORES[data.Q4],
    Q5: OPTION_SCORES[data.Q5],
    Q6: OPTION_SCORES[data.Q6]
  };

  // Calculate weighted score (0-5 scale)
  let S05 = 0;
  Object.keys(WEIGHTS).forEach(q => {
    S05 += WEIGHTS[q as keyof typeof WEIGHTS] * rawScores[q as keyof typeof rawScores];
  });

  // Convert to 0-100 scale
  let totalScore = Math.round(S05 * 20);

  // Apply caps
  if (rawScores.Q1 <= 2 || rawScores.Q2 <= 2) {
    totalScore = Math.min(totalScore, 49);
  }

  // Calculate subscores (0-100 scale) 
  const subscores = {
    plataforma: Math.round(((rawScores.Q1 + rawScores.Q2) / 2) * 20),
    praticaAnalitica: Math.round(((rawScores.Q3 + rawScores.Q5) / 2) * 20),
    insight: Math.round(((rawScores.Q4 + rawScores.Q6) / 2) * 20)
  };

  // Determine level
  let nivel: ScoreResult['nivel'];
  if (totalScore <= 24) nivel = 'Inicial';
  else if (totalScore <= 49) nivel = 'Básica';
  else if (totalScore <= 74) nivel = 'Intermediária';
  else nivel = 'Avançada';

  // Get analysis from dictionary using paragraph-based system
  const analysis = getAnalysisFromDictionary(data, nivel, subscores);

  return {
    totalScore,
    nivel,
    subscores,
    analysis
  };
}

function getAnalysisFromDictionary(
  data: DiagnosticData, 
  nivel: ScoreResult['nivel'],
  subscores: ScoreResult['subscores']
): ScoreResult['analysis'] {
  // Generate analysis with individual paragraphs and their categories
  const questionCategories = {
    Q1: 'Infraestrutura de Dados',
    Q2: 'Acesso e Disponibilidade', 
    Q3: 'Frequência de Análise',
    Q4: 'Capacidade de Cruzar Informações',
    Q5: 'Tomada de Decisão Baseada em Dados',
    Q6: 'Descoberta de Oportunidades'
  };
  
  const analysisParagraphs: Array<{category: string, content: string}> = [];
  
  // Add paragraphs for each question with their categories
  const questions = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];
  questions.forEach(q => {
    const answer = data[q as keyof DiagnosticData] as QuestionOption;
    const questionKey = q as keyof typeof dicionario.paragraphs;
    if (answer && dicionario.paragraphs[questionKey] && dicionario.paragraphs[questionKey][answer]) {
      analysisParagraphs.push({
        category: questionCategories[q as keyof typeof questionCategories],
        content: dicionario.paragraphs[questionKey][answer]
      });
    }
  });

  return {
    ondeEsta: analysisParagraphs.map(p => p.content).join(' '),
    significado: `Este diagnóstico mostra que sua empresa está no nível ${nivel.toLowerCase()} de maturidade em dados. As análises abaixo refletem o estado atual de cada dimensão avaliada.`,
    proximosPassos: [],
    paragraphs: analysisParagraphs
  };
}

export function getDimensionColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getDimensionName(key: keyof ScoreResult['subscores']): string {
  const names = {
    plataforma: 'Plataforma',
    praticaAnalitica: 'Prática Analítica', 
    insight: 'Insight'
  };
  return names[key];
}