"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { startOfDay } from "date-fns";
import Button from "@/components/Button";
import FalconDatePicker from "@/components/ui/FalconDatePicker";
import FalconPhoneInput, { isValidPhoneNumber } from "@/components/ui/FalconPhoneInput";
import type { VipUser } from "@/data/vipUsers";

const BOOKING_STORAGE_KEY = "gfn_vip_ticket_booking";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

type VipTicketBookingFormProps = {
  user: VipUser;
  onSuccess?: () => void;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  dateOfBirth: string;
  arrivalDate: string;
  departureDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  specialRequirements: string;
  terms: boolean;
};

type FormErrors = Partial<Record<keyof FormState | "passportPhoto", string>>;

function fieldClass(error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep ${
    error ? "border-red-500" : "border-ink/20"
  }`;
}

export default function VipTicketBookingForm({ user, onSuccess }: VipTicketBookingFormProps) {
  const t = useTranslations("vipPage.ticketBooking");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "",
    dateOfBirth: "",
    arrivalDate: "",
    departureDate: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    specialRequirements: "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(true);
  const today = useMemo(() => startOfDay(new Date()), []);
  const arrivalMinDate = useMemo(
    () => (form.arrivalDate ? startOfDay(new Date(form.arrivalDate)) : today),
    [form.arrivalDate, today]
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${BOOKING_STORAGE_KEY}_${user.id}`);
      if (raw) setSubmitted(true);
    } catch {
      // ignore
    }
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingEmail() {
      setCheckingEmail(true);
      try {
        const response = await fetch(
          `/api/vip-ticket-booking/check-email?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

        if (cancelled) return;

        if (response.ok && data?.exists) {
          setEmailAlreadyRegistered(true);
          setErrors((prev) => ({ ...prev, email: t("errors.emailAlreadyExists") }));
        }
      } catch {
        // ignore — submit path will re-check
      } finally {
        if (!cancelled) setCheckingEmail(false);
      }
    }

    checkExistingEmail();
    return () => {
      cancelled = true;
    };
  }, [user.email, t]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrors((prev) => ({ ...prev, passportPhoto: undefined }));

    if (!file) {
      setPassportPhoto(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, passportPhoto: t("errors.passportPhotoType") }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, passportPhoto: t("errors.passportPhotoSize") }));
      event.target.value = "";
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPassportPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = t("errors.fullName");
    if (!form.phone.trim()) {
      nextErrors.phone = t("errors.phone");
    } else if (!isValidPhoneNumber(form.phone)) {
      nextErrors.phone = t("errors.phoneInvalid");
    }
    if (!form.passportNumber.trim()) nextErrors.passportNumber = t("errors.passportNumber");
    if (!form.passportExpiry) nextErrors.passportExpiry = t("errors.passportExpiry");
    if (!form.nationality.trim()) nextErrors.nationality = t("errors.nationality");
    if (!form.dateOfBirth) nextErrors.dateOfBirth = t("errors.dateOfBirth");
    if (!form.arrivalDate) nextErrors.arrivalDate = t("errors.arrivalDate");
    if (!form.departureDate) nextErrors.departureDate = t("errors.departureDate");
    if (!form.emergencyContactName.trim()) {
      nextErrors.emergencyContactName = t("errors.emergencyContactName");
    }
    if (!form.emergencyContactPhone.trim()) {
      nextErrors.emergencyContactPhone = t("errors.emergencyContactPhone");
    } else if (!isValidPhoneNumber(form.emergencyContactPhone)) {
      nextErrors.emergencyContactPhone = t("errors.phoneInvalid");
    }
    if (!passportPhoto) nextErrors.passportPhoto = t("errors.passportPhoto");
    if (!form.terms) nextErrors.terms = t("errors.terms");

    if (form.arrivalDate && form.departureDate && form.arrivalDate > form.departureDate) {
      nextErrors.departureDate = t("errors.departureBeforeArrival");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (emailAlreadyRegistered) {
      toast.error(t("errors.emailAlreadyExists"));
      return;
    }
    if (!validate() || !passportPhoto) return;

    setLoading(true);

    try {
      const checkResponse = await fetch(
        `/api/vip-ticket-booking/check-email?email=${encodeURIComponent(form.email)}`
      );
      const checkData = await checkResponse.json();

      if (checkResponse.ok && checkData?.exists) {
        setEmailAlreadyRegistered(true);
        setErrors((prev) => ({ ...prev, email: t("errors.emailAlreadyExists") }));
        toast.error(t("errors.emailAlreadyExists"));
        return;
      }

      const payload = new FormData();
      payload.append("fullName", form.fullName);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      payload.append("passportNumber", form.passportNumber);
      payload.append("passportExpiry", form.passportExpiry);
      payload.append("nationality", form.nationality);
      payload.append("dateOfBirth", form.dateOfBirth);
      payload.append("arrivalDate", form.arrivalDate);
      payload.append("departureDate", form.departureDate);
      payload.append("emergencyContactName", form.emergencyContactName);
      payload.append("emergencyContactPhone", form.emergencyContactPhone);
      payload.append("specialRequirements", form.specialRequirements);
      payload.append("memberId", user.memberId);
      payload.append("userId", user.id);
      payload.append("ibId", user.ibId);
      payload.append("terms", String(form.terms));
      payload.append("passportPhoto", passportPhoto);

      const response = await fetch("/api/vip-ticket-booking", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        if (data?.code === "EMAIL_ALREADY_EXISTS") {
          setEmailAlreadyRegistered(true);
          setErrors((prev) => ({ ...prev, email: t("errors.emailAlreadyExists") }));
          toast.error(t("errors.emailAlreadyExists"));
          return;
        }

        throw new Error(data?.message || t("submitFailed"));
      }

      try {
        sessionStorage.setItem(
          `${BOOKING_STORAGE_KEY}_${user.id}`,
          JSON.stringify({
            ...form,
            memberId: user.memberId,
            passportPhotoName: passportPhoto.name,
            submittedAt: new Date().toISOString(),
            mongoId: data.id,
          })
        );
      } catch {
        // ignore
      }

      setSubmitted(true);
      toast.success(t("successMessage"));
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-8 text-center">
        <p className="font-display text-xl font-medium text-green-800">{t("successTitle")}</p>
        <p className="mt-2 TextSmall !font-poppins !text-green-700">{t("successDescription")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="TextSmall !font-poppins !text-ink/75">{t("description")}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="font-poppins text-sm text-ink/70">{t("fields.fullName")} *</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={fieldClass(errors.fullName)}
            placeholder={t("placeholders.fullName")}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.email")} *</label>
          <input
            type="email"
            value={form.email}
            readOnly
            className={`${fieldClass(errors.email)} bg-ink/5`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="vip-phone" className="font-poppins text-sm text-ink/70">
            {t("fields.phone")} *
          </label>
          <FalconPhoneInput
            id="vip-phone"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
            error={errors.phone}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="font-poppins text-sm text-ink/70">{t("fields.passportPhoto")} *</label>
          <div
            className={`mt-2 rounded-md border border-dashed bg-white p-4 ${
              errors.passportPhoto ? "border-red-500" : "border-ink/25"
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="block w-full font-poppins text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-[#382910] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.12em] file:text-white"
            />
            <p className="mt-2 text-xs text-ink/55">{t("placeholders.passportPhoto")}</p>
            {photoPreview && (
              <img
                src={photoPreview}
                alt={t("fields.passportPhoto")}
                className="mt-3 h-32 w-auto rounded-md border border-ink/15 object-cover"
              />
            )}
          </div>
          {errors.passportPhoto && (
            <p className="mt-1 text-xs text-red-600">{errors.passportPhoto}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.passportNumber")} *</label>
          <input
            type="text"
            value={form.passportNumber}
            onChange={(e) => updateField("passportNumber", e.target.value.toUpperCase())}
            className={fieldClass(errors.passportNumber)}
            placeholder={t("placeholders.passportNumber")}
          />
          {errors.passportNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.passportNumber}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.passportExpiry")} *</label>
          <FalconDatePicker
            value={form.passportExpiry}
            onChange={(value) => updateField("passportExpiry", value)}
            error={errors.passportExpiry}
            placeholder={t("placeholders.selectDate")}
            minDate={today}
          />
          {errors.passportExpiry && (
            <p className="mt-1 text-xs text-red-600">{errors.passportExpiry}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.nationality")} *</label>
          <input
            type="text"
            value={form.nationality}
            onChange={(e) => updateField("nationality", e.target.value)}
            className={fieldClass(errors.nationality)}
            placeholder={t("placeholders.nationality")}
          />
          {errors.nationality && (
            <p className="mt-1 text-xs text-red-600">{errors.nationality}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.dateOfBirth")} *</label>
          <FalconDatePicker
            value={form.dateOfBirth}
            onChange={(value) => updateField("dateOfBirth", value)}
            error={errors.dateOfBirth}
            placeholder={t("placeholders.selectDate")}
            maxDate={today}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.arrivalDate")} *</label>
          <FalconDatePicker
            value={form.arrivalDate}
            onChange={(value) => updateField("arrivalDate", value)}
            error={errors.arrivalDate}
            placeholder={t("placeholders.selectDate")}
            minDate={today}
          />
          {errors.arrivalDate && (
            <p className="mt-1 text-xs text-red-600">{errors.arrivalDate}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.departureDate")} *</label>
          <FalconDatePicker
            value={form.departureDate}
            onChange={(value) => updateField("departureDate", value)}
            error={errors.departureDate}
            placeholder={t("placeholders.selectDate")}
            minDate={arrivalMinDate}
          />
          {errors.departureDate && (
            <p className="mt-1 text-xs text-red-600">{errors.departureDate}</p>
          )}
        </div>

        <div>
          <label className="font-poppins text-sm text-ink/70">{t("fields.emergencyContactName")} *</label>
          <input
            type="text"
            value={form.emergencyContactName}
            onChange={(e) => updateField("emergencyContactName", e.target.value)}
            className={fieldClass(errors.emergencyContactName)}
            placeholder={t("placeholders.emergencyContactName")}
          />
          {errors.emergencyContactName && (
            <p className="mt-1 text-xs text-red-600">{errors.emergencyContactName}</p>
          )}
        </div>

        <div>
          <label htmlFor="vip-emergency-phone" className="font-poppins text-sm text-ink/70">
            {t("fields.emergencyContactPhone")} *
          </label>
          <FalconPhoneInput
            id="vip-emergency-phone"
            value={form.emergencyContactPhone}
            onChange={(value) => updateField("emergencyContactPhone", value)}
            error={errors.emergencyContactPhone}
          />
          {errors.emergencyContactPhone && (
            <p className="mt-1 text-xs text-red-600">{errors.emergencyContactPhone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="font-poppins text-sm text-ink/70">{t("fields.specialRequirements")}</label>
          <textarea
            value={form.specialRequirements}
            onChange={(e) => updateField("specialRequirements", e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-ink/20 bg-white px-3 py-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 focus:border-falcon-deep"
            placeholder={t("placeholders.specialRequirements")}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={form.terms}
          onChange={(e) => updateField("terms", e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-ink/25"
        />
        <span>{t("termsLabel")}</span>
      </label>
      {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}

      <Button
        type="submit"
        variant="gold"
        className="w-full justify-between"
        textClassName="text-white flex-1"
        disabled={loading || checkingEmail || emailAlreadyRegistered}
      >
        {loading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

export function hasTicketBooking(userId: string) {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(sessionStorage.getItem(`${BOOKING_STORAGE_KEY}_${userId}`));
  } catch {
    return false;
  }
}
