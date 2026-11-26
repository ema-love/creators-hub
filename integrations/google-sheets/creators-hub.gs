/**
 * Creators Hub · Registrations and volunteer applications
 *
 * Paste this whole file into the Google Sheet's Apps Script editor
 * (Extensions → Apps Script). Setup steps are in README.md next to this file.
 *
 * The website sends two kinds of record:
 *   - Registrations (in person and online): added as a row on the
 *     "Registrations" tab, with an Attendance column.
 *   - Volunteer applications: added to the "Volunteers" tab and emailed to
 *     the owner of this spreadsheet (you). No address is stored anywhere:
 *     Google sends it to the account that owns the script.
 *     Applications made with the earlier form stay on the "Applications" tab.
 */

const REGS = 'Registrations'
const VOLS = 'Volunteers'
const APPS = 'Applications' // earlier volunteer form; kept as it was
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

/** The current volunteer form (six teams). */
const VOL_COLUMNS = [
  { title: 'Received', width: 150 },
  { title: 'Status', width: 120 },
  { title: 'Name', width: 180 },
  { title: 'Email', width: 220 },
  { title: 'Phone / WhatsApp', width: 170 },
  { title: 'First choice', width: 240 },
  { title: 'Second choice', width: 240 },
  { title: 'In person / online', width: 170 },
  { title: 'Briefing', width: 100 },
  { title: 'Experience / links', width: 320 },
  { title: 'Team level', width: 220 },
  { title: 'Notes', width: 240 },
  { title: 'Submission ID', width: 130 },
]
const VOL = Object.fromEntries(VOL_COLUMNS.map((c, i) => [c.title, i + 1]))

const REG_COLUMNS = [
  { title: 'Registered', width: 160 },
  { title: 'Ticket ID', width: 130 },
  { title: 'Name', width: 200 },
  { title: 'Email', width: 250 },
  { title: 'Creative arm', width: 190 },
  { title: 'Notes', width: 260 },
  { title: 'Reference', width: 190 },
  // Added with the online option. New columns go at the end so existing rows stay lined up.
  { title: 'Attendance', width: 130 },
  { title: 'City / country', width: 180 },
]
const REG = Object.fromEntries(REG_COLUMNS.map((c, i) => [c.title, i + 1]))

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
    .addItem('Send a test registration', 'sendTestRegistration')
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
    if (body.kind === 'registration') {
      if (!body.registration) return reply({ ok: false, error: 'No registration' })
      const saved = recordRegistration(body.registration)
      return reply({ ok: true, duplicate: saved.duplicate })
    }
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

/** Adds a ticket registration (once per ticket). No email: there can be hundreds. */
function recordRegistration(r) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(REGS)
  if (!sheet) {
    setUpSheet()
    sheet = ss.getSheetByName(REGS)
  }
  const ticketId = text(r.ticketId)
  if (ticketId && sheet.getLastRow() >= FIRST_DATA_ROW) {
    const found = sheet
      .getRange(FIRST_DATA_ROW, REG['Ticket ID'], sheet.getLastRow() - FIRST_DATA_ROW + 1, 1)
      .createTextFinder(ticketId)
      .matchEntireCell(true)
      .findNext()
    if (found) return { duplicate: true }
  }
  const at = r.registeredAt ? new Date(r.registeredAt) : new Date()
  const row = [
    isNaN(at.getTime()) ? new Date() : at,
    safe(ticketId),
    safe(r.name),
    safe(r.email),
    safe(r.arm),
    '',
    safe(r.ref),
    safe(r.attendance || 'In person'),
    safe(r.location),
  ]
  const next = Math.max(sheet.getLastRow() + 1, FIRST_DATA_ROW)
  sheet.getRange(next, 1, 1, row.length).setValues([row])
  return { duplicate: false }
}

