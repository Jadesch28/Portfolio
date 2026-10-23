interface ImportMetaEnv {
  /** Point d'envoi du formulaire de contact (Formspree…). */
  readonly PUBLIC_FORM_ENDPOINT?: string;
  /** Adresse de contact ; remplace celle de src/data/site.ts si définie. */
  readonly PUBLIC_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
