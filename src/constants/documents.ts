// Document options that students can mark as ready to send to agents
export const DOCUMENT_OPTIONS = [
  "Passport / ID",
  "Proof of Enrollment",
  "Proof of Income / Financial Statement",
  "Employer Reference Letter",
  "Bank Statements (3 months)",
  "Previous Landlord Reference",
  "Student Visa",
  "Guarantor Letter",
  "Credit Check Report",
  "Proof of Address",
] as const;

export type DocumentOption = typeof DOCUMENT_OPTIONS[number];
