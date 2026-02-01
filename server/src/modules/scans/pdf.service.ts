import PDFDocument from 'pdfkit';

interface PdfScanResult {
  category: string;
  checkName: string;
  severity: 'PASS' | 'INFO' | 'WARNING' | 'CRITICAL';
  value: string | null;
  expected: string | null;
  message: string;
  recommendation: string | null;
}

interface PdfScanData {
  id: string;
  overallScore: number | null;
  createdAt: Date | string;
  completedAt: Date | string | null;
  site: { name: string; url: string };
  results: PdfScanResult[];
}

const SEVERITY_LABELS: Record<string, string> = {
  PASS: 'PASS',
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

const CATEGORY_LABELS: Record<string, string> = {
  headers: 'En-tetes HTTP',
  ssl: 'SSL / TLS',
  owasp: 'OWASP',
  performance: 'Performance',
};

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function generateScanReportPDF(scan: PdfScanData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const score = scan.overallScore ?? 0;
      const grade = getGrade(score);
      const scanDate = new Date(scan.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // ── Header ─────────────────────────────────────────────────────
      doc.save();
      doc.rect(0, 0, doc.page.width, 80).fill('#1e293b');
      doc.restore();

      doc.font('Helvetica-Bold').fontSize(24).fillColor('#ffffff');
      doc.text('SecuriScan', 50, 28);

      doc.font('Helvetica').fontSize(10).fillColor('#94a3b8');
      doc.text('Rapport de securite', 200, 34);

      // ── Site info ──────────────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#1e293b');
      doc.text(scan.site.name, 50, 105);

      doc.font('Helvetica').fontSize(10).fillColor('#64748b');
      doc.text(scan.site.url, 50, 130);
      doc.text(`Scan du ${scanDate}`, 50, 145);

      // ── Score ──────────────────────────────────────────────────────
      const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

      doc.save();
      doc.roundedRect(400, 95, 145, 65, 8).lineWidth(2).strokeColor(scoreColor).stroke();
      doc.restore();

      doc.font('Helvetica-Bold').fontSize(32).fillColor(scoreColor);
      doc.text(`${score}`, 410, 105, { width: 80, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b');
      doc.text(`Grade ${grade}`, 495, 118);

      doc.font('Helvetica').fontSize(10).fillColor('#64748b');
      doc.text('/100', 410, 140, { width: 80, align: 'center' });

      // ── Summary ────────────────────────────────────────────────────
      const counts = { PASS: 0, INFO: 0, WARNING: 0, CRITICAL: 0 };
      for (const r of scan.results) counts[r.severity]++;

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e293b');
      doc.text('Resume', 50, 185);

      const summaryY = 205;
      const labels = [
        { label: `Reussi: ${counts.PASS}`, color: '#22c55e' },
        { label: `Info: ${counts.INFO}`, color: '#3b82f6' },
        { label: `Avertissement: ${counts.WARNING}`, color: '#f59e0b' },
        { label: `Critique: ${counts.CRITICAL}`, color: '#ef4444' },
      ];

      let sx = 50;
      for (const item of labels) {
        doc.save();
        doc.circle(sx + 5, summaryY + 5, 5).fill(item.color);
        doc.restore();
        doc.font('Helvetica').fontSize(10).fillColor('#1e293b');
        doc.text(item.label, sx + 15, summaryY);
        sx += 125;
      }

      // ── Results ────────────────────────────────────────────────────
      let y = summaryY + 30;

      const grouped: Record<string, PdfScanResult[]> = {};
      for (const r of scan.results) {
        if (!grouped[r.category]) grouped[r.category] = [];
        grouped[r.category].push(r);
      }

      const severityOrder: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2, PASS: 3 };
      for (const cat of Object.keys(grouped)) {
        grouped[cat].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));
      }

      for (const [category, results] of Object.entries(grouped)) {
        if (y > 700) { doc.addPage(); y = 50; }

        // Category header
        doc.save();
        doc.rect(50, y, doc.page.width - 100, 25).fill('#f1f5f9');
        doc.restore();

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e293b');
        doc.text(CATEGORY_LABELS[category] || category.toUpperCase(), 60, y + 7);
        y += 35;

        for (const result of results) {
          if (y > 700) { doc.addPage(); y = 50; }

          const sevColor = result.severity === 'PASS' ? '#22c55e'
            : result.severity === 'INFO' ? '#3b82f6'
            : result.severity === 'WARNING' ? '#f59e0b'
            : '#ef4444';

          // Severity dot
          doc.save();
          doc.circle(60, y + 5, 4).fill(sevColor);
          doc.restore();

          // Check name
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b');
          doc.text(result.checkName, 75, y, { width: 350, lineBreak: false });

          // Severity label
          doc.font('Helvetica-Bold').fontSize(9).fillColor(sevColor);
          doc.text(SEVERITY_LABELS[result.severity] || result.severity, 450, y);
          y += 16;

          // Message
          doc.font('Helvetica').fontSize(9).fillColor('#64748b');
          doc.text(result.message, 75, y, { width: 420 });
          const msgHeight = doc.heightOfString(result.message, { width: 420 });
          y += msgHeight + 4;

          // Value / Expected
          if (result.value || result.expected) {
            doc.font('Helvetica').fontSize(8).fillColor('#64748b');
            if (result.value) {
              doc.text(`Valeur: ${result.value}`, 75, y, { width: 200, lineBreak: false });
            }
            if (result.expected) {
              doc.text(`Attendu: ${result.expected}`, 280, y, { width: 200, lineBreak: false });
            }
            y += 14;
          }

          // Recommendation
          if (result.recommendation) {
            doc.font('Helvetica').fontSize(8).fillColor('#059669');
            doc.text(`Recommandation: ${result.recommendation}`, 75, y, { width: 420 });
            const recHeight = doc.heightOfString(`Recommandation: ${result.recommendation}`, { width: 420 });
            y += recHeight + 4;
          }

          y += 8;
        }
        y += 10;
      }

      // ── Footer ─────────────────────────────────────────────────────
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8');
      doc.text(
        `Genere par SecuriScan le ${new Date().toLocaleDateString('fr-FR')}`,
        50,
        doc.page.height - 40,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
