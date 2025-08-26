# Google Tag Manager Implementation

## Overview
This project has been integrated with Google Tag Manager (GTM) container ID: `GTM-546CZ8G6` to track user interactions and form submissions.

## Implementation Details

### 1. GTM Script Integration
- **File**: `src/components/GoogleTagManager.tsx`
- **Layout**: Added to `src/app/layout.tsx` to load on all pages
- **Strategy**: Uses Next.js `Script` component with `afterInteractive` strategy

### 2. Data Layer Events

The following events are pushed to the GTM data layer:

#### `diagnostic_start`
Triggered when user clicks "Iniciar diagnóstico"
```javascript
{
  event: 'diagnostic_start',
  form_name: 'diagnostic_form'
}
```

#### `step_completed`
Triggered when user completes each step
```javascript
{
  event: 'step_completed',
  form_name: 'diagnostic_form',
  step_number: 1-4,
  step_name: 'identification' | 'questions' | 'business_info' | 'contact_consent'
}
```

#### `question_answered`
Triggered when user answers each question
```javascript
{
  event: 'question_answered',
  form_name: 'diagnostic_form',
  question_id: 'Q1-Q6',
  question_number: 1-6,
  answer: 'A' | 'B' | 'C' | 'D',
  category: 'Infraestrutura de Dados' | 'Acesso e Disponibilidade' | etc.
}
```

#### `form_submit`
Triggered when form is submitted (most comprehensive event)
```javascript
{
  event: 'form_submit',
  form_name: 'diagnostic_form',
  form_data: {
    nome: string,
    empresa: string,
    nicho: string,
    funcionarios: string,
    email: string,
    whatsapp: string,
    privacyConsent: boolean,
    // UTM/Attribution data
    utmSource: string,
    utmMedium: string,
    utmCampaign: string,
    utmTerm: string,
    utmContent: string,
    utmAdset: string,
    utmAd: string,
    gclid: string,
    fbclid: string,
    // Question responses
    Q1-Q6: 'A' | 'B' | 'C' | 'D',
    // Maturity score
    maturity_score: number (0-100),
    maturity_level: 'Inicial' | 'Básica' | 'Intermediária' | 'Avançada',
    dimension_scores: {
      plataforma: number,
      praticaAnalitica: number,
      insight: number
    }
  }
}
```

#### `pdf_download`
Triggered when user downloads the PDF report
```javascript
{
  event: 'pdf_download',
  form_name: 'diagnostic_form',
  user_name: string,
  maturity_score: number
}
```

#### `return_to_home`
Triggered when user returns to home page after completing diagnostic
```javascript
{
  event: 'return_to_home',
  form_name: 'diagnostic_form',
  user_name: string,
  maturity_score: number
}
```

## Testing

### Test Page
Visit `/test/gtm` to test GTM functionality:
- Test GTM Events: Pushes test events to data layer
- Check Data Layer: Shows current data layer state

### Manual Testing
1. Open browser developer tools
2. Go to Console tab
3. Complete the diagnostic form
4. Check for data layer events in console
5. Use GTM Preview mode to verify events

### GTM Preview Mode
1. Go to Google Tag Manager
2. Click "Preview" button
3. Enter your website URL
4. Complete the diagnostic form
5. Verify events are being received

## GTM Configuration Recommendations

### Triggers to Create
1. **Form Submit Trigger**
   - Event: `form_submit`
   - Use for conversion tracking

2. **Step Completion Trigger**
   - Event: `step_completed`
   - Use for funnel analysis

3. **PDF Download Trigger**
   - Event: `pdf_download`
   - Use for goal completion

### Variables to Create
1. **Form Data Variables**
   - Extract specific form fields from `form_data` object
   - Example: `{{Form Data - Email}}`, `{{Form Data - Maturity Score}}`

2. **UTM Variables**
   - Extract UTM parameters for attribution tracking
   - Example: `{{Form Data - UTM Source}}`, `{{Form Data - UTM Campaign}}`

### Tags to Create
1. **Google Analytics 4 Event Tag**
   - Trigger: Form Submit
   - Event Name: `form_submit`
   - Parameters: Map form_data fields to GA4 parameters

2. **Facebook Pixel Conversion Tag**
   - Trigger: Form Submit
   - Event: `Lead`
   - Value: Use maturity_score

3. **Email Marketing Tag**
   - Trigger: Form Submit
   - Send form data to your email marketing platform

## Troubleshooting

### Common Issues
1. **GTM not loading**: Check if GTM ID is correct
2. **Events not firing**: Check browser console for JavaScript errors
3. **Data not appearing in GTM**: Verify data layer syntax and event names

### Debug Steps
1. Check browser console for errors
2. Verify GTM script is loading (Network tab)
3. Test data layer events using test page
4. Use GTM Preview mode to debug

## Security Considerations
- Form data is sent to GTM data layer (client-side)
- Consider what data should be sent to analytics platforms
- Ensure compliance with privacy regulations (LGPD/GDPR)
- Review data retention policies in analytics platforms
