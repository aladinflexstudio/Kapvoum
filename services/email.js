/**
 * services/email.js
 * Envoi du rapport PDF par email via Resend.
 * STATUT : squelette — RESEND_API_KEY pas encore configurée.
 */

async function sendReportEmail({ to, vehicleName, pdfBuffer }) {
  if (!process.env.RESEND_API_KEY) {
    const err = new Error('RESEND_API_KEY manquante — service email non configuré.');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  // TODO une fois Resend connecté :
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'rapports@kapvoum.com',
  //   to,
  //   subject: `Rapò Kapvoum ou — ${vehicleName}`,
  //   attachments: [{ filename: 'rapport.pdf', content: pdfBuffer }],
  // });

  throw new Error('Service email non implémenté — squelette uniquement.');
}

module.exports = { sendReportEmail };
