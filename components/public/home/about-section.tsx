import type { ReactNode } from "react";
import type { PublicLocale } from "@/lib/i18n/public-locales";

const SECTION_LABEL: Record<PublicLocale, string> = {
  vi: "Giới thiệu TLG",
  ja: "TLGについて",
};

const COMPANY_INFO_LABELS: Record<
  PublicLocale,
  {
    companyName: string;
    representative: string;
    address: string;
    phone: string;
    corporateNumber: string;
    established: string;
    capital: string;
    employees: string;
    registrationQualifications: string;
  }
> = {
  vi: {
    companyName: "Tên công ty",
    representative: "Người đại diện",
    address: "Địa chỉ",
    phone: "Điện thoại",
    corporateNumber: "Mã số pháp nhân",
    established: "Ngày thành lập",
    capital: "Vốn điều lệ",
    employees: "Số nhân viên",
    registrationQualifications: "Tư cách đăng ký",
  },
  ja: {
    companyName: "会社名",
    representative: "代表者名",
    address: "所在地",
    phone: "電話番号",
    corporateNumber: "法人番号",
    established: "設立日",
    capital: "資本金",
    employees: "従業員数",
    registrationQualifications: "登録資格",
  },
};

const REGISTRATION_QUALIFICATIONS: Record<PublicLocale, ReactNode> = {
  vi: (
    <div className="flex flex-col gap-0.5">
      <div>Tổ chức hỗ trợ đăng ký</div>
      <div>Số đăng ký: 24登-011246</div>
      <div>Giấy phép giới thiệu việc làm có thu phí</div>
      <div>Số giấy phép: 13－ユ－318708</div>
    </div>
  ),
  ja: (
    <div className="flex flex-col gap-0.5">
      <div>登録支援機関</div>
      <div>登録番号：24登-011246</div>
      <div>有料職業紹介事業許可</div>
      <div>許可番号：13－ユ－318708</div>
    </div>
  ),
};

const COMPANY_DATA: Record<
  PublicLocale,
  {
    companyName: string;
    representative: string;
    address: string;
    phone: string;
    corporateNumber: string;
    established: string;
    registrationQualifications: ReactNode;
  }
> = {
  vi: {
    companyName: "Công ty Cổ phần TLG",
    representative: "Nguyễn Văn Lãnh",
    address: "3-23-23 Kitakoiwa, Quận Edogawa, Tokyo 113-0051, Nhật Bản",
    phone: "03-6784-4064",
    corporateNumber: "0115-01-024488",
    established: "Ngày 6 tháng 2 năm 2019",
    registrationQualifications: REGISTRATION_QUALIFICATIONS.vi,
  },
  ja: {
    companyName: "TLG株式会社",
    representative: "チャン　バン　ラン",
    address: "〒113-0051 東京都江戸川区北小岩 3-23-23",
    phone: "03-6784-4064",
    corporateNumber: "0115-01-024488",
    established: "平成31年2月6日",
    registrationQualifications: REGISTRATION_QUALIFICATIONS.ja,
  },
};

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.531141036305!2d139.89263261190231!3d35.73774782675179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601885d557b180f3%3A0x4f530b48138fb057!2s3-ch%C5%8Dme-23-23%20Kitakoiwa%2C%20Edogawa%20City%2C%20Tokyo%20133-0051%2C%20Japan!5e0!3m2!1sen!2s!4v1771689323773!5m2!1sen!2s";

type AboutSectionProps = {
  locale: PublicLocale;
};

export function AboutSection({ locale }: AboutSectionProps) {
  const labels = COMPANY_INFO_LABELS[locale];
  const sectionTitle = SECTION_LABEL[locale];
  const data = COMPANY_DATA[locale];

  const rows: { label: string; value: ReactNode }[] = [
    { label: labels.companyName, value: data.companyName },
    { label: labels.representative, value: data.representative },
    { label: labels.address, value: data.address },
    { label: labels.phone, value: data.phone },
    { label: labels.corporateNumber, value: data.corporateNumber },
    { label: labels.established, value: data.established },
    {
      label: labels.registrationQualifications,
      value: data.registrationQualifications,
    },
  ];

  return (
    <section id="about" className="mx-auto w-full max-w-6xl px-6 py-20">
      <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
        {sectionTitle}
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: company basic info */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.25)]">
          <dl className="divide-y divide-slate-100">
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 px-6 py-4"
              >
                <dt className="text-sm font-medium text-slate-500">{label}</dt>
                <dd className="text-sm text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: Google Maps embed */}
        <div className="min-h-72 overflow-hidden rounded-2xl shadow-[0_20px_50px_-35px_rgba(0,0,0,0.25)]">
          <iframe
            title="TLG株式会社 location map"
            src={MAPS_EMBED_URL}
            width="100%"
            height="100%"
            className="h-full min-h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
