import { adminMessages } from "./messages";
import { translate } from "./translate";

/** Server-side counterparts of the next-intl helpers used by the admin pages. */
export async function getLocale() {
  return "en";
}

export async function getMessages() {
  return adminMessages as unknown as Record<string, Record<string, unknown>> & typeof adminMessages;
}

export async function getTranslations(namespace?: string) {
  return (key: string, params?: Record<string, string | number>) =>
    translate(adminMessages as unknown as Record<string, unknown>, namespace, key, params);
}
