# Volunteer applications → Google Sheet + email

Every volunteer application from the website is:

1. saved in **Netlify → Forms → volunteer** (always, as a backup),
2. added as a row in your **Google Sheet**, and
3. emailed to **you**, the owner of that sheet, as a branded summary with a "Reply" button.

Your email address is never written in the code or on the website: Google sends the email to whichever account owns the sheet.

## One-time setup (about 10 minutes)

Do this while signed in to the Google account that should receive the applications.

### 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) to make a blank Google Sheet.
2. Open **Extensions → Apps Script**.
3. Delete everything in the editor, then paste the whole of [`volunteer-applications.gs`](./volunteer-applications.gs).
4. Click **Save** (the disk icon). You can name the project "Creators Hub volunteers".
5. Go back to the sheet tab and **reload the page**. A **Creators Hub** menu appears next to Help.
6. Click **Creators Hub → 1. Set up this sheet**.
   - Google asks for permission the first time: choose your account, then **Advanced → Go to Creators Hub volunteers (unsafe) → Allow**. ("Unsafe" only means Google hasn't reviewed your own private script.)
   - Once it finishes, the sheet has an **Applications** tab and an **Overview** tab.

### 2. Check it works

Click **Creators Hub → Send a test application**. A test row appears and a "New volunteer" email reaches your inbox. Delete the test row afterwards.

### 3. Connect the website

1. In the Apps Script editor click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**.
   - "Anyone" only lets the website reach the script. Nobody can read the sheet through it, and requests without the secret key are refused.
4. Copy the **Web app URL** (it ends in `/exec`).
5. In the sheet, click **Creators Hub → 2. Show connection key** and copy the key.
6. In Netlify, go to **Site configuration → Environment variables** and add:
   - `VOLUNTEER_SHEET_URL`: the web app URL
   - `VOLUNTEER_SHEET_KEY`: the connection key
7. Redeploy the site (**Deploys → Trigger deploy**).

From then on, every new application arrives in the sheet and your inbox within a few seconds.

## Using the sheet

- **Applications tab:** one row per applicant, newest at the bottom. Set the **Status** column (New, Reviewing, Shortlisted, Contacted, Selected, Not this time) from its dropdown; each status has its own colour. Use the filter buttons in the header row to view one role or status at a time, and the **Notes** column for your own comments.
- **Overview tab:** totals, plus applicants by role, department, status and background. It updates by itself.
- Long answers are cut off in the cell to keep the rows tidy. Click a cell to read all of it, or read it in the email.

## Good to know

- If the sheet is ever unreachable, nothing is lost: every application stays in Netlify → Forms.
- If you edit the script later, publish the change with **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.
- Google allows a personal Gmail account to send about 100 script emails a day, which is far more than you're likely to need.
- To change which account receives the emails, make the sheet and the deployment from that account.
