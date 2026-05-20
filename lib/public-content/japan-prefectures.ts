import type { PublicLocale } from "@/lib/i18n/public-locales";

export type JapanPrefecture = {
  value: string;
  labelJP: string;
  labelVI: string;
};

export const JAPAN_PREFECTURES: ReadonlyArray<JapanPrefecture> = [
  { value: "hokkaido", labelJP: "北海道", labelVI: "Hokkaido" },
  { value: "aomori", labelJP: "青森県", labelVI: "Aomori" },
  { value: "iwate", labelJP: "岩手県", labelVI: "Iwate" },
  { value: "miyagi", labelJP: "宮城県", labelVI: "Miyagi" },
  { value: "akita", labelJP: "秋田県", labelVI: "Akita" },
  { value: "yamagata", labelJP: "山形県", labelVI: "Yamagata" },
  { value: "fukushima", labelJP: "福島県", labelVI: "Fukushima" },
  { value: "ibaraki", labelJP: "茨城県", labelVI: "Ibaraki" },
  { value: "tochigi", labelJP: "栃木県", labelVI: "Tochigi" },
  { value: "gunma", labelJP: "群馬県", labelVI: "Gunma" },
  { value: "saitama", labelJP: "埼玉県", labelVI: "Saitama" },
  { value: "chiba", labelJP: "千葉県", labelVI: "Chiba" },
  { value: "tokyo", labelJP: "東京都", labelVI: "Tokyo" },
  { value: "kanagawa", labelJP: "神奈川県", labelVI: "Kanagawa" },
  { value: "niigata", labelJP: "新潟県", labelVI: "Niigata" },
  { value: "toyama", labelJP: "富山県", labelVI: "Toyama" },
  { value: "ishikawa", labelJP: "石川県", labelVI: "Ishikawa" },
  { value: "fukui", labelJP: "福井県", labelVI: "Fukui" },
  { value: "yamanashi", labelJP: "山梨県", labelVI: "Yamanashi" },
  { value: "nagano", labelJP: "長野県", labelVI: "Nagano" },
  { value: "gifu", labelJP: "岐阜県", labelVI: "Gifu" },
  { value: "shizuoka", labelJP: "静岡県", labelVI: "Shizuoka" },
  { value: "aichi", labelJP: "愛知県", labelVI: "Aichi" },
  { value: "mie", labelJP: "三重県", labelVI: "Mie" },
  { value: "shiga", labelJP: "滋賀県", labelVI: "Shiga" },
  { value: "kyoto", labelJP: "京都府", labelVI: "Kyoto" },
  { value: "osaka", labelJP: "大阪府", labelVI: "Osaka" },
  { value: "hyogo", labelJP: "兵庫県", labelVI: "Hyogo" },
  { value: "nara", labelJP: "奈良県", labelVI: "Nara" },
  { value: "wakayama", labelJP: "和歌山県", labelVI: "Wakayama" },
  { value: "tottori", labelJP: "鳥取県", labelVI: "Tottori" },
  { value: "shimane", labelJP: "島根県", labelVI: "Shimane" },
  { value: "okayama", labelJP: "岡山県", labelVI: "Okayama" },
  { value: "hiroshima", labelJP: "広島県", labelVI: "Hiroshima" },
  { value: "yamaguchi", labelJP: "山口県", labelVI: "Yamaguchi" },
  { value: "tokushima", labelJP: "徳島県", labelVI: "Tokushima" },
  { value: "kagawa", labelJP: "香川県", labelVI: "Kagawa" },
  { value: "ehime", labelJP: "愛媛県", labelVI: "Ehime" },
  { value: "kochi", labelJP: "高知県", labelVI: "Kochi" },
  { value: "fukuoka", labelJP: "福岡県", labelVI: "Fukuoka" },
  { value: "saga", labelJP: "佐賀県", labelVI: "Saga" },
  { value: "nagasaki", labelJP: "長崎県", labelVI: "Nagasaki" },
  { value: "kumamoto", labelJP: "熊本県", labelVI: "Kumamoto" },
  { value: "oita", labelJP: "大分県", labelVI: "Oita" },
  { value: "miyazaki", labelJP: "宮崎県", labelVI: "Miyazaki" },
  { value: "kagoshima", labelJP: "鹿児島県", labelVI: "Kagoshima" },
  { value: "okinawa", labelJP: "沖縄県", labelVI: "Okinawa" },
];

export const JAPAN_PREFECTURE_VALUES: ReadonlyArray<string> =
  JAPAN_PREFECTURES.map((item) => item.value);

export function getLocalizedPrefectures(
  locale: PublicLocale,
): ReadonlyArray<{ value: string; label: string }> {
  return JAPAN_PREFECTURES.map((item) => ({
    value: item.value,
    label: locale === "ja" ? item.labelJP : item.labelVI,
  }));
}

export function findPrefectureByKanji(
  kanji: string,
): JapanPrefecture | undefined {
  const trimmed = kanji.trim();
  return JAPAN_PREFECTURES.find((item) => item.labelJP === trimmed);
}

export function getPrefectureLabel(
  value: string,
  locale: PublicLocale,
): string {
  const item = JAPAN_PREFECTURES.find((entry) => entry.value === value);
  if (!item) return value;
  return locale === "ja" ? item.labelJP : item.labelVI;
}
