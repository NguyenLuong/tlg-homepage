import { createHash } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL for seeding.");
}

const schema =
  new URL(connectionString).searchParams.get("schema") ?? undefined;
console.log("🔥 schema", schema);

const adapter = new PrismaPg({ connectionString }, { schema });
const prisma = new PrismaClient({ adapter });

const NEWS_CATEGORIES = [
  {
    nameVN: "Thông báo",
    nameJA: "お知らせ",
    slug: "thong-bao",
    iconKey: "megaphone",
  },
  {
    nameVN: "Sự kiện",
    nameJA: "イベント",
    slug: "su-kien",
    iconKey: "calendar",
  },
  { nameVN: "Chia sẻ", nameJA: "共有", slug: "chia-se", iconKey: "newspaper" },
] as const;

const JOB_CATEGORIES = [
  { nameVN: "Kỹ sư IT", nameJA: "ITエンジニア", slug: "ky-su-it" },
  { nameVN: "Cơ khí - Chế tạo", nameJA: "機械製造", slug: "co-khi-che-tao" },
  {
    nameVN: "Nhà hàng - Khách sạn",
    nameJA: "レストラン・ホテル",
    slug: "nha-hang-khach-san",
  },
  { nameVN: "Xây dựng", nameJA: "建設", slug: "xay-dung" },
  { nameVN: "Điều dưỡng", nameJA: "介護", slug: "dieu-duong" },
] as const;

const TAGS = [
  {
    nameVN: "Không yêu cầu tiếng Nhật",
    nameJA: "日本語不要",
    slug: "khong-yeu-cau-tieng-nhat",
  },
  { nameVN: "Hỗ trợ visa", nameJA: "ビザサポート", slug: "ho-tro-visa" },
  { nameVN: "Nhận việc ngay", nameJA: "即採用", slug: "nhan-viec-ngay" },
  { nameVN: "Lương hấp dẫn", nameJA: "魅力的な給与", slug: "luong-hap-dan" },
  { nameVN: "Có ký túc xá", nameJA: "寮あり", slug: "co-ky-tuc-xa" },
] as const;

const PREFECTURES = [
  { code: "01", nameJP: "北海道", nameVN: "Hokkaido" },
  { code: "02", nameJP: "青森県", nameVN: "Aomori" },
  { code: "03", nameJP: "岩手県", nameVN: "Iwate" },
  { code: "04", nameJP: "宮城県", nameVN: "Miyagi" },
  { code: "05", nameJP: "秋田県", nameVN: "Akita" },
  { code: "06", nameJP: "山形県", nameVN: "Yamagata" },
  { code: "07", nameJP: "福島県", nameVN: "Fukushima" },
  { code: "08", nameJP: "茨城県", nameVN: "Ibaraki" },
  { code: "09", nameJP: "栃木県", nameVN: "Tochigi" },
  { code: "10", nameJP: "群馬県", nameVN: "Gunma" },
  { code: "11", nameJP: "埼玉県", nameVN: "Saitama" },
  { code: "12", nameJP: "千葉県", nameVN: "Chiba" },
  { code: "13", nameJP: "東京都", nameVN: "Tokyo" },
  { code: "14", nameJP: "神奈川県", nameVN: "Kanagawa" },
  { code: "15", nameJP: "新潟県", nameVN: "Niigata" },
  { code: "16", nameJP: "富山県", nameVN: "Toyama" },
  { code: "17", nameJP: "石川県", nameVN: "Ishikawa" },
  { code: "18", nameJP: "福井県", nameVN: "Fukui" },
  { code: "19", nameJP: "山梨県", nameVN: "Yamanashi" },
  { code: "20", nameJP: "長野県", nameVN: "Nagano" },
  { code: "21", nameJP: "岐阜県", nameVN: "Gifu" },
  { code: "22", nameJP: "静岡県", nameVN: "Shizuoka" },
  { code: "23", nameJP: "愛知県", nameVN: "Aichi" },
  { code: "24", nameJP: "三重県", nameVN: "Mie" },
  { code: "25", nameJP: "滋賀県", nameVN: "Shiga" },
  { code: "26", nameJP: "京都府", nameVN: "Kyoto" },
  { code: "27", nameJP: "大阪府", nameVN: "Osaka" },
  { code: "28", nameJP: "兵庫県", nameVN: "Hyogo" },
  { code: "29", nameJP: "奈良県", nameVN: "Nara" },
  { code: "30", nameJP: "和歌山県", nameVN: "Wakayama" },
  { code: "31", nameJP: "鳥取県", nameVN: "Tottori" },
  { code: "32", nameJP: "島根県", nameVN: "Shimane" },
  { code: "33", nameJP: "岡山県", nameVN: "Okayama" },
  { code: "34", nameJP: "広島県", nameVN: "Hiroshima" },
  { code: "35", nameJP: "山口県", nameVN: "Yamaguchi" },
  { code: "36", nameJP: "徳島県", nameVN: "Tokushima" },
  { code: "37", nameJP: "香川県", nameVN: "Kagawa" },
  { code: "38", nameJP: "愛媛県", nameVN: "Ehime" },
  { code: "39", nameJP: "高知県", nameVN: "Kochi" },
  { code: "40", nameJP: "福岡県", nameVN: "Fukuoka" },
  { code: "41", nameJP: "佐賀県", nameVN: "Saga" },
  { code: "42", nameJP: "長崎県", nameVN: "Nagasaki" },
  { code: "43", nameJP: "熊本県", nameVN: "Kumamoto" },
  { code: "44", nameJP: "大分県", nameVN: "Oita" },
  { code: "45", nameJP: "宮崎県", nameVN: "Miyazaki" },
  { code: "46", nameJP: "鹿児島県", nameVN: "Kagoshima" },
  { code: "47", nameJP: "沖縄県", nameVN: "Okinawa" },
] as const;

function buildSeedPasswordHash(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@jp-recruiter.local";
  const name = process.env.SEED_ADMIN_NAME ?? "System Admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: UserRole.ADMIN,
      passwordHash: buildSeedPasswordHash(password),
    },
    create: {
      email,
      name,
      role: UserRole.ADMIN,
      passwordHash: buildSeedPasswordHash(password),
    },
  });
}

async function seedNewsCategories() {
  await Promise.all(
    NEWS_CATEGORIES.map((category) =>
      prisma.newsCategory.upsert({
        where: { slug: category.slug },
        update: {
          nameVN: category.nameVN,
          nameJA: category.nameJA,
          iconKey: category.iconKey,
        },
        create: category,
      }),
    ),
  );
}

async function seedJobCategories() {
  await Promise.all(
    JOB_CATEGORIES.map((category) =>
      prisma.jobCategory.upsert({
        where: { slug: category.slug },
        update: { nameVN: category.nameVN, nameJA: category.nameJA },
        create: category,
      }),
    ),
  );
}

async function seedPrefectures() {
  await Promise.all(
    PREFECTURES.map((prefecture) =>
      prisma.prefecture.upsert({
        where: { code: prefecture.code },
        update: {
          nameJP: prefecture.nameJP,
          nameVN: prefecture.nameVN,
        },
        create: prefecture,
      }),
    ),
  );
}

async function seedTags() {
  await Promise.all(
    TAGS.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: { nameVN: tag.nameVN, nameJA: tag.nameJA },
        create: tag,
      }),
    ),
  );
}

async function main() {
  // Phase 1: seed all independent tables in parallel
  await Promise.all([
    seedAdminUser(),
    seedNewsCategories(),
    seedJobCategories(),
    seedPrefectures(),
    seedTags(),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seeding failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
