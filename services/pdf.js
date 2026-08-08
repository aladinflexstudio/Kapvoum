/**
 * services/pdf.js
 * Génération du rapport PDF Kapvoum via PDFKit.
 * STATUT : squelette. Contenu réel à écrire une fois le fournisseur VIN
 * choisi (les vraies données à afficher dépendent du format ClearVin vs
 * Vehicle Databases).
 */

const PDFDocument = require('pdfkit');

/**
 * @returns {PDFDocument} un flux PDF à pipe() vers un fichier ou une réponse HTTP
 */
function generateReportPdf(reportData) {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(20).text('KAPVOUM — Rapò Ofisyèl', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`VIN: ${reportData.vin}`);
  doc.moveDown();

  if (reportData.kapScore) {
    doc.fontSize(16).text(`KapScore: ${reportData.kapScore.score}/10 — ${reportData.kapScore.verdict.kr}`);
  }
  if (reportData.indiceHaiti) {
    doc.fontSize(16).text(`Indice Haïti: ${reportData.indiceHaiti.score}/10 — ${reportData.indiceHaiti.verdict.kr}`);
  }

  doc.moveDown();
  doc.fontSize(9).fillColor('gray').text(
    'Rapò sa baze sou done ofisyèl NMVTIS ak NHTSA. Kapvoum pa responsab pou ' +
    'done ki pa rapòte bay otoritè ameriken yo. Toujou fè yon enspeksyon ' +
    'fizik anvan ou achte.'
  );

  // TODO : mise en page complète une fois le fournisseur choisi et le
  // texte disclaimer NMVTIS exact obtenu (CLAUDE.md piège #5).

  doc.end();
  return doc;
}

module.exports = { generateReportPdf };
