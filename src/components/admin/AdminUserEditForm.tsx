"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AdminRegistrationRecord } from "@/lib/adminRegistration";
import {
  TICKET_STATUS_OPTIONS,
  VISA_STATUS_OPTIONS,
} from "@/lib/adminRegistration";
import { SHOW_VISA_SECTION } from "@/lib/featureFlags";

function fieldClass() {
  return "mt-2 h-11 w-full rounded-md border border-ink/20 bg-white px-3 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep";
}

function textareaClass() {
  return "mt-2 min-h-[88px] w-full rounded-md border border-ink/20 bg-white px-3 py-2 font-poppins text-sm text-ink outline-none transition-colors focus:border-falcon-deep";
}

function labelClass(required?: boolean) {
  return `form-field-label font-poppins text-xs uppercase tracking-[0.08em] text-ink/55${required ? " after:ml-0.5 after:text-red-500 after:content-['*']" : ""}`;
}

function buildDocumentUrl(registrationId: string, s3Key?: string) {
  if (!s3Key) return "";
  return `/api/admin/document?id=${encodeURIComponent(registrationId)}&s3Key=${encodeURIComponent(s3Key)}`;
}

type Props = {
  registration: AdminRegistrationRecord;
  onClose: () => void;
  onSaved: (registration: AdminRegistrationRecord) => void;
};

