'use client';

import React from 'react';
import { Document, Page, pdf } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { DiagnosticData } from '@/types/diagnostic';
import { calculateScore, getDimensionName } from './scoring';

const BRAND1 = '#ffba13';
const BRAND2 = '#f27e1a';

// Styles supported by react-pdf (no CSS shorthands like border-left / margin: 0 auto)
const stylesheet = {
  body: { fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"', padding: 0, backgroundColor: '#ffffff' },

  '.header': { backgroundColor: BRAND2, color: '#ffffff', paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10, marginBottom: 0 },
  '.header h1': { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  '.header p': { fontSize: 12, margin: 0, opacity: 0.9 },

  '.page-content': { padding: 15 },

  '.business-info': {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: BRAND1,
    padding: 8, marginBottom: 20, borderRadius: 8
  },
  '.business-info div': { fontSize: 12, color: '#555555', marginBottom: 0 },
  '.business-info span': { color: '#777777' },
  '.business-info strong': { fontWeight: 700 },

  '.main-content': { display: 'flex', flexDirection: 'row', marginBottom: 20 },
  '.left-column': { flex: 1, marginRight: 20 },
  '.right-column': { flex: 1 },

  '.score-section': { alignItems: 'center', marginBottom: 0 },
  '.score-title': { fontSize: 14, color: '#777777', fontWeight: 700, marginBottom: 15, textAlign: 'center' },

  '.score-circle': {
    width: 120, height: 120,
    borderWidth: 8, borderStyle: 'solid', borderColor: BRAND1,
    borderRadius: 60,
    alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, display: 'flex'
  },
  '.score-value': { fontSize: 32, fontWeight: 700, color: '#222222' },

  '.level-badge': {
    backgroundColor: BRAND2, color: '#ffffff',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, fontWeight: 700, fontSize: 14,
    alignSelf: 'center'
  },

  '.dimensions-section': { marginBottom: 15 },

  '.dimension-card': {
    backgroundColor: '#ffffff', borderWidth: 1, borderStyle: 'solid', borderColor: '#e8eaed',
    borderRadius: 6, padding: 10, marginBottom: 8
  },
  '.dimension-header': {
    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8
  },
  '.dimension-name': { fontSize: 12, color: '#777777' },
  '.dimension-score': { fontSize: 16, fontWeight: 700 },

  '.progress-bar': { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 },
  '.progress-fill': { height: 6, backgroundColor: BRAND1 },

  '.analysis-section': { marginBottom: 15},
  '.analysis-grid': { display: 'flex', flexDirection: 'column', gap: 8 },
  '.analysis-row': { display: 'flex', flexDirection: 'row', gap: 8 },
  '.analysis-column': { flex: 1 },
  '.analysis-card': {
    backgroundColor: '#ffffff', borderWidth: 1, borderStyle: 'solid', borderColor: '#e8eaed',
    borderRadius: 6, marginBottom: 8, overflow: 'hidden'
  },
  '.analysis-header': { backgroundColor: BRAND2, color: '#ffffff', paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontWeight: 700, fontSize: 12 },
  '.analysis-content': { paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: 11, lineHeight: 1.2, color: '#333333' }
} as const;

// Minimal HTML escaper for user/dynamic content
function esc(s?: string) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function generatePDF(diagnosticData: DiagnosticData): Promise<Blob> {
  const result = calculateScore(diagnosticData);
  const nivelLabel = result.nivel === 'Intermediária' ? 'Intermediário' : result.nivel;

  const dimsHtml = Object.entries(result.subscores)
    .map(([key, score]) => `
      <div class="dimension-card">
        <div class="dimension-header">
          <div class="dimension-name">${getDimensionName(key as keyof typeof result.subscores)}</div>
          <div class="dimension-score">${score}</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, Number(score)))}%"></div>
        </div>
      </div>
    `).join('');

  const analysisHtml = result.analysis?.paragraphs?.length
    ? (() => {
        const paragraphs = result.analysis.paragraphs;
        let html = '<div class="analysis-grid">';
        
        // Create rows with exactly 2 columns each
        for (let i = 0; i < paragraphs.length; i += 2) {
          html += '<div class="analysis-row">';
          
          // First column in the row
          html += '<div class="analysis-column">';
          html += `
            <div class="analysis-card">
              <div class="analysis-header">${esc(paragraphs[i].category)}</div>
              <div class="analysis-content">${esc(paragraphs[i].content)}</div>
            </div>
          `;
          html += '</div>';
          
          // Second column in the row (if it exists)
          if (i + 1 < paragraphs.length) {
            html += '<div class="analysis-column">';
            html += `
              <div class="analysis-card">
                <div class="analysis-header">${esc(paragraphs[i + 1].category)}</div>
                <div class="analysis-content">${esc(paragraphs[i + 1].content)}</div>
              </div>
            `;
            html += '</div>';
          } else {
            // Empty second column to maintain layout
            html += '<div class="analysis-column"></div>';
          }
          
          html += '</div>';
        }
        
        html += '</div>';
        return html;
      })()
    : `
        <div class="analysis-card">
          <div class="analysis-content">${esc(result.analysis?.ondeEsta)}</div>
        </div>
      `;

  const htmlContent = `
    <div class="header">
      <h1>Diagnóstico</h1>
      <p>Maturidade em Inteligência de Dados</p>
    </div>

    <div class="page-content">
      <div class="business-info">
        <div><span>Empresa:</span> <strong>${esc(diagnosticData.empresa) || '—'}</strong> | <span>Funcionários:</span> <strong>${esc(String(diagnosticData.funcionarios ?? '—'))}</strong></div>
      </div>

      <div class="main-content">
        <div class="left-column">
          <div class="score-section">
            <div class="score-title">Seu Score de Maturidade</div>
            <div class="score-circle"><div class="score-value">${result.totalScore}</div></div>
            <div class="level-badge">Nível ${esc(nivelLabel)}</div>
          </div>
        </div>

        <div class="right-column">
          <div class="dimensions-section">
            ${dimsHtml}
          </div>
        </div>
      </div>

      <div class="analysis-section">
        ${analysisHtml}
      </div>
    </div>
  `;

  const MyDocument = () => (
    <Document>
      <Page size="A4" style={{ padding: 0 }}>
        <Html stylesheet={stylesheet} style={{ fontSize: 10 }}>
          {htmlContent}
        </Html>
      </Page>
    </Document>
  );

  return await pdf(<MyDocument />).toBlob();
}
