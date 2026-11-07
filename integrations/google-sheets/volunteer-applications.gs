/**
 * Creators Hub · Volunteer applications
 *
 * Paste this whole file into the Google Sheet's Apps Script editor
 * (Extensions → Apps Script). Setup steps are in README.md next to this file.
 *
 * Each application sent by the website:
 *   1. is added as a row on the "Applications" tab, and
 *   2. is emailed to the owner of this spreadsheet (you). No address is
 *      stored anywhere: Google sends it to the account that owns the script.
 */

const APPS = 'Applications'
const OVERVIEW = 'Overview'
const FIRST_DATA_ROW = 5
const ROWS = 1000

const C = {
  ink: '#0A0A0A',
  cream: '#F5F0E8',
  forest: '#1A4A3A',
  electric: '#00E5A0',
  white: '#FFFFFF',
  muted: '#6B6B66',
}
const DISPLAY_FONT = 'Space Grotesk'
const BODY_FONT = 'Inter'

const COLUMNS = [
  { title: 'Received', width: 150 },
  { title: 'Status', width: 120 },
  { title: 'Name', width: 180 },
  { title: 'Email', width: 220 },
  { title: 'First choice', width: 230 },
  { title: 'Department', width: 220 },
  { title: 'Level', width: 150 },
  { title: 'Second choice', width: 230 },
  { title: 'Describes them', width: 190 },
  { title: 'Field / course', width: 190 },
  { title: 'Experience', width: 280 },
  { title: 'Why volunteer', width: 320 },
  { title: 'Notes', width: 240 },
  { title: 'Submission ID', width: 130 },
]
const COL = Object.fromEntries(COLUMNS.map((c, i) => [c.title, i + 1]))

const STATUSES = [
  { name: 'New', bg: C.electric, fg: C.ink },
  { name: 'Reviewing', bg: '#FFF1CC', fg: '#6A4B00' },
  { name: 'Shortlisted', bg: '#D9EDE3', fg: C.forest },
  { name: 'Contacted', bg: '#E1E9F2', fg: '#24405E' },
  { name: 'Selected', bg: C.forest, fg: C.cream },
  { name: 'Not this time', bg: '#ECECEC', fg: '#77776F' },
]

/* ───────────────────────────── Menu ───────────────────────────── */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Creators Hub')
    .addItem('1. Set up this sheet', 'setUpSheet')
    .addItem('2. Show connection key', 'showConnectionKey')
    .addSeparator()
    .addItem('Send a test application', 'sendTestApplication')
    .addToUi()
}

/* ───────────────────────────── Website → sheet ───────────────────────────── */

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    const key = PropertiesService.getScriptProperties().getProperty('KEY')
    if (!key || body.key !== key) return reply({ ok: false, error: 'Wrong or missing connection key' })
    if (!body.application) return reply({ ok: false, error: 'No application' })
    const result = recordApplication(body.application)
    return reply({ ok: true, duplicate: result.duplicate })
  } catch (err) {
    console.error(err)
    return reply({ ok: false, error: String(err && err.message ? err.message : err) })
  } finally {
    lock.releaseLock()
  }
}

function doGet() {
  return reply({ ok: true, service: 'Creators Hub volunteer applications' })
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

/** Adds the row (once per submission) and emails the owner. */
function recordApplication(app) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(APPS)
  if (!sheet) {
    setUpSheet()
    sheet = ss.getSheetByName(APPS)
  }

  const id = text(app.submissionId)
  if (id && sheet.getLastRow() >= FIRST_DATA_ROW) {
    const found = sheet
      .getRange(FIRST_DATA_ROW, COL['Submission ID'], sheet.getLastRow() - FIRST_DATA_ROW + 1, 1)
      .createTextFinder(id)
      .matchEntireCell(true)
      .findNext()
    if (found) return { duplicate: true }
  }

  const received = app.submittedAt ? new Date(app.submittedAt) : new Date()
  const row = [
    isNaN(received.getTime()) ? new Date() : received,
    'New',
    safe(app.name),
    safe(app.email),
    safe(app.role),
    safe(app.department + (app.conditional ? ' (if confirmed)' : '')),
    safe(app.roleLevel),
    safe(app.second_role),
    safe(app.stage),
    safe(app.discipline),
    safe(app.experience),
    safe(app.message),
    '',
    safe(id),
  ]
  const at = Math.max(sheet.getLastRow() + 1, FIRST_DATA_ROW)
  sheet.getRange(at, 1, 1, row.length).setValues([row])

  try {
    emailOwner(app, ss.getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + at)
  } catch (err) {
    // The row is saved either way; a mail quota or permission issue shouldn't lose it.
    console.error('Email failed: ' + err)
  }
  return { duplicate: false }
}

