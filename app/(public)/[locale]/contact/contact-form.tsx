"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type PublicLocale } from "@/lib/i18n/public-locales";
import type {
  ContactFormContent,
  InquiryTypeValue,
} from "@/lib/public-content/contact-content";
import {
  getLocalizedPrefectures,
  getPrefectureLabel,
} from "@/lib/public-content/japan-prefectures";
import { lookupPostalCode } from "@/lib/public-content/postal-code-lookup";
import {
  getInputErrorClasses,
  scrollToFirstError,
} from "@/lib/validation/form-errors";

type ContactFormProps = {
  content: ContactFormContent;
  locale: PublicLocale;
};

type ContactSubmitPayload = {
  name: string;
  furigana: string;
  company?: string;
  email: string;
  postalCode: string;
  prefecture: string;
  addressLine: string;
  inquiryType: InquiryTypeValue;
  message: string;
  sourcePage: string;
  locale: PublicLocale;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type FormMode = "edit" | "confirm";

type PostalLookupStatus = "idle" | "loading" | "not-found";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanOptional(value: string): string | undefined {
  const sanitized = value.trim();
  return sanitized.length > 0 ? sanitized : undefined;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
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
  const { fields, inquiryTypes, validation } = content;
  const prefectures = useMemo(() => getLocalizedPrefectures(locale), [locale]);

  const [mode, setMode] = useState<FormMode>("edit");
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [postalCode1, setPostalCode1] = useState("");
  const [postalCode2, setPostalCode2] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [inquiryType, setInquiryType] = useState<InquiryTypeValue | "">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [postalStatus, setPostalStatus] = useState<PostalLookupStatus>("idle");
  const [isSubmitting, startSubmitTransition] = useTransition();

  const postal2Ref = useRef<HTMLInputElement>(null);
  const lookupAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (mode === "edit" && Object.keys(errors).length > 0) {
      scrollToFirstError(errors, "contact-form");
    }
  }, [errors, mode]);

  useEffect(() => {
    return () => {
      lookupAbortRef.current?.abort();
    };
  }, []);

  const triggerLookup = (p1: string, p2: string) => {
    if (p1.length !== 3 || p2.length !== 4) return;
    lookupAbortRef.current?.abort();
    const controller = new AbortController();
    lookupAbortRef.current = controller;
    setPostalStatus("loading");

    lookupPostalCode(`${p1}${p2}`, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result) {
        setPostalStatus("not-found");
        return;
      }
      setPrefecture(result.prefectureValue);
      setAddressLine(result.addressLine);
      setPostalStatus("idle");
    });
  };

  const required = (label: string) => (
    <>
      {label}
      <span className="ml-1 text-red-600">{fields.requiredMark}</span>
    </>
  );

  const validate = (): Record<string, string> => {
    const trimmedName = name.trim();
    const trimmedFurigana = furigana.trim();
    const trimmedEmail = email.trim();
    const trimmedEmailConfirm = emailConfirm.trim();
    const trimmedAddressLine = addressLine.trim();
    const trimmedMessage = message.trim();

    const validationErrors: Record<string, string> = {};

    if (!trimmedName) validationErrors.name = validation.required;
    if (!trimmedFurigana) validationErrors.furigana = validation.required;
    if (!trimmedEmail) {
      validationErrors.email = validation.required;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      validationErrors.email = validation.invalidEmail;
    }
    if (!trimmedEmailConfirm) {
      validationErrors.emailConfirm = validation.required;
    } else if (trimmedEmail && trimmedEmail !== trimmedEmailConfirm) {
      validationErrors.emailConfirm = validation.emailMismatch;
    }
    if (postalCode1.length !== 3 || postalCode2.length !== 4) {
      validationErrors.postalCode = validation.invalidPostalCode;
    }
    if (!prefecture) validationErrors.prefecture = validation.required;
    if (!trimmedAddressLine) validationErrors.addressLine = validation.required;
    if (!inquiryType) validationErrors.inquiryType = validation.required;
    if (!trimmedMessage) validationErrors.message = validation.required;

    return validationErrors;
  };

  const handleProceedToConfirm = () => {
    setFeedback(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setMode("confirm");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToEdit = () => {
    setMode("edit");
    setErrors({});
  };

  const resetForm = () => {
    setName("");
    setFurigana("");
    setCompany("");
    setEmail("");
    setEmailConfirm("");
    setPostalCode1("");
    setPostalCode2("");
    setPrefecture("");
    setAddressLine("");
    setInquiryType("");
    setMessage("");
    setPostalStatus("idle");
  };

  const handleSubmit = () => {
    startSubmitTransition(async () => {
      setErrors({});
      setFeedback(null);

      const payload: ContactSubmitPayload = {
        name: name.trim(),
        furigana: furigana.trim(),
        company: cleanOptional(company),
        email: email.trim(),
        postalCode: `${postalCode1}-${postalCode2}`,
        prefecture,
        addressLine: addressLine.trim(),
        inquiryType: inquiryType as InquiryTypeValue,
        message: message.trim(),
        sourcePage: "contact",
        locale,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(response);
        setErrors({ form: errorMessage });
        return;
      }

      resetForm();
      setMode("edit");
      setFeedback(content.successMessage);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  if (mode === "confirm") {
    const inquiryLabel =
      inquiryTypes.find((option) => option.value === inquiryType)?.label ?? "";
    const prefectureLabel = getPrefectureLabel(prefecture, locale);

    return (
      <ConfirmView
        content={content}
        rows={[
          { label: fields.nameLabel, value: name },
          { label: fields.furiganaLabel, value: furigana },
          {
            label: fields.companyLabel,
            value: company.trim() || "—",
          },
          { label: fields.emailLabel, value: email },
          {
            label: fields.postalCodeLabel,
            value: `${postalCode1}-${postalCode2}`,
          },
          { label: fields.prefectureLabel, value: prefectureLabel },
          { label: fields.addressLineLabel, value: addressLine },
          { label: fields.inquiryTypeLabel, value: inquiryLabel },
          {
            label: fields.messageLabel,
            value: <span className="whitespace-pre-wrap">{message}</span>,
          },
        ]}
        isSubmitting={isSubmitting}
        formError={errors.form}
        onBack={handleBackToEdit}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {content.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{content.description}</p>
      </div>

      {feedback ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {feedback}
        </p>
      ) : null}

      <form
        id="contact-form"
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          handleProceedToConfirm();
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {required(fields.nameLabel)}
            </span>
            <Input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={fields.namePlaceholder}
              className={getInputErrorClasses("name", errors)}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {required(fields.furiganaLabel)}
            </span>
            <Input
              name="furigana"
              value={furigana}
              onChange={(event) => setFurigana(event.target.value)}
              placeholder={fields.furiganaPlaceholder}
              className={getInputErrorClasses("furigana", errors)}
            />
            {errors.furigana && (
              <p className="text-xs text-red-600">{errors.furigana}</p>
            )}
          </label>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="font-medium text-slate-700">
            {fields.companyLabel}
            <span className="ml-2 text-xs font-normal text-slate-500">
              {fields.optionalMark}
            </span>
          </span>
          <Input
            name="company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder={fields.companyPlaceholder}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {required(fields.emailLabel)}
            </span>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={fields.emailPlaceholder}
              className={getInputErrorClasses("email", errors)}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">
              {required(fields.emailConfirmLabel)}
            </span>
            <Input
              type="email"
              name="emailConfirm"
              value={emailConfirm}
              onChange={(event) => setEmailConfirm(event.target.value)}
              placeholder={fields.emailConfirmPlaceholder}
              className={getInputErrorClasses("emailConfirm", errors)}
            />
            {errors.emailConfirm && (
              <p className="text-xs text-red-600">{errors.emailConfirm}</p>
            )}
          </label>
        </div>

        <div className="space-y-2 text-sm" data-field="postalCode">
          <span className="font-medium text-slate-700">
            {required(fields.postalCodeLabel)}
          </span>
          <div className="flex items-center gap-2">
            <Input
              name="postalCode1"
              value={postalCode1}
              onChange={(event) => {
                const next = digitsOnly(event.target.value).slice(0, 3);
                setPostalCode1(next);
                if (next.length < 3) setPostalStatus("idle");
                if (next.length === 3) postal2Ref.current?.focus();
                triggerLookup(next, postalCode2);
              }}
              placeholder={fields.postalCodePlaceholder1}
              inputMode="numeric"
              pattern="\d*"
              maxLength={3}
              className={cn(
                "w-20 text-center",
                errors.postalCode &&
                  "border-red-500 focus-visible:ring-red-500",
              )}
            />
            <span className="text-slate-500">-</span>
            <Input
              ref={postal2Ref}
              name="postalCode2"
              value={postalCode2}
              onChange={(event) => {
                const next = digitsOnly(event.target.value).slice(0, 4);
                setPostalCode2(next);
                if (next.length < 4) setPostalStatus("idle");
                triggerLookup(postalCode1, next);
              }}
              placeholder={fields.postalCodePlaceholder2}
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              className={cn(
                "w-24 text-center",
                errors.postalCode &&
                  "border-red-500 focus-visible:ring-red-500",
              )}
            />
            {postalStatus === "loading" && (
              <span className="text-xs text-slate-500">
                {fields.postalCodeLookupingLabel}
              </span>
            )}
          </div>
          {postalStatus === "not-found" && (
            <p className="text-xs text-amber-600">
              {fields.postalCodeNotFoundLabel}
            </p>
          )}
          {errors.postalCode && (
            <p className="text-xs text-red-600">{errors.postalCode}</p>
          )}
        </div>

        <div className="space-y-2 text-sm" data-field="prefecture">
          <span className="font-medium text-slate-700">
            {required(fields.prefectureLabel)}
          </span>
          <Select value={prefecture} onValueChange={setPrefecture}>
            <SelectTrigger
              className={cn(
                "w-full md:w-72",
                errors.prefecture && "border-red-500 focus-visible:ring-red-500",
              )}
            >
              <SelectValue placeholder={fields.prefecturePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {prefectures.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.prefecture && (
            <p className="text-xs text-red-600">{errors.prefecture}</p>
          )}
        </div>

        <label className="block space-y-2 text-sm" data-field="addressLine">
          <span className="font-medium text-slate-700">
            {required(fields.addressLineLabel)}
          </span>
          <Input
            name="addressLine"
            value={addressLine}
            onChange={(event) => setAddressLine(event.target.value)}
            placeholder={fields.addressLinePlaceholder}
            className={getInputErrorClasses("addressLine", errors)}
          />
          {errors.addressLine && (
            <p className="text-xs text-red-600">{errors.addressLine}</p>
          )}
        </label>

        <fieldset className="space-y-2 text-sm" data-field="inquiryType">
          <legend className="font-medium text-slate-700">
            {required(fields.inquiryTypeLabel)}
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
            {inquiryTypes.map((option) => {
              const checked = inquiryType === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition",
                    checked
                      ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300",
                  )}
                >
                  <input
                    type="radio"
                    name="inquiryType"
                    value={option.value}
                    checked={checked}
                    onChange={() => setInquiryType(option.value)}
                    className="h-4 w-4 accent-cyan-600"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          {errors.inquiryType && (
            <p className="text-xs text-red-600">{errors.inquiryType}</p>
          )}
        </fieldset>

        <label className="block space-y-2 text-sm">
          <span className="font-medium text-slate-700">
            {required(fields.messageLabel)}
          </span>
          <Textarea
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={fields.messagePlaceholder}
            rows={6}
            className={getInputErrorClasses("message", errors)}
          />
          {errors.message && (
            <p className="text-xs text-red-600">{errors.message}</p>
          )}
        </label>

        <div className="pt-2">
          <Button type="submit" className="w-full sm:w-auto sm:min-w-48">
            {content.editLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

type ConfirmRow = {
  label: string;
  value: ReactNode;
};

type ConfirmViewProps = {
  content: ContactFormContent;
  rows: ConfirmRow[];
  isSubmitting: boolean;
  formError?: string;
  onBack: () => void;
  onSubmit: () => void;
};

function ConfirmView({
  content,
  rows,
  isSubmitting,
  formError,
  onBack,
  onSubmit,
}: ConfirmViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {content.confirmTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {content.confirmDescription}
        </p>
      </div>

      <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
          >
            <dt className="text-sm font-medium text-slate-600">{row.label}</dt>
            <dd className="text-sm text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="sm:min-w-32"
        >
          {content.backLabel}
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText={content.sendingLabel}
          className="sm:min-w-48"
        >
          {content.confirmSubmitLabel}
        </Button>
      </div>
    </div>
  );
}
