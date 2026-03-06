/**
 * Contact page content and default data
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export type ContactPageCopy = {
  officeInfoTitle: string;
  phoneLabel: string;
  emailLabel: string;
  addressLabel: string;
  workingHoursLabel: string;
};

export const CONTACT_PAGE_COPY: Record<PublicLocale, ContactPageCopy> = {
  vi: {
    officeInfoTitle: "Thông tin văn phòng",
    phoneLabel: "Điện thoại",
    emailLabel: "Email",
    addressLabel: "Địa chỉ",
    workingHoursLabel: "Giờ làm việc",
  },
  ja: {
    officeInfoTitle: "オフィス情報",
    phoneLabel: "電話番号",
    emailLabel: "メール",
    addressLabel: "住所",
    workingHoursLabel: "営業時間",
  },
};

export type ContactFormContent = {
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
};

export type ContactContent = {
  hero: {
    headline: string;
    subheading: string;
  };
  office: {
    phone: string;
    email: string;
    address: string;
    workingHours: string;
  };
  form: ContactFormContent;
};

export const DEFAULT_PAGE_TITLE: Record<PublicLocale, string> = {
  vi: "Liên hệ",
  ja: "お問い合わせ",
};

export const DEFAULT_CONTACT_CONTENT: Record<PublicLocale, ContactContent> = {
  vi: {
    hero: {
      headline: "Liên hệ với chúng tôi",
      subheading:
        "Hãy để lại thông tin và chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
    },
    office: {
      phone: "+81-3-0000-0000",
      email: "contact@tlg.co.jp",
      address: "Tòa nhà ABC, 1-2-3 Shinjuku, Tokyo, Nhật Bản",
      workingHours: "Thứ Hai – Thứ Sáu: 9:00 – 18:00 (JST)",
    },
    form: {
      title: "Gửi tin nhắn",
      description:
        "Điền vào biểu mẫu bên dưới và chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc.",
      submitLabel: "Gửi tin nhắn",
      successMessage:
        "Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại sớm.",
    },
  },
  ja: {
    hero: {
      headline: "お問い合わせ",
      subheading: "お気軽にご連絡ください。できるだけ早くご返答いたします。",
    },
    office: {
      phone: "+81-3-0000-0000",
      email: "contact@tlg.co.jp",
      address: "ABCビル 1-2-3 新宿区, 東京都, 日本",
      workingHours: "月曜日〜金曜日：9:00〜18:00（JST）",
    },
    form: {
      title: "メッセージを送る",
      description:
        "以下のフォームにご記入ください。1〜2営業日以内にご返答いたします。",
      submitLabel: "送信する",
      successMessage:
        "ありがとうございます！メッセージを受け取りました。近日中にご連絡いたします。",
    },
  },
};
