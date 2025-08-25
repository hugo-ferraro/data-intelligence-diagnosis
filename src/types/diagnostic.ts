export type QuestionOption = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  category: string;
  title: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface DiagnosticData {
  // Step 1: Identificação
  nome: string;
  
  // Step 2: Diagnóstico (6 questions)
  Q1: QuestionOption;
  Q2: QuestionOption;
  Q3: QuestionOption;
  Q4: QuestionOption;
  Q5: QuestionOption;
  Q6: QuestionOption;
  
  // Step 3: Negócio  
  empresa: string;
  nicho: string;
  funcionarios: string;
  
  // Step 4: Contato & Consentimento
  email: string;
  whatsapp: string;
  privacyConsent: boolean;
  
  // UTM/Attribution data
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingUrl?: string;
  gclid?: string;
  fbclid?: string;
}

export interface ScoreResult {
  totalScore: number; // 0-100
  nivel: 'Inicial' | 'Básica' | 'Intermediária' | 'Avançada';
  subscores: {
    plataforma: number; // 0-100
    praticaAnalitica: number; // 0-100
    insight: number; // 0-100
  };
  analysis: {
    ondeEsta: string;
    significado: string;
    proximosPassos: string[];
    paragraphs?: Array<{
      category: string;
      content: string;
    }>;
  };
}

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    category: 'Infraestrutura de Dados',
    title: 'Onde e como você armazena as informações do seu negócio?',
    options: {
      A: 'Principalmente no papel, WhatsApp ou na memória',
      B: 'Planilhas soltas ou um sistema básico sem integração', 
      C: 'Sistema integrado que centraliza clientes, vendas e estoque',
      D: 'Múltiplos sistemas integrados com backup automático e acesso controlado'
    }
  },
  {
    id: 'Q2',
    category: 'Acesso e Disponibilidade',
    title: 'Quão rápido você consegue uma informação específica quando precisa?',
    options: {
      A: 'Preciso procurar em vários lugares e demoro horas/dias',
      B: 'Consigo a maioria das informações em alguns cliques, mas às vezes é trabalhoso',
      C: 'Informações principais estão sempre a poucos cliques de distância', 
      D: 'Qualquer informação relevante fica disponível em segundos, inclusive no celular'
    }
  },
  {
    id: 'Q3',
    category: 'Frequência de Análise',
    title: 'Com que regularidade você olha os números do seu negócio?',
    options: {
      A: 'Apenas quando surge algum problema ou no fim do mês',
      B: 'Semanalmente verifico faturamento e algumas métricas básicas',
      C: 'Diariamente acompanho indicadores principais e semanalmente faço análises',
      D: 'Tenho dashboards que consulto diariamente e análises semanais estruturadas'
    }
  },
  {
    id: 'Q4', 
    category: 'Capacidade de Cruzar Informações',
    title: 'Você consegue conectar dados de diferentes áreas para entender o negócio?',
    options: {
      A: 'Cada informação fica isolada, não consigo conectar',
      B: 'Consigo relacionar algumas informações com esforço manual',
      C: 'Cruzo dados facilmente entre vendas, clientes e estoque',
      D: 'Analiso relações complexas (ex: margem por cliente, sazonalidade por produto)'
    }
  },
  {
    id: 'Q5',
    category: 'Tomada de Decisão Baseada em Dados',
    title: 'Quando você toma uma decisão importante, como usa as informações disponíveis?', 
    options: {
      A: 'Decido principalmente por experiência e intuição',
      B: 'Consulto alguns números para validar o que já penso',
      C: 'Analiso dados históricos antes de decidir',
      D: 'Comparo cenários, analiso tendências e testo hipóteses antes de decidir'
    }
  },
  {
    id: 'Q6',
    category: 'Descoberta de Oportunidades',
    title: 'Você identifica oportunidades analisando padrões nos seus dados?',
    options: {
      A: 'Oportunidades aparecem por acaso ou observação casual',
      B: 'Às vezes noto padrões óbvios (ex: produto que vende mais)',
      C: 'Regularmente descubro insights úteis (ex: clientes mais lucrativos, horários de pico)',
      D: 'Consistentemente encontro oportunidades não óbvias que geram resultados mensuráveis'
    }
  }
];