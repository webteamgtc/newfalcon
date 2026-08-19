import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StoredPassportFile = {
  fileName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Bucket: string;
  uploadedAt: string;
};

const DEFAULT_BUCKET = "gtcfx-bucket";
const DEFAULT_PREFIX = "falcon-document";
const DEFAULT_REGION = "ap-southeast-1";
const PRESIGNED_URL_TTL_SECONDS = 60 * 60;

declare global {
  // eslint-disable-next-line no-var
  var _s3Client: S3Client | undefined;
}

export function getBucket() {
  return process.env.AWS_S3_BUCKET?.trim() || DEFAULT_BUCKET;
}

function getPrefix() {
  return process.env.AWS_S3_PASSPORT_PREFIX?.trim().replace(/\/$/, "") || DEFAULT_PREFIX;
}

function getRegion() {
  return process.env.AWS_REGION?.trim() || DEFAULT_REGION;
}

export function getS3Client() {
  if (!global._s3Client) {
    global._s3Client = new S3Client({
      region: getRegion(),
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  return global._s3Client;
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function fileExtension(fileName: string, mimeType: string) {
  const fromName = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "";
  if (fromName) return fromName;

  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function uploadPassportFile(
  file: File,
  ownerEmail: string,
  scope: "primary" | "guest" | "admin-passport" | "admin-visa" | "admin-eticket" | "admin-guest-passport" | "admin-guest-visa" | "admin-guest-eticket"
): Promise<StoredPassportFile> {
  const bucket = getBucket();
  const prefix = getPrefix();
  const emailSegment = sanitizePathSegment(ownerEmail.split("@")[0] || "user");
  const extension = fileExtension(file.name, file.type);
  const s3Key = `${prefix}/${emailSegment}/${Date.now()}-${scope}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        ownerEmail: ownerEmail.toLowerCase(),
        scope,
      },
    })
  );

  return {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    s3Key,
    s3Bucket: bucket,
    uploadedAt: new Date().toISOString(),
  };
}

export async function getPassportFileUrl(
  s3Key: string,
  expiresIn = PRESIGNED_URL_TTL_SECONDS
) {
  return getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: s3Key,
    }),
    { expiresIn }
  );
}

export function isStoredPassportFile(value: unknown): value is StoredPassportFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "s3Key" in value &&
    typeof (value as StoredPassportFile).s3Key === "string"
  );
}

export function isLegacyPassportFile(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof (value as { data?: string }).data === "string"
  );
}
