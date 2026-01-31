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

const SEVERITY_COLORS: Record<string, string> = {
  PASS: '#22c55e',
  INFO: '#3b82f6',
  WARNING: '#f59e0b',
  CRITICAL: '#ef4444',
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
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
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

    // ── Header ───────────────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill('#1e293b');

    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#ffffff')
      .text('SecuriScan', 50, 28);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#94a3b8')
      .text('Rapport de securite', 200, 34);

    // ── Site info ────────────────────────────────────────────────────
    doc
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(scan.site.name, 50, 105);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#64748b')
      .text(scan.site.url, 50, 130)
      .text(`Scan du ${scanDate}`, 50, 145);

    // ── Score box ────────────────────────────────────────────────────
    const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

    doc
      .roundedRect(400, 95, 145, 65, 8)
      .lineWidth(2)
      .strokeColor(scoreColor)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(32)
      .fillColor(scoreColor)
      .text(`${score}`, 410, 102, { width: 80, align: 'center' });

    doc
      .fontSize(12)
      .fillColor('#64748b')
      .text(`Grade ${grade}`, 490, 118);

    doc
      .fontSize(10)
      .text('/100', 410, 138, { width: 80, align: 'center' });

    // ── Summary counts ───────────────────────────────────────────────
    const counts = { PASS: 0, INFO: 0, WARNING: 0, CRITICAL: 0 };
    for (const r of scan.results) {
      counts[r.severity]++;
    }

    let summaryY = 185;
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#1e293b')
      .text('Resume', 50, summaryY);

    summaryY += 20;
    const summaryItems = [
      { label: 'Reussi', count: counts.PASS, color: SEVERITY_COLORS.PASS },
      { label: 'Info', count: counts.INFO, color: SEVERITY_COLORS.INFO },
      { label: 'Avertissement', count: counts.WARNING, color: SEVERITY_COLORS.WARNING },
      { label: 'Critique', count: counts.CRITICAL, color: SEVERITY_COLORS.CRITICAL },
    ];

    let sx = 50;
    for (const item of summaryItems) {
      doc.circle(sx + 5, summaryY + 5, 5).fill(item.color);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#1e293b')
        .text(`${item.label}: ${item.count}`, sx + 15, summaryY);
      sx += 120;
    }

    // ── Results by category ──────────────────────────────────────────
    let y = summaryY + 35;

    // Group results by category
    const grouped: Record<string, PdfScanResult[]> = {};
    for (const r of scan.results) {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    }

    // Sort within each group: CRITICAL first, then WARNING, INFO, PASS
    const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2, PASS: 3 };
    for (const cat of Object.keys(grouped)) {
      grouped[cat].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    for (const [category, results] of Object.entries(grouped)) {
      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      // Category header
      doc
        .rect(50, y, doc.page.width - 100, 25)
        .fill('#f1f5f9');

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1e293b')
        .text(CATEGORY_LABELS[category] || category.toUpperCase(), 60, y + 6);

      y += 35;

      for (const result of results) {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }

        // Severity indicator
        const sevColor = SEVERITY_COLORS[result.severity] || '#6b7280';
        doc.circle(60, y + 5, 4).fill(sevColor);

        // Check name + severity
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#1e293b')
          .text(result.checkName, 75, y, { width: 350 });

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(sevColor)
          .text(result.severity, 450, y);

        y += 15;

        // Message
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#64748b')
          .text(result.message, 75, y, { width: 420 });

        y += doc.heightOfString(result.message, { width: 420 }) + 5;

        // Value / Expected
        if (result.value || result.expected) {
          if (result.value) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#64748b')
              .text(`Valeur: ${result.value}`, 75, y, { width: 200 });
          }
          if (result.expected) {
            doc
              .text(`Attendu: ${result.expected}`, 280, y, { width: 200 });
          }
          y += 12;
        }

        // Recommendation
        if (result.recommendation) {
          doc
            .font('Helvetica-Oblique')
            .fontSize(8)
            .fillColor('#059669')
            .text(`Recommandation: ${result.recommendation}`, 75, y, { width: 420 });
          y += doc.heightOfString(`Recommandation: ${result.recommendation}`, { width: 420 }) + 5;
        }

        y += 8;
      }

      y += 10;
    }

    // ── Footer ───────────────────────────────────────────────────────
    const footerY = doc.page.height - 40;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(
        `Genere par SecuriScan le ${new Date().toLocaleDateString('fr-FR')} — securiscan-client.vercel.app`,
        50,
        footerY,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc.end();
  });
}
