"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { startOfDay } from "date-fns";
import Button from "@/components/Button";
import FalconDatePicker from "@/components/ui/FalconDatePicker";
import FalconPhoneInput, { isValidPhoneNumber } from "@/components/ui/FalconPhoneInput";
import { sendConfirmationEmail } from "@/lib/sendConfirmationEmail";
import type { VipUser } from "@/data/vipUsers";
import { useRouter } from "@/i18n/routing";


const BOOKING_STORAGE_KEY = "gfn_vip_ticket_booking";
const PASSPORT_EXAMPLE_SRC = "/images/passport.jpeg";
const ALLOWED_PASSPORT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const PASSPORT_FILE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,application/pdf,.pdf";

type InviteChoice = "" | "yes" | "no";
type BedroomPreference = "" | "single_bed" | "master_bed" | "extra_room";

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
  invitingGuest: InviteChoice;
  bedroomPreference: BedroomPreference;
  specialRequirements: string;
  terms: boolean;
};

type GuestFormState = {
  firstName: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
};

type FormErrors = Partial<
  Record<
    | keyof FormState
    | keyof GuestFormState
    | "passportPhoto"
    | "guestPassportPhoto"
    | "guestFirstName"
    | "guestEmail"
    | "guestPhone"
    | "guestPassportNumber"
    | "guestPassportExpiry"
    | "guestNationality",
    string
  >
>;

const emptyGuest: GuestFormState = {
  firstName: "",
  email: "",
  phone: "",
  passportNumber: "",
  passportExpiry: "",
  nationality: "",
};

function fieldClass(error?: string) {
  return `mt-2 h-12 w-full rounded-md border bg-white px-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 transition-colors focus:border-falcon-deep ${
    error ? "border-red-500" : "border-ink/20"
  }`;
}

function validatePhotoFile(file: File) {
  if (!ALLOWED_PASSPORT_TYPES.includes(file.type)) {
    return "type" as const;
  }
  return null;
}

function isPassportImage(file: File) {
  return file.type.startsWith("image/");
}