/** Adds the row (once per submission) to the Volunteers tab and emails the owner. */
function recordApplication(app) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(VOLS)
  if (!sheet) {
    setUpSheet()
    sheet = ss.getSheetByName(VOLS)
  }

  const id = text(app.submissionId)
  if (id && sheet.getLastRow() >= FIRST_DATA_ROW) {
    const found = sheet
      .getRange(FIRST_DATA_ROW, VOL['Submission ID'], sheet.getLastRow() - FIRST_DATA_ROW + 1, 1)
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
    // Kept as text so a leading + or 0 isn't lost.
    "'" + text(app.phone),
    safe(text(app.team) + (app.conditional ? ' (subject to confirmation)' : '')),
    safe(app.second_team),
    safe(app.attendance),
    safe(app.briefing),
    safe(app.experience),
    safe(app.teamLevel),
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
  const role = text(app.team) || 'a team'
  const details = [
    ['Email', text(app.email)],
    ['Phone / WhatsApp', text(app.phone)],
    ['First choice', role + (app.conditional ? ' (subject to confirmation)' : '')],
    ['Team level', text(app.teamLevel)],
    ['Second choice', text(app.second_team) || 'None'],
    ['In person / online', text(app.attendance)],
    ['Can attend briefing', text(app.briefing) || 'Not given'],
  ]
  const long = [['Experience or links', text(app.experience) || 'Not given']]

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
  const digits = text(app.phone).replace(/[^0-9]/g, '').replace(/^0/, '234')
  const whatsapp = digits.length >= 8 ? 'https://wa.me/' + digits : ''

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
    '<a href="' + replyHref + '" style="display:inline-block;background:' + C.electric + ';color:' + C.ink + ';text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px">Email ' + esc(name.split(' ')[0]) + '</a>' +
    (whatsapp ? '<a href="' + esc(whatsapp) + '" style="display:inline-block;margin-left:12px;color:' + C.forest + ';font-size:14px;padding:12px 4px">WhatsApp →</a>' : '') +
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
  if (/^Untitled/i.test(ss.getName()) || /Volunteer Applications$/.test(ss.getName())) ss.rename('Creators Hub 001')

  const sheets = ss.getSheets()
  const blank = sheets.length === 1 && sheets[0].getLastRow() === 0 && !ss.getSheetByName(REGS) && !ss.getSheetByName(VOLS) ? sheets[0] : null

  let regs = ss.getSheetByName(REGS)
  if (!regs) regs = blank ? blank.setName(REGS) : ss.insertSheet(REGS, 0)
  let vols = ss.getSheetByName(VOLS)
  if (!vols) vols = ss.insertSheet(VOLS, 1)

  styleRegistrations(regs)
  styleVolunteers(vols)
  // The earlier volunteer form's tab, if this sheet has one: restyled, never deleted.
  const apps = ss.getSheetByName(APPS)
  if (apps) styleApplications(apps)
  styleOverview(ss)
  ss.setActiveSheet(regs)
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

/** Title band, header row, column widths, banding and filter, shared by both data tabs. */
function styleTable(sheet, title, subtitle, columns, frozenCols) {
  const n = columns.length
  if (sheet.getMaxColumns() > n) sheet.deleteColumns(n + 1, sheet.getMaxColumns() - n)
  if (sheet.getMaxColumns() < n) sheet.insertColumnsAfter(sheet.getMaxColumns(), n - sheet.getMaxColumns())
  if (sheet.getMaxRows() < ROWS) sheet.insertRowsAfter(sheet.getMaxRows(), ROWS - sheet.getMaxRows())
  sheet.setHiddenGridlines(true)

  // Title band. Not merged: Sheets can't freeze columns through a merged cell.
  const band = sheet.getRange(1, 1, 3, n)
  band.breakApart().setBackground(C.ink).setFontColor(C.cream).setFontFamily(DISPLAY_FONT)
  band.setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW)
  sheet.getRange(3, 1, 1, n).setBackground(C.forest)
  sheet.getRange(1, 1).setValue(title).setFontSize(22).setFontWeight('bold').setVerticalAlignment('bottom')
  sheet.getRange(2, 1).setValue(subtitle).setFontColor(C.electric).setFontSize(9).setFontWeight('bold').setVerticalAlignment('top')
  sheet.setRowHeight(1, 56)
  sheet.setRowHeight(2, 30)
  sheet.setRowHeight(3, 4)

  sheet
    .getRange(4, 1, 1, n)
    .setValues([columns.map((c) => c.title.toUpperCase())])
    .setBackground(C.forest)
    .setFontColor(C.cream)
    .setFontFamily(DISPLAY_FONT)
    .setFontSize(9)
    .setFontWeight('bold')
    .setVerticalAlignment('middle')
  sheet.setRowHeight(4, 36)
  columns.forEach((c, i) => sheet.setColumnWidth(i + 1, c.width))
  sheet.setFrozenRows(4)
  sheet.setFrozenColumns(frozenCols)

  const dataRows = sheet.getMaxRows() - FIRST_DATA_ROW + 1
  sheet
    .getRange(FIRST_DATA_ROW, 1, dataRows, n)
    .setFontFamily(BODY_FONT)
    .setFontSize(10)
    .setFontColor(C.ink)
    .setVerticalAlignment('middle')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
  sheet.setRowHeightsForced(FIRST_DATA_ROW, dataRows, 34)
  sheet.getRange(FIRST_DATA_ROW, 1, dataRows, 1).setNumberFormat('d mmm yyyy, h:mm am/pm').setFontColor(C.muted)

  sheet.getBandings().forEach((b) => b.remove())
  sheet
    .getRange(4, 1, sheet.getMaxRows() - 3, n)
    .applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, true, false)
    .setHeaderRowColor(C.forest)
    .setFirstRowColor(C.white)
    .setSecondRowColor('#FAF7F1')

  const existing = sheet.getFilter()
  if (existing) existing.remove()
  sheet.getRange(4, 1, sheet.getMaxRows() - 3, n).createFilter()
  return dataRows
}

