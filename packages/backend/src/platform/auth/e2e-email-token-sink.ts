type CapturedEmailToken = {
  type: "verification" | "reset-password";
  email: string;
  token: string;
  url: string;
  capturedAt: number;
};

const tokensByEmail = new Map<string, CapturedEmailToken[]>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const captureE2EEmailToken = (input: {
  type: CapturedEmailToken["type"];
  email: string;
  token: string;
  url: string;
}) => {
  const email = normalizeEmail(input.email);
  const entry: CapturedEmailToken = {
    type: input.type,
    email,
    token: input.token,
    url: input.url,
    capturedAt: Date.now(),
  };
  const existing = tokensByEmail.get(email) ?? [];
  existing.push(entry);
  tokensByEmail.set(email, existing);
};

export const getLatestE2EEmailToken = (input: {
  email: string;
  type?: CapturedEmailToken["type"];
}) => {
  const email = normalizeEmail(input.email);
  const entries = tokensByEmail.get(email) ?? [];
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (!input.type || entry.type === input.type) {
      return entry;
    }
  }
  return null;
};

export const clearE2EEmailTokens = (email?: string) => {
  if (!email) {
    tokensByEmail.clear();
    return;
  }
  tokensByEmail.delete(normalizeEmail(email));
};
