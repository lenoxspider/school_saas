import JSZip from 'jszip';
import { ResultSnapshot, School } from '@/types';
import { generateReportCardPdf } from './pdf-generator';

export async function generateBulkReportCardsZip(
  snapshots: ResultSnapshot[],
  school: School,
  className: string,
  termName: string
): Promise<Buffer> {
  const zip = new JSZip();
  const folderName = `${className.replace(/[^a-zA-Z0-9_-]/g, '_')}_${termName.replace(/[^a-zA-Z0-9_-]/g, '_')}_ReportCards`;
  const folder = zip.folder(folderName) || zip;

  for (let i = 0; i < snapshots.length; i++) {
    const snapshot = snapshots[i];
    const pdfBuffer = generateReportCardPdf(snapshot, school);

    // Deterministic naming: e.g. "001_ACC-2025-001_Emmanuel_Mensah.pdf"
    const prefix = String(i + 1).padStart(3, '0');
    const sanitizedName = snapshot.studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedAdm = snapshot.admissionNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${prefix}_${sanitizedAdm}_${sanitizedName}.pdf`;

    folder.file(filename, pdfBuffer);
  }

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return content;
}