/* ───────────────────────────── Email ───────────────────────────── */

function emailOwner(app, rowUrl) {
  const to = Session.getEffectiveUser().getEmail()
  if (!to) return
  const name = text(app.name) || 'Someone'
  const role = text(app.role) || 'a role'
  const details = [
    ['Email', text(app.email)],
    ['First choice', role],
    ['Department', text(app.department) + (app.conditional ? ' (only if the marketplace is confirmed)' : '')],
    ['Level', text(app.roleLevel)],
    ['Second choice', text(app.second_role) || 'None'],
    ['Describes them', text(app.stage) || 'Not given'],
    ['Field / course', text(app.discipline) || 'Not given'],
  ]
  const long = [
    ['Experience', text(app.experience) || 'Not given'],
    ['Why they want to volunteer', text(app.message) || 'Not given'],
  ]

  const rows = details
    .map(
      ([k, v]) =>
        '<tr><td style="padding:10px 0;border-top:1px solid #E6DFD3;color:' + C.muted + ';font-size:13px;width:150px;vertical-align:top">' +
        esc(k) +
        '</td><td style="padding:10px 0;border-top:1px solid #E6DFD3;color:' + C.ink + ';font-size:15px">' +
        esc(v) +
        '</td></tr>',
    )
    .join('')
  const blocks = long
    .map(
      ([k, v]) =>
        '<p style="margin:24px 0 6px;color:' + C.muted + ';font-size:12px;letter-spacing:.12em;text-transform:uppercase">' +
        esc(k) +
        '</p><p style="margin:0;color:' + C.ink + ';font-size:15px;line-height:1.6;white-space:pre-wrap">' +
        esc(v) +
        '</p>',
    )
    .join('')
  const replyHref = 'mailto:' + encodeURIComponent(text(app.email)) + '?subject=' + encodeURIComponent('Creators Hub 001: your volunteer application')

  const html =
    '<div style="background:' + C.cream + ';padding:32px 12px;font-family:Inter,Helvetica,Arial,sans-serif">' +
    '<div style="max-width:600px;margin:0 auto;background:' + C.white + ';border-radius:6px;overflow:hidden">' +
    '<div style="background:' + C.ink + ';padding:28px 32px">' +
    '<p style="margin:0;color:' + C.electric + ';font-size:11px;letter-spacing:.18em;text-transform:uppercase">● Creators Hub 001 · Volunteer Collective</p>' +
    '<h1 style="margin:14px 0 0;color:' + C.cream + ';font-family:\'Space Grotesk\',Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;line-height:1.2">' +
    esc(name) +
    '</h1>' +
    '<p style="margin:8px 0 0;color:#BDB6AA;font-size:15px">applied for <span style="color:' + C.cream + '">' + esc(role) + '</span></p>' +
    '</div>' +
    '<div style="padding:8px 32px 32px">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin-top:16px">' + rows + '</table>' +
    blocks +
    '<div style="margin-top:32px">' +
    '<a href="' + replyHref + '" style="display:inline-block;background:' + C.electric + ';color:' + C.ink + ';text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px">Reply to ' + esc(name.split(' ')[0]) + '</a>' +
    '<a href="' + esc(rowUrl) + '" style="display:inline-block;margin-left:12px;color:' + C.forest + ';font-size:14px;padding:12px 4px">Open in the sheet →</a>' +
    '</div></div>' +
    '<div style="background:' + C.forest + ';padding:14px 32px;color:#CFE3D9;font-size:12px">Saved to your volunteer applications sheet with the status “New”.</div>' +
    '</div></div>'

  const plain =
    name + ' applied for ' + role + '\n\n' +
    details.concat(long).map(([k, v]) => k + ': ' + v).join('\n') +
    '\n\nOpen in the sheet: ' + rowUrl

  MailApp.sendEmail({
    to: to,
    subject: 'New volunteer: ' + name + ' · ' + role,
    htmlBody: html,
    body: plain,
    name: 'Creators Hub Volunteers',
    replyTo: isEmail(app.email) ? text(app.email) : undefined,
  })
}

