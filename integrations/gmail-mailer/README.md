# Ticket emails from the Creator’s Hub Gmail

When someone registers, they get their ticket by email from the **Creator’s Hub Gmail account**, with its QR code and a link to download it. A small Google script on that account does the sending. No domain is needed.

## Before you start: use the right account

Emails are sent from **whichever Google account owns the script**. Make sure that's the Creator’s Hub account, not your personal one:

- Open a **new browser profile or a private/incognito window**, and sign in to **only** the Creator’s Hub Gmail.
- At every step below, check the account picture in the top-right corner is the Creator’s Hub account.

Step 4 of the setup also prints the sending address, so you can confirm it.

## Setup (about 10 minutes)

1. Create the Gmail account if you haven't yet, e.g. `creatorshub.tickets@gmail.com`. Its name is what attendees see, so name the account **Creator’s Hub**.
2. Signed in as that account, go to **[script.google.com](https://script.google.com)** and click **New project**. Rename it "Creator’s Hub mailer".
3. Delete everything in the editor, paste the whole of [`mailer.gs`](./mailer.gs), and click **Save**.
4. In the function menu at the top (next to **Run**), choose **`setUp`** and click **Run**.
   - Google asks for permission the first time: choose the Creator’s Hub account, then **Advanced → Go to Creator’s Hub mailer (unsafe) → Allow**. ("Unsafe" only means Google hasn't reviewed your own script.)
   - The **Execution log** at the bottom shows the **connection key** and the address emails will be sent from. Check it's the Creator’s Hub address.
5. Choose **`sendTestEmail`** and click **Run**. A test email arrives in the Creator’s Hub inbox.
6. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and copy the **Web app URL** (ends in `/exec`).
   - "Anyone" only lets the website reach the script. Without the connection key it refuses to send anything.
7. In Netlify, go to **Site configuration → Environment variables** and add:
   - `GMAIL_MAILER_URL`: the web app URL
   - `GMAIL_MAILER_KEY`: the connection key from step 4
8. Redeploy (**Deploys → Trigger deploy → Deploy site**).

From then on every new registration gets its email within a few seconds.

## Good to know

- **Daily limit.** A free Gmail account can send about **100** of these emails a day; run **`checkDailyLimit`** to see what's left. Past the limit, attendees still get their ticket on screen immediately, and the website sends their email automatically as soon as Gmail allows, usually the next day. A paid Google Workspace account raises the limit to 1,500 a day.
- **No duplicates.** If the website retries an email, the script recognises it and doesn't send it twice.
- **Replies.** If an attendee replies, it goes to the Creator’s Hub inbox.
- **Changing the script later:** publish changes with **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.
- **Lost the key?** Run **`showConnectionKey`**.
