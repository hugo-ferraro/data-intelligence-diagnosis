'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiagnosticData, ScoreResult } from '@/types/diagnostic';
import { calculateScore, getDimensionName } from '@/lib/scoring';
import { Download, Home, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Paleta / gradiente (cores da referência)
 */
const BRAND1 = '#ffba13';
const BRAND2 = '#f27e1a';
const HEADER_GRAD = `linear-gradient(90deg, ${BRAND2} 0%, ${BRAND1} 100%)`;
const LIGHT_HEAD_GRAD = 'linear-gradient(90deg,#fff6de 0%,#ffe9c3 100%)';
const FILL_GRAD = `linear-gradient(90deg, ${BRAND2}, ${BRAND1})`;

export default function Results() {
  const router = useRouter();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [data, setData] = useState<DiagnosticData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('diagnosticData');
    if (!stored) {
      router.push('/');
      return;
    }
    try {
      const diagnosticData = JSON.parse(stored) as DiagnosticData;
      setData(diagnosticData);
      setResult(calculateScore(diagnosticData));
    } catch {
      router.push('/');
    }
  }, [router]);

  // ===== Circle calc (referência: r=84) =====
  const { radius, circumference } = useMemo(
    () => ({ radius: 84, circumference: 2 * Math.PI * 84 }),
    []
  );
  const dashOffset = useMemo(() => {
    const pct = Math.max(0, Math.min(100, result?.totalScore ?? 0));
    return circumference - (pct / 100) * circumference;
  }, [result, circumference]);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleRestartDiagnostic = () => {
    router.push('/diagnostic');
  };

  if (!result || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND2 }} />
          <p>Processando seus resultados...</p>
        </div>
      </div>
    );
  }

  // label do nível (ajuste de concordância como na referência)
  const nivelLabel = result.nivel === 'Intermediária' ? 'Intermediário' : result.nivel;

  return (
    <div className="min-h-screen p-5" style={{ background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)' }}>
      {/* CONTAINER PRINCIPAL */}
      <div className="mx-auto max-w-[980px] bg-white shadow-[0_20px_60px_rgba(0,0,0,.08)] overflow-hidden">

        {/* ===== HEADER (layout da referência) ===== */}
        <header
          className="relative text-white"
          style={{ background: HEADER_GRAD, padding: '32px 36px' }}
          role="banner"
          aria-label="Cabeçalho"
        >
          {/* brilho decorativo */}
          <div
            className="absolute -top-1/3 -right-[8%] w-[360px] h-[360px] rounded-full"
            style={{ background: 'rgba(255,255,255,.12)', filter: 'blur(2px)' }}
            aria-hidden
          />
          <div className="font-extrabold leading-tight" style={{ fontSize: 'clamp(22px,4vw,34px)', textShadow: '0 2px 10px rgba(0,0,0,.25)' }}>
            Diagnóstico
          </div>
          <div className="opacity-90 mt-1 text-sm">Maturidade em Inteligência de Dados</div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="px-9 py-8 max-md:px-6" role="main">
          {/* DADOS DO NEGÓCIO (apenas dados explícitos) */}
          <section
            className="flex flex-wrap gap-x-6 gap-y-2 bg-[#f8f9fa] border-l-4 rounded-[14px] px-5 py-4 mb-6"
            style={{ borderLeftColor: BRAND1 }}
            aria-label="Informações da empresa"
          >
            <div className="flex gap-1.5 text-[14px] text-[#555]">
              <span className="text-[#777]">Empresa:</span>
              <strong>{data.empresa || '—'}</strong>
            </div>
            <div className="flex gap-1.5 text-[14px] text-[#555]">
              <span className="text-[#777]">Funcionários:</span>
              <strong>{data.funcionarios || '—'}</strong>
            </div>
          </section>

          {/* SCORE (círculo SVG com gradiente) */}
          <section className="text-center my-7" aria-labelledby="score-title">
            <div id="score-title" className="text-[#777] font-semibold mb-2">Seu Score de Maturidade</div>
            <div className="relative w-[190px] h-[190px] mx-auto mb-3">
              <svg width="190" height="190" className="-rotate-90">
                <defs>
                  <linearGradient id="gradStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={BRAND1} />
                    <stop offset="100%" stopColor={BRAND2} />
                  </linearGradient>
                </defs>
                <circle cx="95" cy="95" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="12" />
                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="none"
                  stroke="url(#gradStroke)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                    transition: 'stroke-dashoffset 1s ease',
                  }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-[52px] font-extrabold text-[#222]">{result.totalScore}</div>
              </div>
            </div>
            <div
              className="inline-block text-white px-5 py-2 rounded-full font-bold tracking-wide"
              style={{ background: HEADER_GRAD }}
            >
              Nível {nivelLabel}
            </div>
          </section>

          {/* ANÁLISE DETALHADA */}
          <section className="mt-7">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-[34px] h-[34px] rounded-[10px] grid place-items-center text-white shadow-[0_6px_16px_rgba(242,126,26,.35)]"
                style={{ background: HEADER_GRAD }}
                aria-hidden
              >
                {/* ícone gráfico */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h2v18H3V3Zm4 10h2v8H7v-8Zm4-6h2v14h-2V7Zm4 4h2v10h-2V11Zm4-8h2v18h-2V3Z" />
                </svg>
              </div>
              <h2 className="text-[22px]">Análise Detalhada</h2>
            </div>

            {/* Onde está hoje */}
            <article className="bg-[#fafbfc] border border-[#e8eaed] rounded-[14px] mb-4">
              <div
                className="flex items-center gap-2 -mt-[1px] -mx-[1px] mb-3 px-4 py-2 rounded-t-[14px] border-b"
                style={{ background: LIGHT_HEAD_GRAD, borderColor: '#ffe3a8', color: '#5a3b00' }}
              >
                {/* ícone lupa */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#7a4a00" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14Z"/>
                </svg>
                Onde você está hoje
              </div>
              <div className="px-5 pb-5 text-[#555] leading-relaxed">
                {result.analysis.ondeEsta}
              </div>
            </article>

            {/* Performance por Dimensão */}
            <div className="flex items-center gap-3 mb-3 mt-2">
              <div
                className="w-[34px] h-[34px] rounded-[10px] grid place-items-center text-white shadow-[0_6px_16px_rgba(242,126,26,.35)]"
                style={{ background: HEADER_GRAD }}
                aria-hidden
              >
                {/* ícone alvo */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6C6.48 2 2 6.48 2 12h2a8 8 0 1 1 8 8v2c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 6a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8v2Z"/>
                </svg>
              </div>
              <h2 className="text-[22px]">Performance por Dimensão</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {Object.entries(result.subscores).map(([key, score]) => (
                <div
                  key={key}
                  className="bg-white border border-[#e8eaed] rounded-[14px] p-4 transition-transform duration-200"
                  role="listitem"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[13px] text-[#777] flex items-center gap-2">
                      {/* bullet ícone */}
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill={BRAND2} d="M3 13h8V3H3v10Zm10 8h8v-8h-8v8ZM3 21h8v-6H3v6Zm10-10h8V3h-8v8Z"/>
                      </svg>
                      {getDimensionName(key as keyof ScoreResult['subscores'])}
                    </div>
                    <div className="font-extrabold text-[22px]">{score}</div>
                  </div>
                  <div className="h-[7px] bg-[#f0f0f0] rounded overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: FILL_GRAD, transition: 'width 1s ease' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* O que isso significa + badge */}
            <article className="bg-[#fafbfc] border border-[#e8eaed] rounded-[14px] mt-4">
              <div
                className="flex items-center gap-2 -mt-[1px] -mx-[1px] mb-3 px-4 py-2 rounded-t-[14px] border-b"
                style={{ background: LIGHT_HEAD_GRAD, borderColor: '#ffe3a8', color: '#5a3b00' }}
              >
                {/* ícone alerta */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#7a4a00" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"/>
                </svg>
                O que isso significa
                <span className="ml-2 inline-block text-[12px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffd2a6' }}>
                  Atenção
                </span>
              </div>
              <div className="px-5 pb-5 text-[#555] leading-relaxed">
                {result.analysis.significado}
              </div>
            </article>

            {/* Próximos passos (bloco amarelo suave) */}
            <section
              className="rounded-[14px] mt-4 p-5 border"
              style={{
                background: 'linear-gradient(135deg,#fff9e6 0%,#fff5d6 100%)',
                borderColor: '#ffda0e',
              }}
              aria-labelledby="recs-title"
            >
              <h3 id="recs-title" className="flex items-center gap-2 text-[#b54800] font-semibold mb-2">
                {/* lâmpada */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#b54800" d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.9V17h8v-2.1A7 7 0 0 0 12 2Z"/>
                </svg>
                Próximos passos estratégicos
              </h3>
              <ul className="list-none">
                {result.analysis.proximosPassos.map((step, i) => (
                  <li key={i} className="relative pl-7 my-2 text-[#555] leading-relaxed">
                    <span
                      className="absolute left-0 top-0 font-extrabold"
                      style={{
                        background: HEADER_GRAD,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ➜
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