function styleRegistrations(sheet) {
  sheet.setTabColor(C.electric)
  const dataRows = styleTable(sheet, 'Registrations', '●  CREATORS HUB 001 · THE FIRST ROOM · FREE TICKETS', REG_COLUMNS, 3)
  sheet.getRange(FIRST_DATA_ROW, REG['Ticket ID'], dataRows, 1).setFontFamily('Roboto Mono').setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, REG['Name'], dataRows, 1).setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, REG['Reference'], dataRows, 1).setFontColor('#A8A8A0').setFontSize(8)
  const att = sheet.getRange(FIRST_DATA_ROW, REG['Attendance'], dataRows, 1).setHorizontalAlignment('center').setFontWeight('bold')
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Online').setBackground('#E1E9F2').setFontColor('#24405E').setRanges([att]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('In person').setBackground('#D9EDE3').setFontColor(C.forest).setRanges([att]).build(),
  ])
}

function styleVolunteers(sheet) {
  sheet.setTabColor(C.forest)
  const dataRows = styleTable(sheet, 'Volunteers', '●  CREATORS HUB 001 · THE FIRST ROOM · VOLUNTEER APPLICATIONS', VOL_COLUMNS, 3)
  sheet.getRange(FIRST_DATA_ROW, VOL['Name'], dataRows, 1).setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, VOL['Status'], dataRows, 1).setHorizontalAlignment('center').setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, VOL['Briefing'], dataRows, 1).setHorizontalAlignment('center')
  sheet.getRange(FIRST_DATA_ROW, VOL['Phone / WhatsApp'], dataRows, 1).setNumberFormat('@')
  sheet.getRange(FIRST_DATA_ROW, VOL['Submission ID'], dataRows, 1).setFontColor('#A8A8A0').setFontSize(8)
  statusRules(sheet, VOL['Status'], dataRows, [])
}