export default function VipTicketBookingForm({ user, onSuccess }: VipTicketBookingFormProps) {
  const t = useTranslations("vipPage.ticketBooking");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guestPassportPhoto, setGuestPassportPhoto] = useState<File | null>(null);
  const [guestPhotoPreview, setGuestPhotoPreview] = useState<string | null>(null);
  const [guest, setGuest] = useState<GuestFormState>(emptyGuest);
  const [form, setForm] = useState<FormState>({
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "",
    dateOfBirth: "",
    invitingGuest: "no",
    bedroomPreference: "single_bed",
    specialRequirements: "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(true);
  const today = useMemo(() => startOfDay(new Date()), []);
  const invitingGuest = form.invitingGuest === "yes";
  const router = useRouter();
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
      if (guestPhotoPreview) URL.revokeObjectURL(guestPhotoPreview);
    };
  }, [photoPreview, guestPhotoPreview]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "invitingGuest" && value === "no") {
        next.bedroomPreference = "";
        next.specialRequirements = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));

    if (key === "invitingGuest" && value === "no") {
      setGuest(emptyGuest);
      setGuestPassportPhoto(null);
      if (guestPhotoPreview) URL.revokeObjectURL(guestPhotoPreview);
      setGuestPhotoPreview(null);
      setErrors((prev) => ({
        ...prev,
        bedroomPreference: undefined,
        guestFirstName: undefined,
        guestEmail: undefined,
        guestPhone: undefined,
        guestPassportNumber: undefined,
        guestPassportExpiry: undefined,
        guestNationality: undefined,
        guestPassportPhoto: undefined,
      }));
    }
  };

  const updateGuestField = <K extends keyof GuestFormState>(key: K, value: GuestFormState[K]) => {
    setGuest((prev) => ({ ...prev, [key]: value }));
    const errorKey =
      key === "firstName"
        ? "guestFirstName"
        : key === "email"
          ? "guestEmail"
          : key === "phone"
            ? "guestPhone"
            : key === "passportNumber"
              ? "guestPassportNumber"
              : key === "passportExpiry"
                ? "guestPassportExpiry"
                : "guestNationality";
    setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    target: "primary" | "guest"
  ) => {
    const file = event.target.files?.[0];
    const errorKey = target === "primary" ? "passportPhoto" : "guestPassportPhoto";
    setErrors((prev) => ({ ...prev, [errorKey]: undefined }));

    if (!file) {
      if (target === "primary") {
        setPassportPhoto(null);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      } else {
        setGuestPassportPhoto(null);
        if (guestPhotoPreview) URL.revokeObjectURL(guestPhotoPreview);
        setGuestPhotoPreview(null);
      }
      return;
    }

    const photoError = validatePhotoFile(file);
    if (photoError === "type") {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: t("errors.passportPhotoType"),
      }));
      event.target.value = "";
      return;
    }

    const previewUrl = isPassportImage(file) ? URL.createObjectURL(file) : null;

    if (target === "primary") {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPassportPhoto(file);
      setPhotoPreview(previewUrl);
    } else {
      if (guestPhotoPreview) URL.revokeObjectURL(guestPhotoPreview);
      setGuestPassportPhoto(file);
      setGuestPhotoPreview(previewUrl);
    }
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
    if (!form.invitingGuest) nextErrors.invitingGuest = t("errors.invitingGuest");
    if (!passportPhoto) nextErrors.passportPhoto = t("errors.passportPhoto");
    if (!form.terms) nextErrors.terms = t("errors.terms");

    if (invitingGuest) {
      if (!form.bedroomPreference) {
        nextErrors.bedroomPreference = t("errors.bedroomPreference");
      }
      if (!guest.firstName.trim()) nextErrors.guestFirstName = t("errors.guestFirstName");
      if (!guest.email.trim()) {
        nextErrors.guestEmail = t("errors.guestEmail");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
        nextErrors.guestEmail = t("errors.guestEmailInvalid");
      }
      if (!guest.phone.trim()) {
        nextErrors.guestPhone = t("errors.guestPhone");
      } else if (!isValidPhoneNumber(guest.phone)) {
        nextErrors.guestPhone = t("errors.phoneInvalid");
      }
      if (!guest.passportNumber.trim()) {
        nextErrors.guestPassportNumber = t("errors.guestPassportNumber");
      }
      if (!guest.passportExpiry) nextErrors.guestPassportExpiry = t("errors.guestPassportExpiry");
      if (!guest.nationality.trim()) nextErrors.guestNationality = t("errors.guestNationality");
      if (!guestPassportPhoto) nextErrors.guestPassportPhoto = t("errors.guestPassportPhoto");
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
    if (invitingGuest && !guestPassportPhoto) return;

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
      payload.append("invitingGuest", form.invitingGuest);
      payload.append("specialRequirements", form.specialRequirements);
      payload.append("memberId", user.memberId);
      payload.append("userId", user.id);
      payload.append("ibId", user.ibId);
      payload.append("terms", String(form.terms));
      payload.append("passportPhoto", passportPhoto);

      if (invitingGuest && guestPassportPhoto) {
        payload.append("bedroomPreference", form.bedroomPreference);
        payload.append("guestFirstName", guest.firstName);
        payload.append("guestEmail", guest.email);
        payload.append("guestPhone", guest.phone);
        payload.append("guestPassportNumber", guest.passportNumber);
        payload.append("guestPassportExpiry", guest.passportExpiry);
        payload.append("guestNationality", guest.nationality);
        payload.append("guestPassportPhoto", guestPassportPhoto);
      }

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
            guest: invitingGuest ? guest : null,
            memberId: user.memberId,
            passportPhotoName: passportPhoto.name,
            submittedAt: new Date().toISOString(),
            mongoId: data.id,
          })
        );
      } catch {
        // ignore
      }

      await sendConfirmationEmail({
        email: form.email,
        first_name: form.fullName,
        formType: "vip_ticket_booking",
        referenceId: data.id,
        locale,
      });

      setSubmitted(true);
      toast.success(t("successMessage"));
      router.push(`/thank-you?email=${form.email}`);
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
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.fullName")} *</label>
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
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.email")} *</label>
          <input
            type="email"
            value={form.email}
            readOnly
            className={`${fieldClass(errors.email)} bg-ink/5`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="vip-phone" className="form-field-label font-poppins text-sm text-ink/70">
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
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.passportPhoto")} *</label>
          <div
            className={`mt-2 rounded-md border border-dashed bg-white p-4 ${
              errors.passportPhoto ? "border-red-500" : "border-ink/25"
            }`}
          >
            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div>
                <input
                  type="file"
                  accept={PASSPORT_FILE_ACCEPT}
                  onChange={(e) => handlePhotoChange(e, "primary")}
                  className="block w-full font-poppins text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-[#382910] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.12em] file:text-white"
                />
                <p className="mt-2 text-xs text-ink/55">{t("placeholders.passportPhoto")}</p>
                {/* {passportPhoto?.type === "application/pdf" ? (
                  <p className="mt-3 rounded-md border border-ink/15 bg-[#faf8f5] px-3 py-2 font-poppins text-sm text-ink/75">
                    {passportPhoto.name}
                  </p>
                ) : (
                  photoPreview && (
                    <img
                      src={photoPreview}
                      alt={t("fields.passportPhoto")}
                      className="mt-3 h-32 w-auto rounded-md border border-ink/15 object-cover"
                    />
                  )
                )} */}
              </div>
              <div className="flex flex-col items-end justify-end">
                <a
                  href={PASSPORT_EXAMPLE_SRC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                  aria-label={t("placeholders.passportExample")}
                >
                  <img
                    src={PASSPORT_EXAMPLE_SRC}
                    alt={t("placeholders.passportExample")}
                    className="h-28 w-28 cursor-pointer rounded-md border border-ink/15 object-contain"
                  />
                </a>
                <p className="mt-1 font-poppins text-[10px] font-normal tracking-[0.08em] text-ink/55">
                  {t("placeholders.passportExample")}
                </p>
              </div>
            </div>
          </div>
          {errors.passportPhoto && (
            <p className="mt-1 text-xs text-red-600">{errors.passportPhoto}</p>
          )}
        </div>

        <div>
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.passportNumber")} *</label>
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
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.passportExpiry")} *</label>
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
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.nationality")} *</label>
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
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.dateOfBirth")} *</label>
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

        <div className="md:col-span-2">
          <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.invitingGuest")} *</label>
          <select
            value={form.invitingGuest}
            onChange={(e) => updateField("invitingGuest", e.target.value as InviteChoice)}
            className={fieldClass(errors.invitingGuest)}
          >
            {/* <option value="">{t("placeholders.selectOption")}</option> */}
            <option value="no">{t("options.invitingGuestNo")}</option>
            <option value="yes">{t("options.invitingGuestYes")}</option>
          </select>
          {errors.invitingGuest && (
            <p className="mt-1 text-xs text-red-600">{errors.invitingGuest}</p>
          )}
        </div>

        {invitingGuest && (
          <div className="md:col-span-2 space-y-4 rounded-xl border border-[#382910]/15 bg-white/60 p-4 md:p-5">
            <div>
              <p className="font-display text-lg text-ink">{t("guestSection.title")}</p>
              <p className="mt-1 TextSmall !font-poppins !text-ink/65">{t("guestSection.description")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.guestFirstName")} *</label>
                <input
                  type="text"
                  value={guest.firstName}
                  onChange={(e) => updateGuestField("firstName", e.target.value)}
                  className={fieldClass(errors.guestFirstName)}
                  placeholder={t("placeholders.guestFirstName")}
                />
                {errors.guestFirstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestFirstName}</p>
                )}
              </div>

              <div>
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.guestEmail")} *</label>
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => updateGuestField("email", e.target.value)}
                  className={fieldClass(errors.guestEmail)}
                  placeholder={t("placeholders.guestEmail")}
                />
                {errors.guestEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="vip-guest-phone" className="form-field-label font-poppins text-sm text-ink/70">
                  {t("fields.guestPhone")} *
                </label>
                <FalconPhoneInput
                  id="vip-guest-phone"
                  value={guest.phone}
                  onChange={(value) => updateGuestField("phone", value)}
                  error={errors.guestPhone}
                />
                {errors.guestPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestPhone}</p>
                )}
              </div>

              <div>
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.guestPassportNumber")} *</label>
                <input
                  type="text"
                  value={guest.passportNumber}
                  onChange={(e) => updateGuestField("passportNumber", e.target.value.toUpperCase())}
                  className={fieldClass(errors.guestPassportNumber)}
                  placeholder={t("placeholders.passportNumber")}
                />
                {errors.guestPassportNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestPassportNumber}</p>
                )}
              </div>

              <div>
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.guestPassportExpiry")} *</label>
                <FalconDatePicker
                  value={guest.passportExpiry}
                  onChange={(value) => updateGuestField("passportExpiry", value)}
                  error={errors.guestPassportExpiry}
                  placeholder={t("placeholders.selectDate")}
                  minDate={today}
                />
                {errors.guestPassportExpiry && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestPassportExpiry}</p>
                )}
              </div>

              <div>
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.guestNationality")} *</label>
                <input
                  type="text"
                  value={guest.nationality}
                  onChange={(e) => updateGuestField("nationality", e.target.value)}
                  className={fieldClass(errors.guestNationality)}
                  placeholder={t("placeholders.nationality")}
                />
                {errors.guestNationality && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestNationality}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.guestPassportPhoto")} *</label>
                <div
                  className={`mt-2 rounded-md border border-dashed bg-white p-4 ${
                    errors.guestPassportPhoto ? "border-red-500" : "border-ink/25"
                  }`}
                >
                  <input
                    type="file"
                    accept={PASSPORT_FILE_ACCEPT}
                    onChange={(e) => handlePhotoChange(e, "guest")}
                    className="block w-full font-poppins text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-[#382910] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.12em] file:text-white"
                  />
                  <p className="mt-2 text-xs text-ink/55">{t("placeholders.passportPhoto")}</p>
                  {/* {guestPassportPhoto?.type === "application/pdf" ? (
                    <p className="mt-3 rounded-md border border-ink/15 bg-[#faf8f5] px-3 py-2 font-poppins text-sm text-ink/75">
                      {guestPassportPhoto.name}
                    </p>
                  ) : (
                    guestPhotoPreview && (
                      <img
                        src={guestPhotoPreview}
                        alt={t("fields.guestPassportPhoto")}
                        className="mt-3 h-32 w-auto rounded-md border border-ink/15 object-cover"
                      />
                    )
                  )} */}
                </div>
                {errors.guestPassportPhoto && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestPassportPhoto}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.bedroomPreference")} *</label>
                <select
                  value={form.bedroomPreference}
                  onChange={(e) =>
                    updateField("bedroomPreference", e.target.value as BedroomPreference)
                  }
                  className={fieldClass(errors.bedroomPreference)}
                >
                  <option value="single_bed">{t("options.singleBed")}</option>
                  <option value="master_bed">{t("options.masterBed")}</option>
                </select>
                {errors.bedroomPreference && (
                  <p className="mt-1 text-xs text-red-600">{errors.bedroomPreference}</p>
                )}
              </div>

              {/* <div className="md:col-span-2">
                <label className="form-field-label font-poppins text-sm text-ink/70">{t("fields.specialRequirements")}</label>
                <textarea
                  value={form.specialRequirements}
                  onChange={(e) => updateField("specialRequirements", e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-md border border-ink/20 bg-white px-3 py-3 font-poppins text-sm text-ink outline-none placeholder:text-ink/40 focus:border-falcon-deep"
                  placeholder={t("placeholders.specialRequirements")}
                />
              </div> */}
            </div>
          </div>
        )}
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
