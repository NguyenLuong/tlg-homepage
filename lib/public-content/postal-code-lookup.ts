import { findPrefectureByKanji } from "./japan-prefectures";

type ZipcloudResult = {
  address1?: string;
  address2?: string;
  address3?: string;
};

type ZipcloudResponse = {
  status?: number;
  results?: ZipcloudResult[] | null;
};

export type PostalLookupResult = {
  prefectureValue: string;
  addressLine: string;
};

export async function lookupPostalCode(
  zipcode: string,
  signal?: AbortSignal,
): Promise<PostalLookupResult | null> {
  const sanitized = zipcode.replace(/\D/g, "");
  if (sanitized.length !== 7) return null;

  try {
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${sanitized}`,
      { signal },
    );
    if (!response.ok) return null;

    const body = (await response.json()) as ZipcloudResponse;
    const result = body.results?.[0];
    if (!result || !result.address1) return null;

    const prefecture = findPrefectureByKanji(result.address1);
    if (!prefecture) return null;

    const addressLine = [result.address2, result.address3]
      .filter((part): part is string => Boolean(part && part.length > 0))
      .join("");

    return {
      prefectureValue: prefecture.value,
      addressLine,
    };
  } catch {
    return null;
  }
}
