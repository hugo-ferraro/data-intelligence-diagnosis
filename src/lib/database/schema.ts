import { pgTable, serial, timestamp, varchar, boolean, char } from 'drizzle-orm/pg-core';

export const diagnosticCampaignLeads = pgTable('diagnostic_campaign_leads', {
  id: serial('id').primaryKey(),
  registerDate: timestamp('register_date', { withTimezone: true }).defaultNow().notNull(),
  leadName: varchar('lead_name'),
  leadEmail: varchar('lead_email'),
  leadPhone: varchar('lead_phone'),
  businessName: varchar('business_name'),
  businessNiche: varchar('business_niche'),
  businessNumEmployees: varchar('business_num_employees'),
  lgpdConsent: boolean('lgpd_consent').default(true),
  answerQ1: char('answer_q1', { length: 1 }).default('A'),
  answerQ2: char('answer_q2', { length: 1 }).default('A'),
  answerQ3: char('answer_q3', { length: 1 }).default('A'),
  answerQ4: char('answer_q4', { length: 1 }).default('A'),
  answerQ5: char('answer_q5', { length: 1 }).default('A'),
  answerQ6: char('answer_q6', { length: 1 }).default('A'),
  // UTM/Attribution fields
  utmSource: varchar('utm_source'),
  utmMedium: varchar('utm_medium'),
  utmCampaign: varchar('utm_campaign'),
  utmTerm: varchar('utm_term'),
  utmContent: varchar('utm_content'),
  referrer: varchar('referrer'),
  landingUrl: varchar('landing_url'),
  gclid: varchar('gclid'),
  fbclid: varchar('fbclid'),
});

export type DiagnosticCampaignLead = typeof diagnosticCampaignLeads.$inferInsert;
export type DiagnosticCampaignLeadSelect = typeof diagnosticCampaignLeads.$inferSelect;
