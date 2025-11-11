/**
 * Storage Adapter - Works on both Replit and regular servers
 * Falls back to local filesystem if Replit Object Storage is not available
 */

import fs from 'fs/promises';
import path from 'path';

interface UploadResult {
  ok: boolean;
  error?: string;
}

interface StorageAdapter {
  uploadFromBytes(filepath: string, buffer: Buffer, options?: { contentType?: string }): Promise<UploadResult>;
  delete(filepath: string): Promise<void>;
  getPublicUrl(filepath: string): string;
}

class ReplitStorageAdapter implements StorageAdapter {
  private client: any;

  constructor() {
    // Dynamically import only if available
    try {
      const { Client } = require('@replit/object-storage');
      this.client = new Client();
    } catch (error) {
      throw new Error('Replit Object Storage not available');
    }
  }

  async uploadFromBytes(filepath: string, buffer: Buffer, options?: { contentType?: string }): Promise<UploadResult> {
    return await this.client.uploadFromBytes(filepath, buffer, options as any);
  }

  async delete(filepath: string): Promise<void> {
    await this.client.delete(filepath);
  }

  getPublicUrl(filepath: string): string {
    return filepath; // Replit serves directly from storage paths
  }
}

class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor() {
    // Store uploads in a local directory
    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  async uploadFromBytes(filepath: string, buffer: Buffer, options?: { contentType?: string }): Promise<UploadResult> {
    try {
      const fullPath = path.join(this.uploadDir, filepath);
      const dirPath = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, buffer);

      return { ok: true };
    } catch (error) {
      console.error('Local storage upload error:', error);
      return { ok: false, error: String(error) };
    }
  }

  async delete(filepath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filepath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Local storage delete error:', error);
      // Don't throw - file might not exist
    }
  }

  getPublicUrl(filepath: string): string {
    // Return URL path that will be served by Express static middleware
    return `/uploads/${filepath}`;
  }
}

// Singleton instance
let storageInstance: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (storageInstance) {
    return storageInstance;
  }

  // Try Replit Object Storage first
  try {
    storageInstance = new ReplitStorageAdapter();
    console.log('✅ Using Replit Object Storage');
  } catch (error) {
    // Fall back to local filesystem
    storageInstance = new LocalStorageAdapter();
    console.log('✅ Using Local File Storage (uploads/ directory)');
  }

  return storageInstance;
}

export function isReplitStorage(): boolean {
  return storageInstance instanceof ReplitStorageAdapter;
}