export default function AdminUserEditForm({ registration, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    phone: registration.phone,
    country: registration.country,
    address: registration.address,
    existingPartner: registration.existingPartner,
    partnerId: registration.partnerId,
    passportNumber: registration.passportNumber,
    passportExpiry: registration.passportExpiry,
    qualified: registration.qualified,
    visaStatus: registration.visaStatus ?? "",
    visaRejectionReason: registration.visaRejectionReason ?? "",
    ticketStatus: registration.ticketStatus ?? "",
    airline: registration.airline ?? "",
    flightNumber: registration.flightNumber ?? "",
    departureDateTime: registration.departureDateTime ?? "",
    returnDateTime: registration.returnDateTime ?? "",
    hotelName: registration.hotelName ?? "",
    hotelAddress: registration.hotelAddress ?? "",
    hotelFloor: registration.hotelFloor ?? "",
    hotelRoomNumber: registration.hotelRoomNumber ?? "",
    checkInDateTime: registration.checkInDateTime ?? "",
    checkOutDateTime: registration.checkOutDateTime ?? "",
    hotelConfirmationNumber: registration.hotelConfirmationNumber ?? "",
    pickupDetails: registration.pickupDetails ?? "",
    dropOffDetails: registration.dropOffDetails ?? "",
  });

  const [guestForm, setGuestForm] = useState({
    guestFirstName: registration.guest?.firstName ?? "",
    guestLastName: registration.guest?.lastName ?? "",
    guestEmail: registration.guest?.email ?? "",
    guestPhone: registration.guest?.phone ?? "",
    guestCountry: registration.guest?.country ?? "",
    guestPassportNumber: registration.guest?.passportNumber ?? "",
    guestPassportExpiry: registration.guest?.passportExpiry ?? "",
    guestQualified: registration.guest?.qualified ?? "",
    guestVisaStatus: registration.guest?.visaStatus ?? "",
    guestVisaRejectionReason: registration.guest?.visaRejectionReason ?? "",
    guestTicketStatus: registration.guest?.ticketStatus ?? "",
  });

  const [passportCopy, setPassportCopy] = useState<File | null>(null);
  const [visaDocument, setVisaDocument] = useState<File | null>(null);
  const [eTicket, setETicket] = useState<File | null>(null);
  const [guestPassportCopy, setGuestPassportCopy] = useState<File | null>(null);
  const [guestVisaDocument, setGuestVisaDocument] = useState<File | null>(null);
  const [guestETicket, setGuestETicket] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      country: registration.country,
      address: registration.address,
      existingPartner: registration.existingPartner,
      partnerId: registration.partnerId,
      passportNumber: registration.passportNumber,
      passportExpiry: registration.passportExpiry,
      qualified: registration.qualified,
      visaStatus: registration.visaStatus ?? "",
      visaRejectionReason: registration.visaRejectionReason ?? "",
      ticketStatus: registration.ticketStatus ?? "",
      airline: registration.airline ?? "",
      flightNumber: registration.flightNumber ?? "",
      departureDateTime: registration.departureDateTime ?? "",
      returnDateTime: registration.returnDateTime ?? "",
      hotelName: registration.hotelName ?? "",
      hotelAddress: registration.hotelAddress ?? "",
      hotelFloor: registration.hotelFloor ?? "",
      hotelRoomNumber: registration.hotelRoomNumber ?? "",
      checkInDateTime: registration.checkInDateTime ?? "",
      checkOutDateTime: registration.checkOutDateTime ?? "",
      hotelConfirmationNumber: registration.hotelConfirmationNumber ?? "",
      pickupDetails: registration.pickupDetails ?? "",
      dropOffDetails: registration.dropOffDetails ?? "",
    });
    setGuestForm({
      guestFirstName: registration.guest?.firstName ?? "",
      guestLastName: registration.guest?.lastName ?? "",
      guestEmail: registration.guest?.email ?? "",
      guestPhone: registration.guest?.phone ?? "",
      guestCountry: registration.guest?.country ?? "",
      guestPassportNumber: registration.guest?.passportNumber ?? "",
      guestPassportExpiry: registration.guest?.passportExpiry ?? "",
      guestQualified: registration.guest?.qualified ?? "",
      guestVisaStatus: registration.guest?.visaStatus ?? "",
      guestVisaRejectionReason: registration.guest?.visaRejectionReason ?? "",
      guestTicketStatus: registration.guest?.ticketStatus ?? "",
    });
    setPassportCopy(null);
    setVisaDocument(null);
    setETicket(null);
    setGuestPassportCopy(null);
    setGuestVisaDocument(null);
    setGuestETicket(null);
    setError("");
    setSuccess("");
  }, [registration]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateGuestField(key: keyof typeof guestForm, value: string) {
    setGuestForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (registration.hasGuest) {
        Object.entries(guestForm).forEach(([key, value]) => payload.append(key, value));
      }
      if (passportCopy) payload.append("passportCopy", passportCopy);
      if (visaDocument) payload.append("visaDocument", visaDocument);
      if (eTicket) payload.append("eTicket", eTicket);
      if (guestPassportCopy) payload.append("guestPassportCopy", guestPassportCopy);
      if (guestVisaDocument) payload.append("guestVisaDocument", guestVisaDocument);
      if (guestETicket) payload.append("guestETicket", guestETicket);

      const response = await fetch(`/api/admin/registrations/${registration.id}`, {
        method: "PATCH",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to save changes");
        return;
      }

      setSuccess("Changes saved successfully");
      onSaved(data.registration);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const passportUrl = buildDocumentUrl(
    registration.id,
    registration.passportCopy?.s3Key
  );
  const visaUrl = buildDocumentUrl(registration.id, registration.visaDocument?.s3Key);
  const eTicketUrl = buildDocumentUrl(registration.id, registration.eTicket?.s3Key);
  const guestPassportUrl = buildDocumentUrl(
    registration.id,
    registration.guest?.passportCopy?.s3Key
  );
  const guestVisaUrl = buildDocumentUrl(
    registration.id,
    registration.guest?.visaDocument?.s3Key
  );
  const guestETicketUrl = buildDocumentUrl(
    registration.id,
    registration.guest?.eTicket?.s3Key
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-ink/40 p-0 sm:p-4">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <p className="font-poppins text-xs uppercase tracking-[0.1em] text-ink/50">
              Edit registration
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink">
              {registration.registrationFullName || registration.email}
            </h2>
            <p className="mt-1 font-poppins text-sm text-ink/60">{registration.registrationEmail}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/15 px-3 py-1 font-poppins text-xs uppercase tracking-[0.08em] text-ink/70 hover:bg-ink/5"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            <section>
              <h3 className="font-display text-xl text-ink">Personal details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass(true)}>First name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass(true)}>Last name</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass(true)}>Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass(true)}>Phone number</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass(true)}>Country</label>
                  <input
                    required
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass(true)}>Address</label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className={textareaClass()}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-display text-xl text-ink">Partner & qualification</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass(true)}>Existing partner</label>
                  <select
                    required
                    value={form.existingPartner}
                    onChange={(e) => updateField("existingPartner", e.target.value)}
                    className={fieldClass()}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass(true)}>Partner ID / Referral code</label>
                  <input
                    required
                    value={form.partnerId}
                    onChange={(e) => updateField("partnerId", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass(true)}>Qualified</label>
                  <select
                    required
                    value={form.qualified}
                    onChange={(e) => updateField("qualified", e.target.value)}
                    className={fieldClass()}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-display text-xl text-ink">Passport</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass(true)}>Passport number</label>
                  <input
                    required
                    value={form.passportNumber}
                    onChange={(e) => updateField("passportNumber", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass(true)}>Passport expiry date</label>
                  <input
                    required
                    type="date"
                    value={form.passportExpiry}
                    onChange={(e) => updateField("passportExpiry", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass(true)}>Passport copy upload</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setPassportCopy(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full font-poppins text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-falcon-deep file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.08em] file:text-white"
                  />
                  {registration.passportCopy?.fileName && (
                    <p className="mt-2 font-poppins text-xs text-ink/55">
                      Current: {registration.passportCopy.fileName}
                    </p>
                  )}
                  {passportUrl && registration.passportCopy?.mimeType?.startsWith("image/") && (
                    <img
                      src={passportUrl}
                      alt="Passport copy"
                      className="mt-3 max-h-48 rounded-lg border border-ink/10 object-contain"
                    />
                  )}
                </div>
              </div>
            </section>

            {SHOW_VISA_SECTION && (
            <section>
              <h3 className="font-display text-xl text-ink">Visa</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass()}>Visa status</label>
                  <select
                    value={form.visaStatus}
                    onChange={(e) => updateField("visaStatus", e.target.value)}
                    className={fieldClass()}
                  >
                    <option value="">Select</option>
                    {VISA_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass()}>Visa document upload</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setVisaDocument(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full font-poppins text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-falcon-deep file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.08em] file:text-white"
                  />
                  {registration.visaDocument?.fileName && (
                    <p className="mt-2 font-poppins text-xs text-ink/55">
                      Current: {registration.visaDocument.fileName}
                    </p>
                  )}
                  {visaUrl && (
                    <a
                      href={visaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-poppins text-xs text-falcon-deep underline"
                    >
                      View visa document
                    </a>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass()}>Visa rejection reason</label>
                  <textarea
                    value={form.visaRejectionReason}
                    onChange={(e) => updateField("visaRejectionReason", e.target.value)}
                    className={textareaClass()}
                  />
                </div>
              </div>
            </section>
            )}

            <section>
              <h3 className="font-display text-xl text-ink">Ticket & travel</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass()}>Ticket status</label>
                  <select
                    value={form.ticketStatus}
                    onChange={(e) => updateField("ticketStatus", e.target.value)}
                    className={fieldClass()}
                  >
                    <option value="">Select</option>
                    {TICKET_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass()}>E-ticket upload</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setETicket(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full font-poppins text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-falcon-deep file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.08em] file:text-white"
                  />
                  {registration.eTicket?.fileName && (
                    <p className="mt-2 font-poppins text-xs text-ink/55">
                      Current: {registration.eTicket.fileName}
                    </p>
                  )}
                  {eTicketUrl && (
                    <a
                      href={eTicketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-poppins text-xs text-falcon-deep underline"
                    >
                      View e-ticket
                    </a>
                  )}
                </div>
                <div>
                  <label className={labelClass()}>Airline</label>
                  <input
                    value={form.airline}
                    onChange={(e) => updateField("airline", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Flight number</label>
                  <input
                    value={form.flightNumber}
                    onChange={(e) => updateField("flightNumber", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Departure date & time</label>
                  <input
                    type="datetime-local"
                    value={form.departureDateTime}
                    onChange={(e) => updateField("departureDateTime", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Return date & time</label>
                  <input
                    type="datetime-local"
                    value={form.returnDateTime}
                    onChange={(e) => updateField("returnDateTime", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-display text-xl text-ink">Hotel & transport</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass()}>Hotel name</label>
                  <input
                    value={form.hotelName}
                    onChange={(e) => updateField("hotelName", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Hotel confirmation number</label>
                  <input
                    value={form.hotelConfirmationNumber}
                    onChange={(e) => updateField("hotelConfirmationNumber", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass()}>Hotel address</label>
                  <textarea
                    value={form.hotelAddress}
                    onChange={(e) => updateField("hotelAddress", e.target.value)}
                    className={textareaClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Floor</label>
                  <input
                    value={form.hotelFloor}
                    onChange={(e) => updateField("hotelFloor", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Room number</label>
                  <input
                    value={form.hotelRoomNumber}
                    onChange={(e) => updateField("hotelRoomNumber", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Check-in date & time</label>
                  <input
                    type="datetime-local"
                    value={form.checkInDateTime}
                    onChange={(e) => updateField("checkInDateTime", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Check-out date & time</label>
                  <input
                    type="datetime-local"
                    value={form.checkOutDateTime}
                    onChange={(e) => updateField("checkOutDateTime", e.target.value)}
                    className={fieldClass()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass()}>Pickup details</label>
                  <textarea
                    value={form.pickupDetails}
                    onChange={(e) => updateField("pickupDetails", e.target.value)}
                    className={textareaClass()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass()}>Drop-off details</label>
                  <textarea
                    value={form.dropOffDetails}
                    onChange={(e) => updateField("dropOffDetails", e.target.value)}
                    className={textareaClass()}
                  />
                </div>
              </div>
            </section>

            {registration.hasGuest && registration.guest && (
              <section className="rounded-xl border border-falcon-deep/20 bg-[#FFFDF8] p-5">
                <h3 className="font-display text-xl text-ink">Guest details & status</h3>
                <p className="mt-1 font-poppins text-sm text-ink/55">
                  Manage qualification, visa, and ticket status for the invited guest.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass()}>Guest first name</label>
                    <input
                      value={guestForm.guestFirstName}
                      onChange={(e) => updateGuestField("guestFirstName", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Guest last name</label>
                    <input
                      value={guestForm.guestLastName}
                      onChange={(e) => updateGuestField("guestLastName", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Guest email</label>
                    <input
                      type="email"
                      value={guestForm.guestEmail}
                      onChange={(e) => updateGuestField("guestEmail", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Guest phone</label>
                    <input
                      value={guestForm.guestPhone}
                      onChange={(e) => updateGuestField("guestPhone", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Guest country</label>
                    <input
                      value={guestForm.guestCountry}
                      onChange={(e) => updateGuestField("guestCountry", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Guest qualified</label>
                    <select
                      value={guestForm.guestQualified}
                      onChange={(e) => updateGuestField("guestQualified", e.target.value)}
                      className={fieldClass()}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Guest passport number</label>
                    <input
                      value={guestForm.guestPassportNumber}
                      onChange={(e) => updateGuestField("guestPassportNumber", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className={labelClass()}>Guest passport expiry</label>
                    <input
                      type="date"
                      value={guestForm.guestPassportExpiry}
                      onChange={(e) => updateGuestField("guestPassportExpiry", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass()}>Guest passport copy</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setGuestPassportCopy(e.target.files?.[0] ?? null)}
                      className="mt-2 block w-full font-poppins text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-falcon-deep file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.08em] file:text-white"
                    />
                    {registration.guest.passportCopy?.fileName && (
                      <p className="mt-2 font-poppins text-xs text-ink/55">
                        Current: {registration.guest.passportCopy.fileName}
                      </p>
                    )}
                    {guestPassportUrl && (
                      <a
                        href={guestPassportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-poppins text-xs text-falcon-deep underline"
                      >
                        View guest passport
                      </a>
                    )}
                  </div>
                  {SHOW_VISA_SECTION && (
                    <>
                      <div>
                        <label className={labelClass()}>Guest visa status</label>
                        <select
                          value={guestForm.guestVisaStatus}
                          onChange={(e) => updateGuestField("guestVisaStatus", e.target.value)}
                          className={fieldClass()}
                        >
                          <option value="">Select</option>
                          {VISA_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className={labelClass()}>Guest ticket status</label>
                    <select
                      value={guestForm.guestTicketStatus}
                      onChange={(e) => updateGuestField("guestTicketStatus", e.target.value)}
                      className={fieldClass()}
                    >
                      <option value="">Select</option>
                      {TICKET_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {SHOW_VISA_SECTION && (
                    <div className="md:col-span-2">
                      <label className={labelClass()}>Guest visa document</label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => setGuestVisaDocument(e.target.files?.[0] ?? null)}
                        className="mt-2 block w-full font-poppins text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-falcon-deep file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.08em] file:text-white"
                      />
                      {registration.guest.visaDocument?.fileName && (
                        <p className="mt-2 font-poppins text-xs text-ink/55">
                          Current: {registration.guest.visaDocument.fileName}
                        </p>
                      )}
                      {guestVisaUrl && (
                        <a
                          href={guestVisaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block font-poppins text-xs text-falcon-deep underline"
                        >
                          View guest visa document
                        </a>
                      )}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className={labelClass()}>Guest e-ticket</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setGuestETicket(e.target.files?.[0] ?? null)}
                      className="mt-2 block w-full font-poppins text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-falcon-deep file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.08em] file:text-white"
                    />
                    {registration.guest.eTicket?.fileName && (
                      <p className="mt-2 font-poppins text-xs text-ink/55">
                        Current: {registration.guest.eTicket.fileName}
                      </p>
                    )}
                    {guestETicketUrl && (
                      <a
                        href={guestETicketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-poppins text-xs text-falcon-deep underline"
                      >
                        View guest e-ticket
                      </a>
                    )}
                  </div>
                  {SHOW_VISA_SECTION && (
                    <div className="md:col-span-2">
                      <label className={labelClass()}>Guest visa rejection reason</label>
                      <textarea
                        value={guestForm.guestVisaRejectionReason}
                        onChange={(e) =>
                          updateGuestField("guestVisaRejectionReason", e.target.value)
                        }
                        className={textareaClass()}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {error && (
            <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 font-poppins text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-poppins text-sm text-emerald-800">
              {success}
            </p>
          )}

          <div className="mt-8 flex gap-3 border-t border-ink/10 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-falcon-deep px-6 py-3 font-poppins text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/20 px-6 py-3 font-poppins text-xs uppercase tracking-[0.1em] text-ink/70 hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
