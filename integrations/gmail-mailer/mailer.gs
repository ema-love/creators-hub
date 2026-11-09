/**
 * Creators Hub · Ticket mailer
 *
 * Sends each attendee their registration confirmation and ticket from the
 * Creators Hub Gmail account. Create this script while signed in to THAT
 * account only: emails are sent from whichever account owns the script.
 *
 * Paste this whole file into a new project at script.google.com.
 * Setup steps are in README.md next to this file.
 */

const SENDER_NAME = 'Creators Hub'
/** How long a sent email's ID is remembered, so retries never send twice (Google's maximum is 6 hours). */
const REMEMBER_SECONDS = 6 * 60 * 60

/* ───────────────────────────── Website → email ───────────────────────────── */

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    const key = PropertiesService.getScriptProperties().getProperty('KEY')
    if (!key || b.key !== key) return reply({ ok: false, error: 'Wrong or missing connection key' })
    if (!isEmail(b.to) || !text(b.subject) || !(text(b.html) || text(b.text))) return reply({ ok: false, error: 'Incomplete email' })

    const id = text(b.idempotencyKey).slice(0, 200)
    const cache = CacheService.getScriptCache()
    if (id && cache.get('sent:' + id)) return reply({ ok: true, duplicate: true })

    // Gmail allows about 100 of these a day; the website retries the rest later.
    if (MailApp.getRemainingDailyQuota() < 1) return reply({ ok: false, error: 'quota' })

    MailApp.sendEmail({
      to: text(b.to),
      subject: text(b.subject).slice(0, 250),
      htmlBody: text(b.html),
      body: text(b.text),
      name: SENDER_NAME,
    })
    if (id) cache.put('sent:' + id, '1', REMEMBER_SECONDS)
    return reply({ ok: true })
  } catch (err) {
    console.error(err)
    return reply({ ok: false, error: String(err && err.message ? err.message : err) })
  } finally {
    lock.releaseLock()
  }
}

function doGet() {
  return reply({ ok: true, service: 'Creators Hub ticket mailer' })
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

/* ───────────────────────────── Run these from the editor ───────────────────────────── */

/** Step 1: creates the connection key and shows it in the Execution log. */
function setUp() {
  const key = getOrCreateKey()
  Logger.log('Connection key (copy into Netlify as GMAIL_MAILER_KEY, keep it private):')
  Logger.log(key)
  Logger.log('Emails will be sent from: ' + Session.getEffectiveUser().getEmail())
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota())
}

/** Step 2: sends a sample email to this account, to check it works. */
function sendTestEmail() {
  const me = Session.getEffectiveUser().getEmail()
  MailApp.sendEmail({
    to: me,
    subject: 'Creators Hub mailer: test',
    htmlBody:
      '<div style="font-family:Arial,sans-serif;background:#0A0A0A;color:#F5F0E8;padding:28px;border-radius:8px">' +
      '<p style="color:#00E5A0;font-size:12px;letter-spacing:.15em;margin:0">CREATORS HUB</p>' +
      '<h1 style="font-weight:500;margin:12px 0">The mailer works.</h1>' +
      '<p style="margin:0">Ticket confirmations will be sent from this account as “' + SENDER_NAME + '”.</p></div>',
    body: 'The mailer works. Ticket confirmations will be sent from this account as "' + SENDER_NAME + '".',
    name: SENDER_NAME,
  })
  Logger.log('Test email sent to ' + me + '. Emails left today: ' + MailApp.getRemainingDailyQuota())
}

/** Shows the connection key again. */
function showConnectionKey() {
  Logger.log(getOrCreateKey())
}

/** How many more emails this account can send today. */
function checkDailyLimit() {
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota())
}

/* ───────────────────────────── Helpers ───────────────────────────── */

function getOrCreateKey() {
  const props = PropertiesService.getScriptProperties()
  let key = props.getProperty('KEY')
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '')
    props.setProperty('KEY', key)
  }
  return key
}

function text(v) {
  return v == null ? '' : String(v).trim()
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(v))
}