/* ───────────────────────────── Setup ───────────────────────────── */

function setUpSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  ss.setSpreadsheetTimeZone('Africa/Lagos')
  if (/^Untitled/i.test(ss.getName())) ss.rename('Creators Hub 001 · Volunteer Applications')

  let sheet = ss.getSheetByName(APPS)
  if (!sheet) {
    const blank = ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0 ? ss.getSheets()[0] : null
    sheet = blank ? blank.setName(APPS) : ss.insertSheet(APPS, 0)
  }
  styleApplications(sheet)
  styleOverview(ss)
  ss.setActiveSheet(sheet)
  getOrCreateKey()

  try {
    SpreadsheetApp.getUi().alert(
      'Your sheet is ready',
      'Next: Creators Hub → Show connection key, then follow the steps in the README to connect the website.',
      SpreadsheetApp.getUi().ButtonSet.OK,
    )
  } catch (e) {
    // Run from the editor: no dialog available.
  }
}

function styleApplications(sheet) {
  const n = COLUMNS.length
  if (sheet.getMaxColumns() > n) sheet.deleteColumns(n + 1, sheet.getMaxColumns() - n)
  if (sheet.getMaxColumns() < n) sheet.insertColumnsAfter(sheet.getMaxColumns(), n - sheet.getMaxColumns())
  if (sheet.getMaxRows() < ROWS) sheet.insertRowsAfter(sheet.getMaxRows(), ROWS - sheet.getMaxRows())
  sheet.setHiddenGridlines(true)
  sheet.setTabColor(C.electric)

  // Title band. Not merged: Sheets can't freeze columns through a merged cell,
  // so the text simply overflows to the right.
  const band = sheet.getRange(1, 1, 3, n)
  band.breakApart().setBackground(C.ink).setFontColor(C.cream).setFontFamily(DISPLAY_FONT)
  band.setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW)
  sheet.getRange(3, 1, 1, n).setBackground(C.forest)
  sheet
    .getRange(1, 1)
    .setValue('Volunteer applications')
    .setFontSize(22)
    .setFontWeight('bold')
    .setVerticalAlignment('bottom')
  sheet
    .getRange(2, 1)
    .setValue('●  CREATORS HUB 001 · THE FIRST ROOM')
    .setFontColor(C.electric)
    .setFontSize(9)
    .setFontWeight('bold')
    .setVerticalAlignment('top')
  sheet.setRowHeight(1, 56)
  sheet.setRowHeight(2, 30)
  sheet.setRowHeight(3, 4)

  // Header row
  sheet
    .getRange(4, 1, 1, n)
    .setValues([COLUMNS.map((c) => c.title.toUpperCase())])
    .setBackground(C.forest)
    .setFontColor(C.cream)
    .setFontFamily(DISPLAY_FONT)
    .setFontSize(9)
    .setFontWeight('bold')
    .setVerticalAlignment('middle')
  sheet.setRowHeight(4, 36)
  COLUMNS.forEach((c, i) => sheet.setColumnWidth(i + 1, c.width))
  sheet.setFrozenRows(4)
  sheet.setFrozenColumns(3)

  // Data area
  const dataRows = sheet.getMaxRows() - FIRST_DATA_ROW + 1
  const data = sheet.getRange(FIRST_DATA_ROW, 1, dataRows, n)
  data
    .setFontFamily(BODY_FONT)
    .setFontSize(10)
    .setFontColor(C.ink)
    .setVerticalAlignment('middle')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
  sheet.setRowHeightsForced(FIRST_DATA_ROW, dataRows, 34)
  sheet.getRange(FIRST_DATA_ROW, COL['Received'], dataRows, 1).setNumberFormat('d mmm yyyy, h:mm am/pm').setFontColor(C.muted)
  sheet.getRange(FIRST_DATA_ROW, COL['Name'], dataRows, 1).setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, COL['Status'], dataRows, 1).setHorizontalAlignment('center').setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, COL['Submission ID'], dataRows, 1).setFontColor('#A8A8A0').setFontSize(8)

  // Alternating rows
  sheet.getBandings().forEach((b) => b.remove())
  sheet
    .getRange(4, 1, sheet.getMaxRows() - 3, n)
    .applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, true, false)
    .setHeaderRowColor(C.forest)
    .setFirstRowColor(C.white)
    .setSecondRowColor('#FAF7F1')

  // Status dropdown and colours
  const statusRange = sheet.getRange(FIRST_DATA_ROW, COL['Status'], dataRows, 1)
  statusRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(STATUSES.map((s) => s.name), true)
      .setAllowInvalid(false)
      .build(),
  )
  const levelRange = sheet.getRange(FIRST_DATA_ROW, COL['Level'], dataRows, 1)
  const rules = STATUSES.map((s) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(s.name)
      .setBackground(s.bg)
      .setFontColor(s.fg)
      .setRanges([statusRange])
      .build(),
  ).concat([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Beginners welcome').setFontColor('#1F7A57').setRanges([levelRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Experience preferred').setFontColor('#6A4B00').setRanges([levelRange]).build(),
  ])
  sheet.setConditionalFormatRules(rules)

  // Filter on the header row
  const existing = sheet.getFilter()
  if (existing) existing.remove()
  sheet.getRange(4, 1, sheet.getMaxRows() - 3, n).createFilter()
}

