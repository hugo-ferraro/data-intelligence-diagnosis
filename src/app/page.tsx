// Single page application for data maturity diagnosis
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Download, Home as HomeIcon } from 'lucide-react';
import { DiagnosticData, QUESTIONS, QuestionOption, ScoreResult } from '@/types/diagnostic';
import { generatePDF } from '@/lib/pdf-generator';
import { saveDiagnosticData } from '@/lib/services/diagnostic-service';
import { calculateScore, getDimensionName } from '@/lib/scoring';
import { isValidEmail, isValidWhatsApp, formatWhatsApp } from '@/lib/utils';
import { pushToDataLayer } from '@/components/GoogleTagManager';
import { useIsMobile } from '@/hooks/use-mobile';

// View types for single page app
type View = 'home' | 'diagnostic';

export default function Home() {
  // Mobile detection
  const isMobile = useIsMobile();
  
  // State for managing current view
  const [currentView, setCurrentView] = useState<View>('home');
  
  // Diagnostic state
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [data, setData] = useState<Partial<DiagnosticData>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSaved, setDataSaved] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    whatsapp?: string;
  }>({});

  // Persist state in localStorage and restore on page load
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed && parsed.currentView && parsed.currentStep) {
          console.log('Restoring state from localStorage:', parsed);
          
          // If user was in diagnostic mode, force them to stay in diagnostic mode
          if (parsed.currentView === 'diagnostic') {
            setCurrentView('diagnostic');
            setCurrentStep(parsed.currentStep);
            setCurrentQuestion(parsed.currentQuestion || 0);
            setData(parsed.data || {});
            setIsGenerating(parsed.isGenerating || false);
            setError(parsed.error || null);
            setDataSaved(parsed.dataSaved || false);
            setResult(parsed.result || null);
            setIsSubmitting(parsed.isSubmitting || false);
            setValidationErrors(parsed.validationErrors || {});
            
            // If the diagnostic was completed (step 5), ensure we stay in diagnostic view
            // and regenerate the PDF if needed
            if (parsed.currentStep === 5 && parsed.dataSaved && !parsed.isGenerating) {
              // The diagnostic is complete, user should see the completion screen
              console.log('Diagnostic completed, staying in diagnostic view');
              
              // Try to restore PDF blob from localStorage first
              const savedPdfBlob = localStorage.getItem('pdfBlob');
              if (savedPdfBlob && typeof fetch === 'function') {
                // Convert base64 back to blob
                fetch(savedPdfBlob)
                  .then(res => res.blob())
                  .then(blob => {
                    setPdfBlob(blob);
                  })
                  .catch(error => {
                    console.error('Error restoring PDF blob:', error);
                    // If restoration fails, regenerate the PDF
                    if (parsed.data && typeof generatePDF === 'function') {
                      console.log('Regenerating PDF for completed diagnostic');
                      generatePDF(parsed.data as DiagnosticData)
                        .then(blob => {
                          setPdfBlob(blob);
                        })
                        .catch(error => {
                          console.error('Error regenerating PDF:', error);
                          setError('Erro ao regenerar o PDF. Tente novamente.');
                        });
                    }
                  });
              } else if (parsed.data && typeof generatePDF === 'function') {
                // No saved PDF blob, regenerate it
                console.log('Regenerating PDF for completed diagnostic');
                generatePDF(parsed.data as DiagnosticData)
                  .then(blob => {
                    setPdfBlob(blob);
                  })
                  .catch(error => {
                    console.error('Error regenerating PDF:', error);
                    setError('Erro ao regenerar o PDF. Tente novamente.');
                  });
              }
            }
          } else {
            // Only restore home state if they were actually on home
            setCurrentView('home');
          }
        }
      }
    } catch (error) {
      console.error('Error restoring state:', error);
    }
  }, []);

  // Capture UTM parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
      utmAdset: urlParams.get('utm_adset') || undefined,
      utmAd: urlParams.get('utm_ad') || undefined,
      gclid: urlParams.get('gclid') || undefined,
      fbclid: urlParams.get('fbclid') || undefined
    };
    
    // Debug: Log captured UTM data
    console.log('Captured UTM data:', utmData);
    console.log('Current URL:', window.location.href);
    console.log('URL params:', window.location.search);
    
    setData((prev: Partial<DiagnosticData>) => ({ ...prev, ...utmData }));
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        currentView,
        currentStep,
        currentQuestion,
        data,
        isGenerating,
        error,
        dataSaved,
        result,
        isSubmitting,
        validationErrors
      };
      localStorage.setItem('appState', JSON.stringify(stateToSave));
    
      // Save PDF blob separately if it exists
      if (pdfBlob) {
        // Convert blob to base64 for localStorage storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          localStorage.setItem('pdfBlob', base64);
        };
        reader.readAsDataURL(pdfBlob);
      }
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [currentView, currentStep, currentQuestion, data, isGenerating, error, dataSaved, result, isSubmitting, validationErrors, pdfBlob]);

  const handleStartDiagnostic = () => {
    // Track diagnostic start
    pushToDataLayer({
      event: 'diagnostic_start',
      form_name: 'diagnostic_form'
    });
    
    setCurrentView('diagnostic');
  };



  // Diagnostic functions
  const handleNext = () => {
    if (currentStep === 2 && currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Track step completion
      pushToDataLayer({
        event: 'step_completed',
        form_name: 'diagnostic_form',
        step_number: currentStep,
        step_name: currentStep === 1 ? 'identification' : 
                  currentStep === 2 ? 'questions' : 
                  currentStep === 3 ? 'business_info' : 
                  'contact_consent'
      });
      
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
    console.log('handleSubmit called - currentView:', currentView);
    
    // Prevent multiple submissions
    if (currentStep === 5 || isSubmitting) {
      console.log('Already in step 5 or submitting, preventing duplicate submission');
      return;
    }
    
    // Set submitting state to prevent navigation
    setIsSubmitting(true);
    
    // Store data in localStorage first
    localStorage.setItem('diagnosticData', JSON.stringify(data));
    
    // Calculate maturity score for tracking
    const calculatedResult = calculateScore(data as DiagnosticData);
    
    // Push form submission to Google Tag Manager data layer
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
        utmAdset: data.utmAdset,
        utmAd: data.utmAd,
        gclid: data.gclid,
        fbclid: data.fbclid,
        // Question responses
        Q1: data.Q1 || '',
        Q2: data.Q2 || '',
        Q3: data.Q3 || '',
        Q4: data.Q4 || '',
        Q5: data.Q5 || '',
        Q6: data.Q6 || '',
        // Maturity score
        maturity_score: calculatedResult.totalScore,
        maturity_level: calculatedResult.nivel,
        dimension_scores: calculatedResult.subscores
      }
    });
    
    // Update state - React will batch these automatically
    setCurrentStep(5);
    setIsGenerating(true);
    setError(null);
    
          try {
        // Calculate maturity score first
        const calculatedResult = calculateScore(data as DiagnosticData);
        
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
          whatsapp: (typeof formatWhatsApp === 'function' ? formatWhatsApp(data.whatsapp || '') : null) || data.whatsapp || '',
          privacyConsent: data.privacyConsent || false,
          // UTM/Attribution data
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmTerm: data.utmTerm,
          utmContent: data.utmContent,
          utmAdset: data.utmAdset,
          utmAd: data.utmAd,
          gclid: data.gclid,
          fbclid: data.fbclid,
          // Maturity score as integer
          maturityScore: calculatedResult.totalScore,
        };
      
      await saveDiagnosticData(dataToSave);
      setDataSaved(true);
      setIsGenerating(false);
      
      const pdfBlob = await generatePDF(data as DiagnosticData);
      setPdfBlob(pdfBlob);
      
      // Set the result (already calculated above)
      setResult(calculatedResult);
      
      console.log('handleSubmit completed - currentView should still be diagnostic, step should be 5');
      
    } catch (error) {
      console.error('Error processing form:', error);
      setError('Erro ao processar o formulário. Tente novamente.');
      setIsGenerating(false);
    } finally {
      // Clear submitting state
      setIsSubmitting(false);
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
        return Boolean(
          data.email?.trim() && 
          data.whatsapp?.trim() && 
          data.privacyConsent &&
          typeof isValidEmail === 'function' && isValidEmail(data.email) &&
          typeof isValidWhatsApp === 'function' && isValidWhatsApp(data.whatsapp)
        );
      default:
        return false;
    }
  };

  const handleDownload = () => {
    if (pdfBlob && data) {
      // Track PDF download
      pushToDataLayer({
        event: 'pdf_download',
        form_name: 'diagnostic_form',
        user_name: data.nome || 'usuario',
        maturity_score: result?.totalScore || 0
      });
      
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

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email || !email.trim()) {
      setValidationErrors(prev => ({ ...prev, email: 'E-mail é obrigatório' }));
      return false;
    }
    if (typeof isValidEmail === 'function' && !isValidEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Digite um e-mail válido' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const validateWhatsApp = (whatsapp: string) => {
    if (!whatsapp || !whatsapp.trim()) {
      setValidationErrors(prev => ({ ...prev, whatsapp: 'WhatsApp é obrigatório' }));
      return false;
    }
    if (typeof isValidWhatsApp === 'function' && !isValidWhatsApp(whatsapp)) {
      setValidationErrors(prev => ({ ...prev, whatsapp: 'Digite um WhatsApp válido (ex: (11) 99999-9999)' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, whatsapp: undefined }));
    return true;
  };

  const handleEmailChange = (email: string) => {
    setData((prev) => ({ ...prev, email }));
    if (email && email.trim()) {
      validateEmail(email);
    } else {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleWhatsAppChange = (whatsapp: string) => {
    setData((prev) => ({ ...prev, whatsapp }));
    if (whatsapp && whatsapp.trim()) {
      validateWhatsApp(whatsapp);
    } else {
      setValidationErrors(prev => ({ ...prev, whatsapp: undefined }));
    }
  };

  // Render different views based on currentView state
  // Progress calculation
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
    if (data.email?.trim() && data.whatsapp?.trim() && data.privacyConsent && 
        typeof isValidEmail === 'function' && isValidEmail(data.email) && 
        typeof isValidWhatsApp === 'function' && isValidWhatsApp(data.whatsapp)) {
      progress += 15;
    }
    
    return Math.min(100, Math.max(0, progress));
  };
  
  const progress = calculateProgress();

  // Debug: Log current view
  console.log('Current view:', currentView, 'Current step:', currentStep, 'isGenerating:', isGenerating, 'isSubmitting:', isSubmitting);

  // Only render diagnostic view if currentView is 'diagnostic'
  if (currentView === 'diagnostic') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Topbar fixa com progresso */}
        <div className="w-full mx-auto fixed top-0 left-0 right-0 z-30 bg-white/95 pt-4 pb-2 px-4 shadow-md">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2">
              {!isMobile && (
                <div className="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-0 break-words overflow-hidden">
                  <span className="font-semibold text-gray-700 mb-1 sm:mb-0 sm:mr-3">
                    {currentStep === 1 ? 'Identificação' : 
                     currentStep === 2 ? `Pergunta ${currentQuestion + 1} de ${QUESTIONS.length}` :
                     currentStep === 3 ? 'Informações do Negócio' :
                     currentStep === 4 ? 'Contato & LGPD' :
                     'Gerando Diagnóstico'}
                  </span>
                  <span className="hidden sm:inline text-gray-400 mr-3" aria-hidden="true">
                    •
                  </span>
                  <span className="font-medium" style={{ color: '#f27e1a' }}>
                    {currentStep === 1 ? 'Dados iniciais' :
                     currentStep === 2 ? QUESTIONS[currentQuestion].category :
                     currentStep === 3 ? 'Empresa' :
                     currentStep === 4 ? 'Consentimento' :
                     'PDF'}
                  </span>
                </div>
              )}
              {!isMobile && (
                <span className="font-medium" style={{ color: '#f27e1a' }} aria-live="polite" aria-atomic="true">
                  {Math.round(progress)}%
                </span>
              )}
            </div>

            {/* Barra de progresso */}
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
                className="h-full flex-1 transition-all duration-500 ease-in-out"
                style={{ 
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)'
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Início</span>
              <span>Fim</span>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-12">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl">
              <div className="flex justify-center items-start px-2 mt-24 sm:mt-28 py-3">
                                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (currentStep === 4 && canProceed() && !isSubmitting) {
                        handleSubmit();
                      }
                      return false;
                    }}
                  className="rounded-lg border bg-card text-card-foreground w-full max-w-4xl mx-auto shadow-lg border-t-4"
                  style={{ borderTopColor: '#f27e1a' }}
                >
                  <div className="p-6 pt-6 pb-6 px-4 md:pt-8 md:pb-8 md:px-6">
                    {/* Step 1: Name */}
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

                    {/* Step 2: Questions */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="mb-4">
                          <span className="font-semibold text-xs px-2 py-1 rounded-full text-white" style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}>
                            {QUESTIONS[currentQuestion].category}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Pergunta {currentQuestion + 1} de {QUESTIONS.length}
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                          {QUESTIONS[currentQuestion].title}
                        </h2>
                        <div className="space-y-3">
                          {Object.entries(QUESTIONS[currentQuestion].options).map(
                            ([key, text]) => {
                              const selected =
                                data[QUESTIONS[currentQuestion].id as keyof DiagnosticData] === (key as QuestionOption);

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    const qid = QUESTIONS[currentQuestion].id as keyof DiagnosticData;
                                    setData((prev) => ({
                                      ...prev,
                                      [qid]: key as QuestionOption,
                                    }));
                                    
                                    // Track question answer
                                    pushToDataLayer({
                                      event: 'question_answered',
                                      form_name: 'diagnostic_form',
                                      question_id: qid,
                                      question_number: currentQuestion + 1,
                                      answer: key,
                                      category: QUESTIONS[currentQuestion].category
                                    });
                                  }}
                                  className={[
                                    'w-full p-4 text-left border-2 rounded-lg transition-all duration-300',
                                    'hover:bg-orange-50 border-gray-200',
                                    selected ? 'bg-orange-50' : '',
                                  ].join(' ')}
                                  style={{
                                    borderColor: selected ? '#f27e1a' : undefined,
                                    '--tw-border-opacity': selected ? '1' : undefined
                                  } as React.CSSProperties}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="font-medium w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                                      {key}
                                    </span>
                                    <span className="text-gray-700">{text}</span>
                                  </div>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Business Info */}
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

                    {/* Step 4: Contact & Consent */}
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
                            onChange={(e) => handleEmailChange(e.target.value)}
                            className={`mt-2 text-lg p-4 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="whatsapp" className="text-lg font-medium">
                            WhatsApp
                          </Label>
                          <Input
                            id="whatsapp"
                            placeholder="(11) 99999-9999"
                            value={data.whatsapp || ''}
                            onChange={(e) => handleWhatsAppChange(e.target.value)}
                            className={`mt-2 text-lg p-4 ${validationErrors.whatsapp ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          {validationErrors.whatsapp && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.whatsapp}</p>
                          )}
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
                          <label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                                                       <span className="underline cursor-pointer" style={{ color: '#f27e1a' }}>
                             Li e concordo com a Política de Privacidade
                           </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Loading and Download */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          {error ? (
                            <>
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
                                  className="text-white hover:opacity-90 flex items-center gap-2 px-8 py-4 text-lg"
                                  style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}
                                >
                                  <Download className="w-5 h-5" />
                                  Baixar diagnóstico
                                </Button>
                                <Button
                                  onClick={() => {
                                    // Track return to home
                                    pushToDataLayer({
                                      event: 'return_to_home',
                                      form_name: 'diagnostic_form',
                                      user_name: data.nome || 'usuario',
                                      maturity_score: result?.totalScore || 0
                                    });
                                    
                                    // Clear all diagnostic state when going back to home
                                    localStorage.removeItem('appState');
                                    localStorage.removeItem('pdfBlob');
                                    localStorage.removeItem('diagnosticData');
                                    
                                    // Reset all state
                                    setCurrentView('home');
                                    setCurrentStep(1);
                                    setCurrentQuestion(0);
                                    setData({});
                                    setIsGenerating(false);
                                    setPdfBlob(null);
                                    setError(null);
                                    setDataSaved(false);
                                    setResult(null);
                                    setIsSubmitting(false);
                                  }}
                                  variant="ghost"
                                  className="flex items-center gap-2 px-8 py-4 text-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                >
                                  <HomeIcon className="w-5 h-5" />
                                  Voltar ao início
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
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
                        disabled={!canProceed() || isSubmitting}
                        className="text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                        style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}
                      >
                        {currentStep === 4 ? 'Ver Resultado' : 'Próximo'}
                        {currentStep !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Home view - only render if currentView is 'home'
  if (currentView === 'home') {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="py-16 px-6 mt-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Diagnóstico do seu negócio 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400"> em 1 minuto </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Avalie gratuitamente o nível de maturidade em dados da sua empresa e receba 
            um plano personalizado para transformar informações em resultados.
          </p>
          
          <Button 
            onClick={handleStartDiagnostic}
            className="hover:opacity-90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(90deg, #f27e1a 0%, #ffba13 100%)' }}
          >
            Iniciar diagnóstico
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Responda o questionário',
                description: 'Perguntas rápidas sobre como sua empresa trabalha com dados'
              },
              {
                step: '2', 
                title: 'Receba seu diagnóstico',
                description: 'Score personalizado com análise detalhada do seu nível atual'
              },
              {
                step: '3',
                title: 'Implemente as melhorias',
                description: 'Siga o plano de ação prático para evoluir seus processos'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="w-12 h-12 bg-brand-gradient rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-semibold mb-3">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-muted transform translate-x-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
  }

  // If we get here, something went wrong - show debug info
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Erro de navegação</h2>
        <p className="mb-4">Current view: {currentView}</p>
        <p className="mb-4">Current step: {currentStep}</p>
        <p className="mb-4">Por favor, recarregue a página.</p>
      </div>
    </div>
  );
}