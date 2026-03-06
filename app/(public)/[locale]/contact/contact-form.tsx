"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type PublicLocale } from "@/lib/i18n/public-locales";
import {
  getInputErrorClasses,
  scrollToFirstError,
} from "@/lib/validation/form-errors";

type ContactFormContent = {
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
};

type ContactFormLabels = {
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  sendingLabel: string;
  requiredFieldsError: string;
  invalidEmailError: string;
};

const FORM_LABELS: Record<PublicLocale, ContactFormLabels> = {
  vi: {
    nameLabel: "Họ tên *",
    namePlaceholder: "Họ và tên đầy đủ của bạn",
    phoneLabel: "Số điện thoại *",
    phonePlaceholder: "+81...",
    emailLabel: "Email",
    emailPlaceholder: "ten@example.com",
    subjectLabel: "Chủ đề",
    subjectPlaceholder: "Bạn muốn trao đổi về điều gì?",
    messageLabel: "Tin nhắn *",
    messagePlaceholder:
      "Chia sẻ về mục tiêu, vị trí ưa thích, hoặc nhu cầu tuyển dụng của bạn.",
    sendingLabel: "Đang gửi...",
    requiredFieldsError: "Họ tên, số điện thoại và tin nhắn là bắt buộc.",
    invalidEmailError: "Vui lòng cung cấp địa chỉ email hợp lệ.",
  },
  ja: {
    nameLabel: "お名前 *",
    namePlaceholder: "フルネームを入力してください",
    phoneLabel: "電話番号 *",
    phonePlaceholder: "+81...",
    emailLabel: "メール",
    emailPlaceholder: "name@example.com",
    subjectLabel: "件名",
    subjectPlaceholder: "どんなことを相談したいですか？",
    messageLabel: "メッセージ *",
    messagePlaceholder: "目標、希望職種、採用ニーズなどをお知らせください。",
    sendingLabel: "送信中...",
    requiredFieldsError: "お名前、電話番号、メッセージは必須です。",
    invalidEmailError: "有効なメールアドレスを入力してください。",
  },
};

type ContactFormProps = {
  content: ContactFormContent;
  locale: PublicLocale;
};

type ContactSubmitPayload = {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  sourcePage: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanOptional(value: string): string | undefined {
  const sanitized = value.trim();
  return sanitized.length > 0 ? sanitized : undefined;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorResponse;
    const message = body.error?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  } catch {
    // ignore parse errors and use fallback below
  }

  return `Request failed with status ${response.status}.`;
}

export default function ContactForm({ content, locale }: ContactFormProps) {
  const labels = FORM_LABELS[locale];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  // Scroll to first error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors, "contact-form");
    }
  }, [errors]);

  const handleSubmit = () => {
    startSubmitTransition(async () => {
      setErrors({});
      setFeedback(null);

      const payload: ContactSubmitPayload = {
        name: name.trim(),
        phone: phone.trim(),
        email: cleanOptional(email),
        subject: cleanOptional(subject),
        message: message.trim(),
        sourcePage: "contact",
      };

      // Client-side validation
      const validationErrors: Record<string, string> = {};

      if (!payload.name) {
        validationErrors.name = labels.requiredFieldsError;
      }

      if (!payload.phone) {
        validationErrors.phone = labels.requiredFieldsError;
      }

      if (!payload.message) {
        validationErrors.message = labels.requiredFieldsError;
      }

      if (payload.email && !EMAIL_REGEX.test(payload.email)) {
        validationErrors.email = labels.invalidEmailError;
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(response);
        setErrors({ form: errorMessage });
        return;
      }

      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
      setFeedback(content.successMessage);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {content.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{content.description}</p>
      </div>

      <form
        id="contact-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {labels.nameLabel}
            </span>
            <Input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={labels.namePlaceholder}
              required
              disabled={isSubmitting}
              className={getInputErrorClasses("name", errors)}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {labels.phoneLabel}
            </span>
            <Input
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={labels.phonePlaceholder}
              required
              disabled={isSubmitting}
              className={getInputErrorClasses("phone", errors)}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone}</p>
            )}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {labels.emailLabel}
            </span>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={labels.emailPlaceholder}
              disabled={isSubmitting}
              className={getInputErrorClasses("email", errors)}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {labels.subjectLabel}
            </span>
            <Input
              name="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={labels.subjectPlaceholder}
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">
            {labels.messageLabel}
          </span>
          <Textarea
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={labels.messagePlaceholder}
            rows={6}
            required
            disabled={isSubmitting}
            className={getInputErrorClasses("message", errors)}
          />
          {errors.message && (
            <p className="text-xs text-red-600">{errors.message}</p>
          )}
        </div>

        {errors.form && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errors.form}
          </div>
        )}
        {feedback ? (
          <p className="text-sm text-emerald-700">{feedback}</p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText={labels.sendingLabel}
        >
          {content.submitLabel}
        </Button>
      </form>
    </div>
  );
}