function styleOverview(ss) {
  let sheet = ss.getSheetByName(OVERVIEW)
  if (!sheet) sheet = ss.insertSheet(OVERVIEW, 1)
  sheet.clear()
  sheet.clearConditionalFormatRules()
  if (sheet.getMaxColumns() > 8) sheet.deleteColumns(9, sheet.getMaxColumns() - 8)
  sheet.setHiddenGridlines(true)
  sheet.setTabColor(C.forest)
  sheet.getRange(1, 1, sheet.getMaxRows(), 8).setFontFamily(BODY_FONT).setFontColor(C.ink).setBackground(C.cream)
  ;[24, 260, 160, 24, 260, 160, 24, 24].forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  const a = "'" + APPS + "'!"
  const last = String(ROWS)
  sheet.getRange('A1:H3').setBackground(C.ink)
  sheet.getRange('B1:F1').merge().setValue('Overview').setFontFamily(DISPLAY_FONT).setFontSize(22).setFontWeight('bold').setFontColor(C.cream).setVerticalAlignment('bottom')
  sheet.getRange('B2:F2').merge().setValue('●  VOLUNTEER COLLECTIVE · UPDATES AUTOMATICALLY').setFontSize(9).setFontWeight('bold').setFontColor(C.electric).setFontFamily(DISPLAY_FONT)
  sheet.setRowHeight(1, 56)
  sheet.setRowHeight(2, 30)
  sheet.setRowHeight(3, 10)

  // Headline numbers
  const stats = [
    ['Applications', '=COUNTA(' + a + 'C5:C' + last + ')'],
    ['New, not yet reviewed', '=COUNTIF(' + a + 'B5:B' + last + ',"New")'],
    ['Shortlisted', '=COUNTIF(' + a + 'B5:B' + last + ',"Shortlisted")'],
    ['Selected', '=COUNTIF(' + a + 'B5:B' + last + ',"Selected")'],
  ]
  stats.forEach(([label, formula], i) => {
    const r = 5 + i
    sheet.getRange(r, 2).setValue(label).setFontColor(C.muted)
    sheet.getRange(r, 3).setFormula(formula).setFontFamily(DISPLAY_FONT).setFontSize(18).setFontWeight('bold').setHorizontalAlignment('right')
    sheet.setRowHeight(r, 38)
  })
  sheet.getRange('B5:C8').setBorder(null, null, true, null, null, true, '#E1D9CB', SpreadsheetApp.BorderStyle.SOLID)

  // Tables
  const table = (row, col, title, formula) => {
    sheet.getRange(row, col, 1, 2).merge().setValue(title.toUpperCase()).setFontFamily(DISPLAY_FONT).setFontSize(9).setFontWeight('bold').setFontColor(C.forest)
    sheet.getRange(row + 1, col).setFormula(formula)
    sheet.getRange(row + 1, col, 1, 2).setBackground(C.forest).setFontColor(C.cream).setFontWeight('bold').setFontSize(9)
    sheet.getRange(row + 2, col + 1, 40, 1).setHorizontalAlignment('right').setFontWeight('bold')
  }
  table(11, 2, 'Applicants by role',
    '=IFERROR(QUERY(' + a + 'E5:E' + last + ',"select E, count(E) where E <> \'\' group by E order by count(E) desc label E \'Role\', count(E) \'Applicants\'",0),"No applications yet")')
  table(11, 5, 'Applicants by department',
    '=IFERROR(QUERY(' + a + 'F5:F' + last + ',"select F, count(F) where F <> \'\' group by F order by count(F) desc label F \'Department\', count(F) \'Applicants\'",0),"No applications yet")')
  table(24, 5, 'By status',
    '=IFERROR(QUERY(' + a + 'B5:B' + last + ',"select B, count(B) where B <> \'\' group by B order by count(B) desc label B \'Status\', count(B) \'Applicants\'",0),"No applications yet")')
  table(34, 5, 'Who is applying',
    '=IFERROR(QUERY(' + a + 'I5:I' + last + ',"select I, count(I) where I <> \'\' group by I order by count(I) desc label I \'Describes them\', count(I) \'Applicants\'",0),"No applications yet")')
}

