/**
 * Draft Storage & Auto-save Engine
 * Secures form data, notes, and pending user edits into localStorage
 * with expiration management and automatic restoration metadata.
 */

export interface SavedDraft<T = unknown> {
  key: string;
  data: T;
  formId: string;
  url: string;
  title: string;
  savedAt: string; // ISO string
  expiresAt: string; // ISO string
  version: number;
}

const DRAFT_PREFIX = "brotherhood_draft_";
const DEFAULT_TTL_HOURS = 48; // Preserved for 48 hours

export const DraftStorage = {
  /**
   * Save a draft safely with structured metadata
   */
  save<T>(formId: string, data: T, title: string = "Draf Formulir"): SavedDraft<T> | null {
    if (typeof window === "undefined" || !window.localStorage) return null;

    try {
      const now = new Date();
      const expires = new Date(now.getTime() + DEFAULT_TTL_HOURS * 60 * 60 * 1000);

      const draft: SavedDraft<T> = {
        key: `${DRAFT_PREFIX}${formId}`,
        data,
        formId,
        url: window.location.pathname + window.location.search,
        title,
        savedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        version: 1,
      };

      window.localStorage.setItem(draft.key, JSON.stringify(draft));
      return draft;
    } catch (err) {
      console.warn("[DraftStorage] Failed to save draft:", err);
      return null;
    }
  },

  /**
   * Retrieve an active draft by formId
   */
  get<T>(formId: string): SavedDraft<T> | null {
    if (typeof window === "undefined" || !window.localStorage) return null;

    try {
      const key = `${DRAFT_PREFIX}${formId}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const draft = JSON.parse(raw) as SavedDraft<T>;
      const expiresAt = new Date(draft.expiresAt).getTime();

      // Check if expired
      if (Date.now() > expiresAt) {
        window.localStorage.removeItem(key);
        return null;
      }

      return draft;
    } catch (err) {
      console.warn("[DraftStorage] Failed to read draft:", err);
      return null;
    }
  },

  /**
   * Remove a draft once successfully submitted
   */
  remove(formId: string): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.removeItem(`${DRAFT_PREFIX}${formId}`);
    } catch (err) {
      console.warn("[DraftStorage] Failed to remove draft:", err);
    }
  },

  /**
   * Check if any draft exists for formId
   */
  has(formId: string): boolean {
    return Boolean(this.get(formId));
  },

  /**
   * List all currently preserved drafts across the app
   */
  listAll(): SavedDraft[] {
    if (typeof window === "undefined" || !window.localStorage) return [];

    const drafts: SavedDraft[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(DRAFT_PREFIX)) {
          const raw = window.localStorage.getItem(k);
          if (raw) {
            try {
              const draft = JSON.parse(raw);
              if (Date.now() <= new Date(draft.expiresAt).getTime()) {
                drafts.push(draft);
              }
            } catch {
              // ignore malformed keys
            }
          }
        }
      }
    } catch (err) {
      console.warn("[DraftStorage] Error listing drafts:", err);
    }
    return drafts;
  },

  /**
   * Clean up all expired drafts
   */
  cleanExpired(): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(DRAFT_PREFIX)) {
          const raw = window.localStorage.getItem(k);
          if (raw) {
            const draft = JSON.parse(raw);
            if (Date.now() > new Date(draft.expiresAt).getTime()) {
              window.localStorage.removeItem(k);
            }
          }
        }
      }
    } catch {
      // ignore
    }
  },
};

