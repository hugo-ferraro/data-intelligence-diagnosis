# RD Station Marketing Integration

## Overview

This integration automatically registers lead conversions with RD Station Marketing when a user completes the data maturity diagnostic. The integration is designed to be secure and non-blocking, ensuring that the main diagnostic flow continues even if RD Station registration fails.

## How it Works

### 1. Data Flow
1. User completes the diagnostic form
2. Data is saved to Supabase database
3. Lead conversion is registered with RD Station Marketing
4. User receives their diagnostic PDF

### 2. Security
- Access tokens are stored securely in Supabase (`rd_marketing_auth` table)
- API calls are made server-side to prevent token exposure
- The most recent access token is automatically retrieved

### 3. Data Mapping

The diagnostic form data is mapped to RD Station fields as follows:

| Diagnostic Field | RD Station Field | Description |
|------------------|------------------|-------------|
| `nome` | `name` | Lead's full name |
| `email` | `email` | Lead's email address |
| `whatsapp` | `personal_phone`, `mobile_phone` | Lead's phone number |
| `empresa` | `company_name` | Company name |
| `funcionarios` | `cf_business_size` | Business size (number of employees) |
| `utmSource` | `cf_utm_source` | UTM source parameter |
| `utmMedium` | `cf_utm_medium` | UTM medium parameter |
| `utmCampaign` | `cf_utm_campaign` | UTM campaign parameter |
| `utmAdset` | `cf_utm_adset` | UTM adset parameter |
| `utmAd` | `cf_utm_ad` | UTM ad parameter |

### 4. Conversion Event

The integration sends a conversion event with:
- **Event Type**: `CONVERSION`
- **Event Family**: `CDP`
- **Conversion Identifier**: "Diagnóstico Maturidade em Dados"

## API Endpoints

### POST `/api/rd-station`
Registers a lead conversion with RD Station Marketing.

**Request Body:**
```json
{
  "nome": "John Doe",
  "email": "john@example.com",
  "whatsapp": "11999999999",
  "empresa": "Example Corp",
  "funcionarios": "11-50",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "data-maturity-2024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead conversion registered with RD Station Marketing",
  "data": { /* RD Station response */ }
}
```

## Error Handling

The integration is designed to be fault-tolerant:

1. **Missing Access Token**: Returns 500 error with clear message
2. **Invalid Data**: Returns 400 error for missing required fields
3. **RD Station API Errors**: Logs error but doesn't block main flow
4. **Network Issues**: Gracefully handles timeouts and connection errors

## Database Requirements

### Supabase Table: `rd_marketing_auth`
```sql
CREATE TABLE rd_marketing_auth (
  id SERIAL PRIMARY KEY,
  acess_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

The integration automatically retrieves the most recent access token (highest `id`) from this table.

## Environment Variables

No additional environment variables are required. The integration uses the existing Supabase configuration.

## Testing

To test the integration:

1. Ensure you have a valid access token in the `rd_marketing_auth` table
2. Complete a diagnostic form
3. Check the browser console for RD Station API logs
4. Verify the lead appears in your RD Station Marketing dashboard

## Troubleshooting

### Common Issues

1. **"Failed to retrieve RD Station access token"**
   - Check if the `rd_marketing_auth` table exists
   - Verify there's at least one record with a valid `acess_token`

2. **"RD Station API error: 401 Unauthorized"**
   - The access token may be expired
   - Add a new token to the `rd_marketing_auth` table

3. **"Missing required fields"**
   - Ensure the diagnostic form is collecting all required data
   - Check that `email` and `nome` fields are populated

### Logs

The integration provides detailed logging:
- Console logs for successful operations
- Error logs for debugging issues
- RD Station API response details

## Future Enhancements

Potential improvements:
- Token refresh mechanism
- Retry logic for failed requests
- Webhook notifications for conversion events
- A/B testing support
- Custom field mapping configuration
