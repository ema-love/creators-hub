# Google Sheet: registrations and volunteer applications

One Google Sheet holds both kinds of record from the website:

- **Registrations**: every free ticket registration (name, email, creative arm, ticket ID) becomes a row. No email is sent to you for these, as there can be hundreds; the attendee gets their confirmation from the website.
- **Applications**: every volunteer application becomes a row **and** is emailed to you, the owner of the sheet, as a branded summary with a "Reply" button.
- **Overview**: totals and breakdowns for both, updating by themselves.

Your email address is never written in the code or on the website: Google sends volunteer emails to whichever account owns the sheet.

Everything is also kept by the website itself. If the sheet is unreachable, or not set up yet, registrations are queued and added automatically within the hour once it's available. Volunteer applications always stay in Netlify → Forms.

## One-time setup (about 10 minutes)

Do this while signed in to the Google account that should own the data.

### 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) to make a blank Google Sheet.
2. Open **Extensions → Apps Script**.
3. Delete everything in the editor, then paste the whole of [`creators-hub.gs`](./creators-hub.gs).
4. Click **Save** (the disk icon). You can name the project "Creators Hub".
5. Go back to the sheet tab and **reload the page**. A **Creators Hub** menu appears next to Help.
6. Click **Creators Hub → 1. Set up this sheet**.
   - Google asks for permission the first time: choose your account, then **Advanced → Go to Creators Hub (unsafe) → Allow**. ("Unsafe" only means Google hasn't reviewed your own private script.)
   - Once it finishes, the sheet has **Registrations**, **Applications** and **Overview** tabs.

### 2. Check it works

Use **Creators Hub → Send a test registration** and **Send a test application**. A test row appears on each tab, and a "New volunteer" email reaches your inbox. Delete the test rows afterwards.

### 3. Connect the website

1. In the Apps Script editor click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**.
   - "Anyone" only lets the website reach the script. Nobody can read the sheet through it, and requests without the secret key are refused.
4. Copy the **Web app URL** (it ends in `/exec`).
5. In the sheet, click **Creators Hub → 2. Show connection key** and copy the key.
6. In Netlify, go to **Site configuration → Environment variables** and add:
   - `GOOGLE_SHEET_URL`: the web app URL
   - `GOOGLE_SHEET_KEY`: the connection key
7. Redeploy the site (**Deploys → Trigger deploy**).

## Already set up the volunteer-only version?

1. In **Extensions → Apps Script**, replace all the code with [`creators-hub.gs`](./creators-hub.gs) and save.
2. Reload the sheet and run **Creators Hub → 1. Set up this sheet** again. It adds the Registrations tab and refreshes the Overview. Existing rows are kept.
3. Publish the new code: **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL and key stay the same.
4. If you used `VOLUNTEER_SHEET_URL` / `VOLUNTEER_SHEET_KEY` in Netlify, they still work. You can rename them to `GOOGLE_SHEET_URL` / `GOOGLE_SHEET_KEY` whenever you like.

## Using the sheet

- **Registrations:** one row per attendee, oldest first. Use the filter buttons in the header row to see one creative arm, and the **Notes** column for your own comments. Check-ins at the door are tracked in the website's staff area (`/staff`), not here.
- **Applications:** set each applicant's **Status** (New, Reviewing, Shortlisted, Contacted, Selected, Not this time) from its dropdown.
- Long answers are cut off in the cell to keep the rows tidy. Click a cell to read all of it.

## Good to know

- If you edit the script later, publish the change with **Deploy → Manage deployments → Edit → Version: New version → Deploy**.
- Google allows a personal Gmail account to send about 100 script emails a day. Only volunteer applications use this.
- To change which account owns the data, make the sheet and the deployment from that account.
