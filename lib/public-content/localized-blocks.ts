import {
  DEFAULT_PUBLIC_LOCALE,
  getFallbackPublicLocale,
  getPublicLocaleFallbackOrder,
  parsePublicLocale,
  type PublicLocale,
} from "@/lib/i18n/public-locales";

type LocalizedContentMap<TBlock> = Partial<Record<PublicLocale, TBlock>>;

export type ResolvedLocalizedContentBlock<TBlock> = {
  requestedLocale: PublicLocale;
  resolvedLocale: PublicLocale;
  block: TBlock;
  fallbackNotice: string | null;
};

type ResolveLocalizedContentBlockOptions<TBlock> = {
  fallbackLocale?: PublicLocale;
  blockName?: string;
  isMissing?: (block: TBlock) => boolean;
};

function isDefined<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function hasAvailableBlock<TBlock>(
  block: TBlock | null | undefined,
  isMissing: (block: TBlock) => boolean,
): block is TBlock {
  return isDefined(block) && !isMissing(block);
}

function toLocaleLabel(locale: PublicLocale, audienceLocale: PublicLocale): string {
  if (audienceLocale === "ja") {
    return locale === "ja" ? "Nihongo" : "Betonamugo";
  }

  return locale === "ja" ? "tieng Nhat" : "tieng Viet";
}

function formatFallbackNotice(
  requestedLocale: PublicLocale,
  resolvedLocale: PublicLocale,
  blockName: string,
): string {
  if (requestedLocale === "ja") {
    if (requestedLocale === resolvedLocale) {
      return `${blockName} wa ${toLocaleLabel(resolvedLocale, requestedLocale)} de hyoji sarete imasu.`;
    }

    return `${blockName} wa ${toLocaleLabel(resolvedLocale, requestedLocale)} de hyoji sarete imasu. Gokibou no gengo no content ga genzai arimasen.`;
  }

  if (requestedLocale === resolvedLocale) {
    return `${blockName} dang duoc hien thi bang ${toLocaleLabel(resolvedLocale, requestedLocale)}.`;
  }

  return `${blockName} dang duoc hien thi bang ${toLocaleLabel(resolvedLocale, requestedLocale)} vi noi dung cua ngon ngu ban chon hien khong kha dung.`;
}

export function resolveLocalizedContentBlock<TBlock>(
  blocks: LocalizedContentMap<TBlock>,
  localeInput: unknown,
  options: ResolveLocalizedContentBlockOptions<TBlock> = {},
): ResolvedLocalizedContentBlock<TBlock> {
  const requestedLocale = parsePublicLocale(localeInput, DEFAULT_PUBLIC_LOCALE);
  const isMissing = options.isMissing ?? (() => false);
  const primaryBlock = blocks[requestedLocale];

  if (hasAvailableBlock(primaryBlock, isMissing)) {
    return {
      requestedLocale,
      resolvedLocale: requestedLocale,
      block: primaryBlock,
      fallbackNotice: null,
    };
  }

  const fallbackLocale = options.fallbackLocale ?? getFallbackPublicLocale(requestedLocale);
  const fallbackBlock = blocks[fallbackLocale];

  if (hasAvailableBlock(fallbackBlock, isMissing)) {
    const blockName = options.blockName ?? "this section";
    return {
      requestedLocale,
      resolvedLocale: fallbackLocale,
      block: fallbackBlock,
      fallbackNotice: formatFallbackNotice(requestedLocale, fallbackLocale, blockName),
    };
  }

  const fallbackOrder = getPublicLocaleFallbackOrder(requestedLocale);
  const firstAvailable = fallbackOrder.find((locale) => hasAvailableBlock(blocks[locale], isMissing));

  if (firstAvailable) {
    const resolvedLocale = firstAvailable;
    const block = blocks[resolvedLocale] as TBlock;
    const blockName = options.blockName ?? "this section";

    return {
      requestedLocale,
      resolvedLocale,
      block,
      fallbackNotice: formatFallbackNotice(requestedLocale, resolvedLocale, blockName),
    };
  }

  throw new Error("No localized content blocks are available.");
}
