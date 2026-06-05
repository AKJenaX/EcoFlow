import PDFDocument from 'pdfkit';

const BRAND_GREEN = '#1a3a2a';
const ACCENT = '#84cc16';

/**
 * Generate a CSV string from an array of objects.
 * @param {object[]} data
 * @param {string[]} fields  — ordered list of keys to include
 * @returns {string}
 */
export function generateCSV(data, fields) {
  if (!data || data.length === 0) return fields.join(',') + '\n';

  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const header = fields.join(',');
  const rows = data.map((row) => fields.map((f) => escape(row[f])).join(','));
  return [header, ...rows].join('\n');
}

/**
 * Generate a PDF buffer using pdfkit.
 * @param {string} title
 * @param {object[]} rows
 * @param {string[]} columns  — keys to use from each row object
 * @returns {Promise<Buffer>}
 */
export function generatePDF(title, rows, columns) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header banner ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 70).fill(BRAND_GREEN);
    doc
      .fillColor(ACCENT)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('EcoFlow', 40, 18);
    doc
      .fillColor('#ffffff')
      .fontSize(11)
      .font('Helvetica')
      .text('Smart Waste Management Platform', 40, 44);

    doc.moveDown(3);

    // ── Report title & timestamp ──────────────────────────────────
    doc
      .fillColor(BRAND_GREEN)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(title, { align: 'left' });
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}  (IST)`, { align: 'left' });
    doc.moveDown(1);

    if (!rows || rows.length === 0) {
      doc.fillColor('#94a3b8').fontSize(11).text('No data available for the selected range.');
      doc.end();
      return;
    }

    // ── Table ─────────────────────────────────────────────────────
    const usableWidth = doc.page.width - 80;
    const colWidth = usableWidth / columns.length;
    const rowHeight = 22;
    let y = doc.y;

    // Header row
    doc.rect(40, y, usableWidth, rowHeight).fill(BRAND_GREEN);
    columns.forEach((col, i) => {
      doc
        .fillColor('#ffffff')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(col.toUpperCase(), 44 + i * colWidth, y + 6, { width: colWidth - 4, ellipsis: true });
    });
    y += rowHeight;

    // Data rows
    rows.forEach((row, rowIdx) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }
      const bg = rowIdx % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.rect(40, y, usableWidth, rowHeight).fill(bg);
      columns.forEach((col, i) => {
        doc
          .fillColor('#1e293b')
          .fontSize(8)
          .font('Helvetica')
          .text(String(row[col] ?? '—'), 44 + i * colWidth, y + 7, { width: colWidth - 4, ellipsis: true });
      });
      // Bottom border
      doc.moveTo(40, y + rowHeight).lineTo(40 + usableWidth, y + rowHeight).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      y += rowHeight;
    });

    // ── Footer ────────────────────────────────────────────────────
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .text(`EcoFlow — ${rows.length} records exported`, 40, doc.page.height - 30, { align: 'center' });

    doc.end();
  });
}
