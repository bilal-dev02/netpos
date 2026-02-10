// src/lib/server/paths.ts
import path from 'path';

/**
 * Get the base data directory for the application
 * In production Electron app, this will be the user data directory
 * In development or web mode, this will be the current working directory
 */
export function getDataBasePath(): string {
  return process.env.USER_DATA_PATH || process.cwd();
}

/**
 * Get the uploads directory path
 */
export function getUploadsPath(...segments: string[]): string {
  return path.join(getDataBasePath(), 'uploads', ...segments);
}

/**
 * Get the database path
 */
export function getDatabasePath(): string {
  return path.join(getDataBasePath(), 'netpos.db');
}
