/**
 * Small provider-neutral file storage adapter.
 *
 * Local storage is intentionally the default for development and self-hosted
 * Docker deployments. The database stores only the provider, bucket, and key
 * so an object-storage adapter can be added without changing domain records.
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../../config';

function safeKey(storageKey: string): string {
  const normalized = path.posix.normalize(storageKey).replace(/^\/+/, '');
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error('Invalid storage key');
  }
  return normalized;
}

function localPath(storageKey: string): string {
  return path.resolve(config.storage.localDir, safeKey(storageKey));
}

export function createStorageKey(prefix: string, originalName: string): string {
  const extension = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  return `${prefix}/${crypto.randomUUID()}${extension}`;
}

export async function putFile(storageKey: string, content: Buffer): Promise<void> {
  if (config.storage.provider !== 'local') {
    throw new Error(`Unsupported file storage provider: ${config.storage.provider}`);
  }

  const destination = localPath(storageKey);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, content, { flag: 'wx' });
}

export async function readFile(storageKey: string): Promise<Buffer> {
  if (config.storage.provider !== 'local') {
    throw new Error(`Unsupported file storage provider: ${config.storage.provider}`);
  }
  return fs.readFile(localPath(storageKey));
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (config.storage.provider !== 'local') {
    throw new Error(`Unsupported file storage provider: ${config.storage.provider}`);
  }
  await fs.rm(localPath(storageKey), { force: true });
}
