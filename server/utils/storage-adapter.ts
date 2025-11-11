/**
 * Local File Storage Adapter
 * Stores all uploads in the uploads/ directory
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
  if (!storageInstance) {
    storageInstance = new LocalStorageAdapter();
    console.log('✅ Using Local File Storage (uploads/ directory)');
  }
  return storageInstance;
}
