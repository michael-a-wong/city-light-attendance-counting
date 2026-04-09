# Google Apps Script Setup Instructions

This guide will walk you through setting up Google Apps Script backend for the City Light Attendance Tracker.

## Prerequisites

- A Google account
- Access to Google Sheets
- Your attendance tracker deployed on Vercel (or running locally)

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "City Light Attendance Tracker"

### Set Up the Header Row

In Row 1, add these **exact** column headers (copy/paste to avoid typos):

```
Name | Date | Location | Far Left | Left | Middle Left | Middle Right | Right | Far Right | Back | Mom's Room | Family Room | Overflow 1 | Overflow 2 | Left Wing Left | Left Wing Right | Right Wing Left | Right Wing Right | SVU Family Overflow | Adjustment | Kids | Notes | Timestamp
```

**That's columns A through W** (23 columns total).

### Share the Sheet

1. Click the "Share" button (top right)
2. Under "General access" → Change to **"Anyone with the link"**
3. Set permission to **"Editor"** (so the script can write)
4. Click "Done"

## Step 2: Deploy the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. You'll see a blank `Code.gs` file
3. **Delete** all the default code
4. Open the file `google-apps-script/Code.gs` from this repository
5. **Copy the entire contents** and paste into the Apps Script editor
6. Click **Save** (💾 icon or Ctrl+S)

### Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure the deployment:
   - **Description**: "City Light Attendance API"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. You may need to **authorize** the script:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to City Light Attendance Tracker (unsafe)" - this is safe, it's your own script
   - Click "Allow"
7. **Copy the Web app URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
   You'll need this for Vercel!

## Step 3: Configure Vercel

1. Go to your Vercel dashboard
2. Select your "city-light-attendance-counting" project
3. Go to **Settings → Environment Variables**
4. Add this variable:

   | Name | Value |
   |------|-------|
   | `VITE_APPS_SCRIPT_URL` | `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec` |

   (Paste the URL you copied in Step 2)

5. Click **Save**
6. Go to **Deployments** tab
7. Click the **"..."** menu next to your latest deployment
8. Click **"Redeploy"** to rebuild with the new environment variable

## Step 4: Test Your Setup

1. Visit your deployed Vercel app
2. Enter the password: `adminteam`
3. You should see the dashboard (with no data yet)
4. Go to **Submit Attendance**
5. Fill out a test record and submit
6. Go back to your Google Sheet
7. You should see the data appear in Row 2!

## Troubleshooting

### "Invalid password" error
- The password check happens server-side in the Apps Script
- Check line 18 in `Code.gs`: `const VALID_PASSWORD = 'adminteam';`
- Make sure you're entering exactly: `adminteam` (lowercase, no spaces)

### "Failed to fetch records" error
- Check that `VITE_APPS_SCRIPT_URL` is set correctly in Vercel
- Make sure the Apps Script deployment is set to "Anyone" access
- Check the Apps Script **Executions** page for error logs:
  - In Apps Script editor: ⚠️ icon on left sidebar
  - Look for recent errors

### Data not appearing in Google Sheet
- Verify column headers match exactly (case-sensitive)
- Check Apps Script **Executions** logs for errors
- Make sure the sheet has "Editor" access for "Anyone with the link"

### Script redeployment changes URL
- If you redeploy the Apps Script, the URL might change
- Copy the new URL and update `VITE_APPS_SCRIPT_URL` in Vercel
- Redeploy your Vercel app

## Optional: Change the Password

To change the password from "adminteam":

1. Open `Code.gs` in Apps Script editor
2. Find line 18: `const VALID_PASSWORD = 'adminteam';`
3. Change it to your desired password:
   ```javascript
   const VALID_PASSWORD = 'your-new-password-here';
   ```
4. Click **Save**
5. **No need to redeploy** - changes take effect immediately

⚠️ **Important**: The password in `PasswordPrompt.tsx` (line 15) still checks for "adminteam" locally before sending to the server. This is just for user feedback. The real security is the Apps Script password check.

To update the client-side check (optional):
1. Edit `src/components/PasswordPrompt.tsx`
2. Line 15: Change `if (password === 'adminteam')` to match your new password
3. Commit and push to trigger Vercel deployment

## Demo Mode

If you don't set `VITE_APPS_SCRIPT_URL` in Vercel, the app automatically runs in **Demo Mode** with mock data. This is useful for:
- Testing the UI without a backend
- Development
- Demos/presentations

To disable demo mode: Just add the `VITE_APPS_SCRIPT_URL` environment variable!

## Security Notes

- ✅ Password is checked server-side in Apps Script (hidden from browser)
- ✅ Password is sent over HTTPS (encrypted in transit)
- ✅ Apps Script URL is configured via environment variables (not in code)
- ⚠️ Password is stored in sessionStorage (cleared when browser closes)
- ⚠️ Anyone with the Apps Script URL can call it if they know the password

For a small church app with trusted users, this security is adequate. For production apps with sensitive data, consider adding:
- OAuth authentication
- API rate limiting
- Request signing/HMAC validation
