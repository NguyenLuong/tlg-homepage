/**
 * Contact page content and default data
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export const INQUIRY_TYPE_VALUES = [
  "technical-intern",
  "specified-skill",
  "other",
] as const;

export type InquiryTypeValue = (typeof INQUIRY_TYPE_VALUES)[number];

export type ContactInquiryTypeOption = {
  value: InquiryTypeValue;
  label: string;
};

export type ContactFormFieldLabels = {
  nameLabel: string;
  namePlaceholder: string;
  furiganaLabel: string;
  furiganaPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailConfirmLabel: string;
  emailConfirmPlaceholder: string;
  postalCodeLabel: string;
  postalCodePlaceholder1: string;
  postalCodePlaceholder2: string;
  postalCodeLookupingLabel: string;
  postalCodeNotFoundLabel: string;
  prefectureLabel: string;
  prefecturePlaceholder: string;
  addressLineLabel: string;
  addressLinePlaceholder: string;
  inquiryTypeLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  requiredMark: string;
  optionalMark: string;
};

export type ContactFormValidationMessages = {
  required: string;
  invalidEmail: string;
  emailMismatch: string;
  invalidPostalCode: string;
};

export type ContactFormContent = {
  title: string;
  description: string;
  editLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmSubmitLabel: string;
  backLabel: string;
  sendingLabel: string;
  successMessage: string;
  fields: ContactFormFieldLabels;
  inquiryTypes: ReadonlyArray<ContactInquiryTypeOption>;
  validation: ContactFormValidationMessages;
};

export type ContactContent = {
  hero: {
    eyebrow: string;
    headline: string;
    subheading: string;
    note: string;
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
      eyebrow: "Liên hệ",
      headline: "Liên hệ & Yêu cầu tài liệu",
      subheading:
        "Vui lòng liên hệ với chúng tôi qua biểu mẫu dưới đây. Các mục có dấu ※ là bắt buộc.",
      note: "※ Chúng tôi không tiếp nhận các liên hệ mang mục đích chào bán dịch vụ.",
    },
    form: {
      title: "Biểu mẫu liên hệ",
      description:
        "Điền vào biểu mẫu bên dưới. Chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc.",
      editLabel: "Xem lại thông tin",
      confirmTitle: "Xác nhận nội dung",
      confirmDescription:
        "Vui lòng kiểm tra lại thông tin trước khi gửi. Nhấn \"Quay lại sửa\" để chỉnh sửa.",
      confirmSubmitLabel: "Gửi",
      backLabel: "Quay lại sửa",
      sendingLabel: "Đang gửi...",
      successMessage:
        "Cảm ơn bạn! Chúng tôi đã nhận được liên hệ và sẽ phản hồi sớm.",
      fields: {
        nameLabel: "Họ tên",
        namePlaceholder: "Họ và tên đầy đủ của bạn",
        furiganaLabel: "Furigana",
        furiganaPlaceholder: "Cách đọc tên (hiragana/katakana)",
        companyLabel: "Tên công ty / tổ chức",
        companyPlaceholder: "Tên doanh nghiệp hoặc tổ chức",
        emailLabel: "Địa chỉ email",
        emailPlaceholder: "ten@example.com",
        emailConfirmLabel: "Địa chỉ email (xác nhận)",
        emailConfirmPlaceholder: "Nhập lại địa chỉ email",
        postalCodeLabel: "Mã bưu điện",
        postalCodePlaceholder1: "123",
        postalCodePlaceholder2: "4567",
        postalCodeLookupingLabel: "Đang tra cứu...",
        postalCodeNotFoundLabel:
          "Không tìm thấy địa chỉ cho mã bưu điện này. Vui lòng chọn thủ công.",
        prefectureLabel: "Tỉnh/thành",
        prefecturePlaceholder: "Chọn tỉnh/thành",
        addressLineLabel: "Địa chỉ chi tiết",
        addressLinePlaceholder: "Quận/huyện, số nhà, đường…",
        inquiryTypeLabel: "Loại liên hệ",
        messageLabel: "Nội dung liên hệ",
        messagePlaceholder: "Vui lòng nhập nội dung bạn muốn trao đổi.",
        requiredMark: "※",
        optionalMark: "(tuỳ chọn)",
      },
      inquiryTypes: [
        {
          value: "technical-intern",
          label: "Về tuyển dụng Thực tập sinh kỹ năng",
        },
        { value: "specified-skill", label: "Về tuyển dụng Kỹ năng đặc định" },
        { value: "other", label: "Khác" },
      ],
      validation: {
        required: "Trường này là bắt buộc.",
        invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ.",
        emailMismatch: "Email xác nhận không khớp.",
        invalidPostalCode:
          "Vui lòng nhập mã bưu điện gồm 3 số và 4 số (vd: 123-4567).",
      },
    },
  },
  ja: {
    hero: {
      eyebrow: "お問い合わせ",
      headline: "お問い合わせ・資料請求",
      subheading:
        "お問い合わせ・資料請求は下記フォームよりお気軽にご連絡ください。※は必須項目になります。",
      note: "※ 営業目的のお問い合わせはお受けしておりません。",
    },
    form: {
      title: "お問い合わせフォーム",
      description:
        "以下のフォームにご記入ください。1〜2営業日以内にご返答いたします。",
      editLabel: "入力内容確認",
      confirmTitle: "入力内容のご確認",
      confirmDescription:
        "ご入力いただいた内容をご確認ください。修正する場合は「戻る」を押してください。",
      confirmSubmitLabel: "送信する",
      backLabel: "戻る",
      sendingLabel: "送信中...",
      successMessage:
        "お問い合わせを受け付けました。担当者より追ってご連絡いたします。",
      fields: {
        nameLabel: "お名前",
        namePlaceholder: "山田 太郎",
        furiganaLabel: "ふりがな",
        furiganaPlaceholder: "やまだ たろう",
        companyLabel: "企業・団体名",
        companyPlaceholder: "株式会社〇〇",
        emailLabel: "メールアドレス",
        emailPlaceholder: "name@example.com",
        emailConfirmLabel: "メールアドレス(確認用)",
        emailConfirmPlaceholder: "確認のため再度ご入力ください",
        postalCodeLabel: "郵便番号",
        postalCodePlaceholder1: "123",
        postalCodePlaceholder2: "4567",
        postalCodeLookupingLabel: "検索中...",
        postalCodeNotFoundLabel:
          "この郵便番号の住所が見つかりませんでした。手動でご入力ください。",
        prefectureLabel: "都道府県",
        prefecturePlaceholder: "都道府県を選択してください",
        addressLineLabel: "市区町村以降",
        addressLinePlaceholder: "市区町村・番地など",
        inquiryTypeLabel: "お問い合わせ種類",
        messageLabel: "ご用件",
        messagePlaceholder: "お問い合わせ内容をご記入ください。",
        requiredMark: "※",
        optionalMark: "(任意)",
      },
      inquiryTypes: [
        { value: "technical-intern", label: "技能実習生の採用について" },
        { value: "specified-skill", label: "特定技能の採用について" },
        { value: "other", label: "その他" },
      ],
      validation: {
        required: "この項目は必須です。",
        invalidEmail: "有効なメールアドレスを入力してください。",
        emailMismatch: "確認用メールアドレスが一致しません。",
        invalidPostalCode: "郵便番号は3桁と4桁の数字を入力してください。",
      },
    },
  },
};