/* ───────────────────────────── Key & test ───────────────────────────── */

function getOrCreateKey() {
  const props = PropertiesService.getScriptProperties()
  let key = props.getProperty('KEY')
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '')
    props.setProperty('KEY', key)
  }
  return key
}

function showConnectionKey() {
  const key = getOrCreateKey()
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.5">' +
      '<p>Copy this key into Netlify as <b>VOLUNTEER_SHEET_KEY</b>. Keep it private.</p>' +
      '<textarea readonly onclick="this.select()" style="width:100%;height:64px;font-family:monospace;font-size:12px">' + key + '</textarea>' +
      '</div>',
  )
    .setWidth(460)
    .setHeight(170)
  SpreadsheetApp.getUi().showModalDialog(html, 'Connection key')
}

function sendTestApplication() {
  recordApplication({
    name: 'Test Applicant',
    email: 'test@example.com',
    role: 'Speaker Liaison',
    department: 'Speaker & Programme Support',
    roleLevel: 'Beginners welcome',
    conditional: false,
    second_role: 'Programme Timekeeper',
    stage: 'Student',
    discipline: 'Film & storytelling',
    experience: 'None yet. This is a test row: delete it whenever you like.',
    message: 'Checking that applications reach the sheet and my inbox.',
    submittedAt: new Date().toISOString(),
    submissionId: 'test-' + Date.now(),
  })
  try {
    SpreadsheetApp.getUi().alert('Test sent', 'A test row was added and an email is on its way to you.', SpreadsheetApp.getUi().ButtonSet.OK)
  } catch (e) {}
}

/* ───────────────────────────── Helpers ───────────────────────────── */

function text(v) {
  return v == null ? '' : String(v).trim()
}

/** Stops a cell from being read as a formula (e.g. a name starting with "="). */
function safe(v) {
  const s = text(v)
  return /^[=+\-@]/.test(s) ? "'" + s : s
}

function esc(v) {
  return text(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(v))
}
