import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 S3-Compatible Storage Client
 *
 * Requirements in .env.local:
 * - CLOUDFLARE_ACCOUNT_ID
 * - CLOUDFLARE_R2_ACCESS_KEY_ID
 * - CLOUDFLARE_R2_SECRET_ACCESS_KEY
 * - CLOUDFLARE_R2_BUCKET_NAME
 * - NEXT_PUBLIC_R2_PUBLIC_URL (Optional, for public assets like avatars / gallery)
 */

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (r2ClientInstance) return r2ClientInstance;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const customEndpoint = process.env.CLOUDFLARE_R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 credentials (CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY) are not set in environment variables."
    );
  }

  let endpoint =
    customEndpoint ||
    (accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : undefined);

  if (endpoint) {
    // Cloudflare dashboard displays "S3 API: https://<account_id>.r2.cloudflarestorage.com/<bucket_name>"
    // If the user pastes that, strip the trailing /<bucket_name> and any trailing slash
    endpoint = endpoint.replace(/\/+$/, "");
    const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
    if (bucket && endpoint.toLowerCase().endsWith(`/${bucket.toLowerCase()}`)) {
      endpoint = endpoint.substring(0, endpoint.length - bucket.length - 1);
    }
  }

  if (!endpoint) {
    throw new Error(
      "Cloudflare R2 requires either CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_R2_ENDPOINT in environment variables."
    );
  }

  r2ClientInstance = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2ClientInstance;
}

export const R2_BUCKET_NAME =
  process.env.CLOUDFLARE_R2_BUCKET_NAME || "brotherhood-portal";

/**
 * Upload a file directly from server
 */
export async function uploadToR2(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<{ key: string; url: string }> {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );

  return {
    key: params.key,
    url: getR2PublicUrl(params.key),
  };
}

/**
 * Generate a Presigned Upload URL so the client browser can upload directly to R2
 */
export async function getR2PresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a Presigned Download URL for private files (e.g. KTP, SIM, Struk Transfer)
 */
export async function getR2PresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete an object from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const cleanKey = decodeURIComponent(key).replace(/^\/+/, "");

  // 1. Delete by direct key
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: cleanKey,
    })
  );

  // 2. If the key starts with the bucket name (legacy prefix), also delete without prefix
  if (R2_BUCKET_NAME && cleanKey.startsWith(`${R2_BUCKET_NAME}/`)) {
    const unprefix = cleanKey.replace(new RegExp(`^${R2_BUCKET_NAME}/`), "");
    await client
      .send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: unprefix,
        })
      )
      .catch(() => null);
  }
}

/**
 * List objects from R2
 */
export async function listR2Objects(prefix?: string) {
  const client = getR2Client();
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
  });
  const response = await client.send(command);
  return response.Contents || [];
}

/**
 * Reset client instance (useful if environment variables are modified)
 */
export function resetR2ClientInstance() {
  r2ClientInstance = null;
}

/**
 * Get Public CDN / Domain URL for public files
 */
export function getR2PublicUrl(key: string): string {
  let publicBase =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim().replace(/\/+$/, "") || "";
  if (!publicBase) {
    return `/api/storage/${key}`;
  }
  if (!publicBase.startsWith("http://") && !publicBase.startsWith("https://")) {
    publicBase = `https://${publicBase}`;
  }
  const cleanKey = key.replace(/^\/+/, "");
  return `${publicBase}/${cleanKey}`;
}
