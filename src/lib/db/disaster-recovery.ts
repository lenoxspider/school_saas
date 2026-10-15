import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './index';

export interface BackupMetadata {
  backupId: string;
  timestamp: string;
  schemaVersion: string;
  schoolCount: number;
  studentCount: number;
  userCount: number;
  submissionCount: number;
  sha256Checksum: string;
  filePath: string;
}

const BACKUP_DIR = path.join(process.cwd(), '.backups');

/**
 * Creates a timestamped, checksum-verified backup of the complete multi-tenant database.
 */
export function createDatabaseBackup(): BackupMetadata {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const rawData = db.getRawData();
  const rawJson = JSON.stringify(rawData, null, 2);
  const checksum = crypto.createHash('sha256').update(rawJson).digest('hex');

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `backup_${timestampStr}_${checksum.substring(0, 8)}.json`;
  const backupFilePath = path.join(BACKUP_DIR, backupFilename);

  fs.writeFileSync(backupFilePath, rawJson, 'utf-8');

  const metadata: BackupMetadata = {
    backupId: `bk_${timestampStr}`,
    timestamp: new Date().toISOString(),
    schemaVersion: '1.0.0',
    schoolCount: rawData.schools.length,
    studentCount: rawData.students.length,
    userCount: rawData.users.length,
    submissionCount: rawData.submissions.length,
    sha256Checksum: checksum,
    filePath: backupFilePath,
  };

  const metaPath = path.join(BACKUP_DIR, `${backupFilename}.meta.json`);
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

  return metadata;
}

/**
 * Restores the database from a verified backup file after validating SHA-256 checksum.
 */
export function restoreDatabaseFromBackup(backupFilePath: string): {
  success: boolean;
  restoredRecordCounts: {
    schools: number;
    students: number;
    users: number;
    submissions: number;
  };
  durationMs: number;
} {
  const startTime = performance.now();

  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file not found at: ${backupFilePath}`);
  }

  const fileContent = fs.readFileSync(backupFilePath, 'utf-8');
  const calculatedChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');

  // Check metadata if exists
  const metaPath = `${backupFilePath}.meta.json`;
  if (fs.existsSync(metaPath)) {
    const meta: BackupMetadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    if (meta.sha256Checksum !== calculatedChecksum) {
      throw new Error(
        `Backup integrity violation: Checksum mismatch! Expected ${meta.sha256Checksum}, got ${calculatedChecksum}`
      );
    }
  }

  const parsedData = JSON.parse(fileContent);

  // Write directly to primary database storage file
  const DATA_FILE = path.join(process.cwd(), '.saas_db.json');
  fs.writeFileSync(DATA_FILE, JSON.stringify(parsedData, null, 2), 'utf-8');

  const durationMs = Math.round(performance.now() - startTime);

  return {
    success: true,
    restoredRecordCounts: {
      schools: parsedData.schools.length,
      students: parsedData.students.length,
      users: parsedData.users.length,
      submissions: parsedData.submissions.length,
    },
    durationMs,
  };
}