function styleApplications(sheet) {
  sheet.setTabColor(C.forest)
  const n = COLUMNS.length
  sheet.setTabColor('#A8A8A0')
  const dataRows = styleTable(sheet, 'Earlier applications', '●  VOLUNTEER APPLICATIONS FROM THE EARLIER FORM · NEW ONES ARE ON THE VOLUNTEERS TAB', COLUMNS, 3)
  sheet.getRange(FIRST_DATA_ROW, COL['Name'], dataRows, 1).setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, COL['Status'], dataRows, 1).setHorizontalAlignment('center').setFontWeight('bold')
  sheet.getRange(FIRST_DATA_ROW, COL['Submission ID'], dataRows, 1).setFontColor('#A8A8A0').setFontSize(8)

  const levelRange = sheet.getRange(FIRST_DATA_ROW, COL['Level'], dataRows, 1)
  statusRules(sheet, COL['Status'], dataRows, [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Beginners welcome').setFontColor('#1F7A57').setRanges([levelRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Experience preferred').setFontColor('#6A4B00').setRanges([levelRange]).build(),
  ])
  return n
}

/** Status dropdown and colours. */
function statusRules(sheet, col, dataRows, extraRules) {
  const statusRange = sheet.getRange(FIRST_DATA_ROW, col, dataRows, 1)
  statusRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(STATUSES.map((s) => s.name), true)
      .setAllowInvalid(false)
      .build(),
  )
  const rules = STATUSES.map((s) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(s.name)
      .setBackground(s.bg)
      .setFontColor(s.fg)
      .setRanges([statusRange])
      .build(),
  )
  sheet.setConditionalFormatRules(rules.concat(extraRules))
}

