import { en, type Dict } from "./en";
import { bn } from "./bn";
import type { Locale } from "./config";

export type { Dict };

const dicts: Record<Locale, Dict> = { en, bn };

/** Server-side dictionary lookup. Client components use useDict() from LocaleProvider instead. */
export const getDict = (locale: Locale): Dict => dicts[locale];
