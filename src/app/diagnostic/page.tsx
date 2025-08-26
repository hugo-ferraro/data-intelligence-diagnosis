'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Download, Home } from 'lucide-react';
import { DiagnosticData, QUESTIONS, QuestionOption } from '@/types/diagnostic';
import { generatePDF } from '@/lib/pdf-generator';
import { saveDiagnosticData } from '@/lib/services/diagnostic-service';
import { useRouter } from 'next/navigation';
import { pushToDataLayer } from '@/components/GoogleTagManager';

const TOTAL_STEPS = 5;



export default function Diagnostic() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [data, setData] = useState<Partial<DiagnosticData>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSaved, setDataSaved] = useState(false);

  // Captura UTM / origem
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
      gclid: urlParams.get('gclid') || undefined,
      fbclid: urlParams.get('fbclid') || undefined
    };
    
    // Debug: Log captured UTM data
    console.log('Captured UTM data:', utmData);
    console.log('Current URL:', window.location.href);
    console.log('URL params:', window.location.search);
    
    setData((prev: Partial<DiagnosticData>) => ({ ...prev, ...utmData }));
  }, []);

  // Progresso no estilo da referência
  const calculateProgress = (): number => {
    let progress = 0;
    
    // Step 1: Name (10% when completed)
    if (data.nome?.trim()) {
      progress += 10;
    }
    
    // Step 2: Questions (60% total - 10% per question)
    const answeredQuestions = QUESTIONS.filter(q => data[q.id as keyof DiagnosticData]).length;
    progress += (answeredQuestions / QUESTIONS.length) * 60;
    
    // Step 3: Business info (15% when completed)
    if (data.empresa?.trim() && data.nicho?.trim() && data.funcionarios?.trim()) {
      progress += 15;
    }
    
    // Step 4: Contact & consent (15% when completed)
    if (data.email?.trim() && data.whatsapp?.trim() && data.privacyConsent) {
      progress += 15;
    }
    
    return Math.min(100, Math.max(0, progress));
  };
  
  const progress = calculateProgress();

  const handleNext = () => {
    if (currentStep === 2 && currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep(currentStep + 1);
      if (currentStep === 2) setCurrentQuestion(0);
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 3) setCurrentQuestion(QUESTIONS.length - 1);
    }
  };

  const handleSubmit = async () => {
    // Track form submission with GTM
    pushToDataLayer({
      event: 'form_submit',
      form_name: 'diagnostic_form',
      form_data: {
        nome: data.nome || '',
        empresa: data.empresa || '',
        nicho: data.nicho || '',
        funcionarios: data.funcionarios || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        privacyConsent: data.privacyConsent || false,
        // UTM/Attribution data
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        gclid: data.gclid,
        fbclid: data.fbclid,
        // Question responses
        Q1: data.Q1 || '',
        Q2: data.Q2 || '',
        Q3: data.Q3 || '',
        Q4: data.Q4 || '',
        Q5: data.Q5 || '',
        Q6: data.Q6 || '',
      }
    });
    
    localStorage.setItem('diagnosticData', JSON.stringify(data));
    setCurrentStep(5);
    setIsGenerating(true);
    
    try {
      // Prepare data for database
      const dataToSave = {
        nome: data.nome || '',
        Q1: data.Q1 || 'A',
        Q2: data.Q2 || 'A',
        Q3: data.Q3 || 'A',
        Q4: data.Q4 || 'A',
        Q5: data.Q5 || 'A',
        Q6: data.Q6 || 'A',
        empresa: data.empresa || '',
        nicho: data.nicho || '',
        funcionarios: data.funcionarios || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        privacyConsent: data.privacyConsent || false,
        // UTM/Attribution data
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        gclid: data.gclid,
        fbclid: data.fbclid,
      };
      
      // Debug: Log data being sent to database
      console.log('Data being sent to database:', dataToSave);
      
      // Save data to database
      await saveDiagnosticData(dataToSave);
      
      setDataSaved(true);
      
      // Generate PDF using the new client-side generator
      const pdfBlob = await generatePDF(data as DiagnosticData);
      setPdfBlob(pdfBlob);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error processing form:', error);
      setError('Erro ao processar o formulário. Tente novamente.');
      setIsGenerating(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(data.nome && data.nome.trim().length > 0);
      case 2: {
        const questionId = QUESTIONS[currentQuestion].id as keyof DiagnosticData;
        return Boolean(data[questionId]);
      }
      case 3:
        return Boolean(data.empresa?.trim() && data.nicho?.trim() && data.funcionarios?.trim());
      case 4:
        return Boolean(data.email?.trim() && data.whatsapp?.trim() && data.privacyConsent);
      default:
        return false;
    }
  };

  const handleDownload = () => {
    if (pdfBlob && data) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostico-maturidade-dados-${data.nome || 'usuario'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Textos para o cabeçalho fixo (estilo referência)
  const stepHeader = () => {
    if (currentStep === 2) {
      const badge = QUESTIONS[currentQuestion].category;
      return {
        leftTitle: `Pergunta ${currentQuestion + 1} de ${QUESTIONS.length}`,
        rightTitle: (
          <>
            <span className="text-primary font-medium">
              {badge}
            </span>
          </>
        ),
      };
    }
    const map: Record<number, { left: string; right: string }> = {
      1: { left: 'Identificação', right: 'Dados iniciais' },
      3: { left: 'Informações do Negócio', right: 'Empresa' },
      4: { left: 'Contato & LGPD', right: 'Consentimento' },
      5: { left: 'Gerando Diagnóstico', right: 'PDF' },
    };
    const h = map[currentStep] ?? { left: 'Etapa', right: '' };
    return {
      leftTitle: h.left,
      rightTitle: <span className="text-primary font-medium">{h.right}</span>,
    };
  };

  const header = stepHeader();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar fixa com progresso (layout da referência) */}
      <div className="w-full mx-auto fixed top-0 left-0 right-0 z-30 bg-white/95 pt-4 pb-2 px-4 shadow-md">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-0 break-words overflow-hidden">
              <span className="font-semibold text-gray-700 mb-1 sm:mb-0 sm:mr-3">
                {header.leftTitle}
              </span>
              <span className="hidden sm:inline text-gray-400 mr-3" aria-hidden="true">
                •
              </span>
              {header.rightTitle}
            </div>
            <span
              className="font-medium text-primary"
              aria-live="polite"
              aria-atomic="true"
            >
              {Math.round(progress)}%
            </span>
          </div>

          {/* Barra de progresso no estilo puro da referência */}
          <div
            aria-valuemax={100}
            aria-valuemin={0}
            role="progressbar"
            data-state="indeterminate"
            data-max="100"
            className="relative w-full overflow-hidden rounded-full h-2 bg-gray-100"
            aria-label={`Progresso: ${Math.round(progress)}%`}
          >
            <div
              className="h-full flex-1 bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Início</span>
            <span>Fim</span>
          </div>
        </div>
      </div>

      {/* Conteúdo central com espaçamento para a topbar */}
      <main className="w-full">
        <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-12">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl">
              <div className="flex justify-center items-start px-2 mt-24 sm:mt-28 py-8">
                {/* Card no estilo referência: borda superior laranja e sombra */}
                <form 
                  id="diagnostic-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentStep === 4 && canProceed()) {
                      handleSubmit();
                    }
                  }}
                  className="rounded-lg border bg-card text-card-foreground w-full max-w-4xl mx-auto shadow-lg border-t-4 border-t-primary"
                >
                  <div className="p-6 pt-6 pb-6 px-4 md:pt-8 md:pb-8 md:px-6">
                    {/* Cabeçalho do card (badge + contadores) somente na etapa 2 */}
                    {currentStep === 2 && (
                      <div className="mb-4 md:mb-6">
                        <div className="flex items-center mb-2 md:mb-3 flex-wrap gap-2">
                          <span className="bg-primary text-primary-foreground font-semibold text-xs md:text-sm px-2 py-1 md:px-3 md:py-1 rounded-full">
                            {QUESTIONS[currentQuestion].category}
                          </span>
                          <div className="text-xs md:text-sm text-gray-500">
                            <span>
                              Pergunta {currentQuestion + 1} de {QUESTIONS.length}{' '}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-800 break-words">
                          {QUESTIONS[currentQuestion].title}
                        </h2>
                      </div>
                    )}

                    {/* Conteúdo por etapa */}
                    <div className="space-y-6">
                      {/* Etapa 1: Identificação */}
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <Label htmlFor="nome" className="text-lg font-medium">
                            Qual o seu nome?
                          </Label>
                          <Input
                            id="nome"
                            placeholder="Digite seu nome completo"
                            value={data.nome || ''}
                            onChange={(e) =>
                              setData((prev) => ({ ...prev, nome: e.target.value }))
                            }
                            className="text-lg p-4"
                          />
                        </div>
                      )}

                      {/* Etapa 2: Perguntas (layout dos botões como na referência) */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div className="max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-1 md:pr-3 pb-4 pt-1">
                            <div className="space-y-3 md:space-y-4">
                              {Object.entries(QUESTIONS[currentQuestion].options).map(
                                ([key, text]) => {
                                  const selected =
                                    data[
                                      QUESTIONS[currentQuestion].id as keyof DiagnosticData
                                    ] === (key as QuestionOption);

                                  return (
                                    <button
                                      key={key}
                                      onClick={() => {
                                        const qid =
                                          QUESTIONS[currentQuestion].id as keyof DiagnosticData;
                                        setData((prev) => ({
                                          ...prev,
                                          [qid]: key as QuestionOption,
                                        }));
                                      }}
                                      className={[
                                        'w-full p-3 sm:p-4 md:p-4 text-left border-2 rounded-lg transition-all duration-300 break-words',
                                        'hover:border-primary hover:bg-orange-50 border-gray-200',
                                        selected
                                          ? 'border-primary bg-orange-50'
                                          : '',
                                      ].join(' ')}
                                      aria-label={`Opção ${key}: ${text}`}
                                    >
                                      <div className="flex items-start gap-2 md:gap-3">
                                        <span
                                          className={[
                                            'font-medium flex items-center justify-center',
                                            'w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0 mt-0.5',
                                            'bg-gray-100 text-gray-600',
                                          ].join(' ')}
                                          aria-hidden="true"
                                        >
                                          {key}
                                        </span>
                                        <span className="text-gray-700 whitespace-normal text-xs sm:text-sm md:text-sm lg:text-base">
                                          {text}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Etapa 3: Informações do Negócio */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="empresa" className="text-lg font-medium">
                              Nome da empresa
                            </Label>
                            <Input
                              id="empresa"
                              placeholder="Digite o nome da sua empresa"
                              value={data.empresa || ''}
                              onChange={(e) =>
                                setData((prev) => ({ ...prev, empresa: e.target.value }))
                              }
                              className="mt-2 text-lg p-4"
                            />
                          </div>

                          <div>
                            <Label htmlFor="nicho" className="text-lg font-medium">
                              Nicho
                            </Label>
                            <Select
                              value={data.nicho || ''}
                              onValueChange={(value) =>
                                setData((prev) => ({ ...prev, nicho: value }))
                              }
                            >
                              <SelectTrigger className="mt-2 text-lg p-4">
                                <SelectValue placeholder="Selecione o nicho do seu negócio" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                                <SelectItem value="saude">Saúde</SelectItem>
                                <SelectItem value="educacao">Educação</SelectItem>
                                <SelectItem value="varejo">Varejo</SelectItem>
                                <SelectItem value="servicos">Serviços</SelectItem>
                                <SelectItem value="industria">Indústria</SelectItem>
                                <SelectItem value="financeiro">Financeiro</SelectItem>
                                <SelectItem value="alimentacao">Alimentação</SelectItem>
                                <SelectItem value="construcao">Construção</SelectItem>
                                <SelectItem value="consultoria">Consultoria</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="funcionarios" className="text-lg font-medium">
                              Quantidade de funcionários
                            </Label>
                            <Select
                              value={data.funcionarios || ''}
                              onValueChange={(value) =>
                                setData((prev) => ({ ...prev, funcionarios: value }))
                              }
                            >
                              <SelectTrigger className="mt-2 text-lg p-4">
                                <SelectValue placeholder="Selecione a quantidade de funcionários" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 funcionários</SelectItem>
                                <SelectItem value="11-50">11-50 funcionários</SelectItem>
                                <SelectItem value="51-200">51-200 funcionários</SelectItem>
                                <SelectItem value="201-500">201-500 funcionários</SelectItem>
                                <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                                <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Etapa 4: Contato & Consentimento */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="email" className="text-lg font-medium">
                              E-mail
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              value={data.email || ''}
                              onChange={(e) =>
                                setData((prev) => ({ ...prev, email: e.target.value }))
                              }
                              className="mt-2 text-lg p-4"
                            />
                          </div>

                          <div>
                            <Label htmlFor="whatsapp" className="text-lg font-medium">
                              WhatsApp
                            </Label>
                            <Input
                              id="whatsapp"
                              placeholder="(11) 99999-9999"
                              value={data.whatsapp || ''}
                              onChange={(e) =>
                                setData((prev) => ({ ...prev, whatsapp: e.target.value }))
                              }
                              className="mt-2 text-lg p-4"
                            />
                          </div>

                          <div className="flex items-start space-x-3 p-4 border rounded-lg">
                            <Checkbox
                              id="privacy"
                              checked={data.privacyConsent || false}
                              onCheckedChange={(checked) =>
                                setData((prev) => ({
                                  ...prev,
                                  privacyConsent: !!checked,
                                }))
                              }
                            />
                            <label
                              htmlFor="privacy"
                              className="text-sm leading-relaxed cursor-pointer"
                            >
                              <span className="underline text-primary cursor-pointer">
                                Li e concordo com a Política de Privacidade
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Etapa 5: Loading e Download */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div className="text-center py-8">
                            {error ? (
                              <>
                                {/* Error state */}
                                <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center bg-red-100">
                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                  </svg>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                  Ops! Algo deu errado
                                </h2>
                                <p className="text-gray-600 max-w-md mx-auto mb-8">
                                  {error}
                                </p>
                              </>
                            ) : isGenerating ? (
                              <>
                                {/* Loading animation */}
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                  <div 
                                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
                                    style={{ borderTopColor: '#f27e1a' }}
                                  ></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div 
                                      className="w-16 h-16 rounded-full"
                                      style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                  O seu diagnóstico está sendo preparado
                                </h2>
                                <p className="text-gray-600 max-w-md mx-auto">
                                  Estamos processando suas respostas e gerando um relatório personalizado para você.
                                </p>
                              </>
                            ) : (
                              <>
                                {/* Success state */}
                                <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}>
                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                  </svg>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                  Diagnóstico concluído!
                                </h2>
                                <p className="text-gray-600 max-w-md mx-auto mb-8">
                                  Seu relatório personalizado está pronto para download.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                  <Button
                                    onClick={handleDownload}
                                    className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 px-8 py-4 text-lg"
                                    style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}
                                  >
                                    <Download className="w-5 h-5" />
                                    Baixar diagnóstico
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    onClick={handleBackToHome}
                                    className="flex items-center gap-2 px-8 py-4 text-lg border-2 border-gray-300 hover:border-primary"
                                  >
                                    <Home className="w-5 h-5" />
                                    Voltar ao início
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Navegação (botões iguais, só ajustei o visual para harmonizar) */}
                      {currentStep !== 5 && (
                        <div className="flex items-center justify-between gap-3 pt-6">
                          <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1 && currentQuestion === 0}
                            className="flex items-center"
                            type="button"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Voltar
                          </Button>

                          <Button
                            type={currentStep === 4 ? "submit" : "button"}
                            onClick={currentStep !== 4 ? handleNext : undefined}
                            disabled={!canProceed()}
                            className="bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                            variant="default"
                          >
                            {currentStep === 4 ? 'Ver Resultado' : 'Próximo'}
                            {currentStep !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
                {/* /card */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