function styleOverview(ss) {
  let sheet = ss.getSheetByName(OVERVIEW)
  if (!sheet) sheet = ss.insertSheet(OVERVIEW, 2)
  const hasOld = !!ss.getSheetByName(APPS)
  sheet.clear()
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).breakApart()
  sheet.clearConditionalFormatRules()
  if (sheet.getMaxColumns() > 8) sheet.deleteColumns(9, sheet.getMaxColumns() - 8)
  sheet.setHiddenGridlines(true)
  sheet.setTabColor(C.cream)
  sheet.getRange(1, 1, sheet.getMaxRows(), 8).setFontFamily(BODY_FONT).setFontColor(C.ink).setBackground(C.cream)
  ;[24, 260, 160, 24, 260, 160, 24, 24].forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  const r = "'" + REGS + "'!"
  const v = "'" + VOLS + "'!"
  const last = String(ROWS)
  sheet.getRange('A1:H3').setBackground(C.ink)
  sheet.getRange('B1:F1').merge().setValue('Overview').setFontFamily(DISPLAY_FONT).setFontSize(22).setFontWeight('bold').setFontColor(C.cream).setVerticalAlignment('bottom')
  sheet.getRange('B2:F2').merge().setValue('●  CREATORS HUB 001 · UPDATES AUTOMATICALLY').setFontSize(9).setFontWeight('bold').setFontColor(C.electric).setFontFamily(DISPLAY_FONT)
  sheet.setRowHeight(1, 56)
  sheet.setRowHeight(2, 30)
  sheet.setRowHeight(3, 10)

  // Headline numbers: registrations on the left, volunteers on the right.
  const stat = (row, col, label, formula) => {
    sheet.getRange(row, col).setValue(label).setFontColor(C.muted)
    sheet.getRange(row, col + 1).setFormula(formula).setFontFamily(DISPLAY_FONT).setFontSize(18).setFontWeight('bold').setHorizontalAlignment('right')
    sheet.setRowHeight(row, 38)
  }
  // Rows saved before the online option have no Attendance: they're in person.
  stat(5, 2, 'Registrations (all)', '=COUNTA(' + r + 'B5:B' + last + ')')
  stat(6, 2, 'In person (QR tickets)', '=COUNTA(' + r + 'B5:B' + last + ')-COUNTIF(' + r + 'H5:H' + last + ',"Online")')
  stat(7, 2, 'Online', '=COUNTIF(' + r + 'H5:H' + last + ',"Online")')
  stat(8, 2, 'Registered today', '=COUNTIFS(' + r + 'A5:A' + last + ',">="&TODAY())')
  stat(5, 5, 'Volunteer applications', '=COUNTA(' + v + 'C5:C' + last + ')')
  stat(6, 5, 'New, not yet reviewed', '=COUNTIF(' + v + 'B5:B' + last + ',"New")')
  stat(7, 5, 'Volunteers selected', '=COUNTIF(' + v + 'B5:B' + last + ',"Selected")')
  stat(8, 5, 'Can attend the briefing', '=COUNTIF(' + v + 'I5:I' + last + ',"Yes")')
  sheet.getRange('B5:C8').setBorder(null, null, true, null, null, true, '#E1D9CB', SpreadsheetApp.BorderStyle.SOLID)
  sheet.getRange('E5:F8').setBorder(null, null, true, null, null, true, '#E1D9CB', SpreadsheetApp.BorderStyle.SOLID)
  if (hasOld) {
    stat(9, 5, 'Earlier form (Applications tab)', "=COUNTA('" + APPS + "'!C5:C" + last + ')')
    sheet.getRange(9, 5, 1, 2).setFontColor(C.muted)
  }

  const table = (row, col, title, formula) => {
    sheet.getRange(row, col, 1, 2).merge().setValue(title.toUpperCase()).setFontFamily(DISPLAY_FONT).setFontSize(9).setFontWeight('bold').setFontColor(C.forest)
    sheet.getRange(row + 1, col).setFormula(formula)
    sheet.getRange(row + 1, col, 1, 2).setBackground(C.forest).setFontColor(C.cream).setFontWeight('bold').setFontSize(9)
    sheet.getRange(row + 2, col + 1, 8, 1).setHorizontalAlignment('right').setFontWeight('bold')
  }
  const query = (range, col, label) =>
    '=IFERROR(QUERY(' + range + ',"select ' + col + ', count(' + col + ') where ' + col + " <> '' group by " + col + ' order by count(' + col + ") desc label " + col + " '" + label + "', count(" + col + ") 'Count'\",0),\"None yet\")"
  table(11, 2, 'Registrations by creative arm', query(r + 'E5:E' + last, 'E', 'Creative arm'))
  table(11, 5, 'Volunteers by first-choice team', query(v + 'F5:F' + last, 'F', 'Team'))
  table(22, 2, 'Volunteers in person / online', query(v + 'H5:H' + last, 'H', 'Attending'))
  table(22, 5, 'Volunteers by status', query(v + 'B5:B' + last, 'B', 'Status'))
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

function sendTestRegistration() {
  const result = recordRegistration({
    ref: 'TEST-' + Date.now(),
    ticketId: 'TEST-' + Date.now(),
    name: 'Test Attendee',
    email: 'test@example.com',
    arm: 'Film & Storytelling',
    attendance: 'Online',
    location: 'Accra, Ghana',
    registeredAt: new Date().toISOString(),
  })
  try {
    SpreadsheetApp.getUi().alert('Test sent', result.duplicate ? 'Already there.' : 'A test row was added to Registrations. Delete it whenever you like.', SpreadsheetApp.getUi().ButtonSet.OK)
  } catch (e) {}
}

function sendTestApplication() {
  recordApplication({
    name: 'Test Applicant',
    email: 'test@example.com',
    phone: '+234 801 234 5678',
    team: 'Online Host',
    second_team: 'Welcome & Registration',
    attendance: 'Online (Online Host only)',
    experience: 'None yet. This is a test row: delete it whenever you like.',
    briefing: 'Yes',
    teamLevel: 'Beginners welcome',
    conditional: false,
    submittedAt: new Date().toISOString(),
    submissionId: 'test-' + Date.now(),
  })
  try {
    SpreadsheetApp.getUi().alert('Test sent', 'A test row was added to Volunteers and an email is on its way to you.', SpreadsheetApp.getUi().ButtonSet.OK)
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
