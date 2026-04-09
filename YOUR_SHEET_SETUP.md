# Quick Setup for Your Google Sheet

Your Google Sheet: https://docs.google.com/spreadsheets/d/170LuY_GJ3OI5vzG-oFjYfCLTqSnsutA18zBXAqpj8SQ/edit

## Step 1: Add Headers to Your Sheet

1. Open your Google Sheet (link above)
2. In **Row 1**, add these headers starting in column A:

```
Name | Date | Location | Far Left | Left | Middle Left | Middle Right | Right | Far Right | Back | Mom's Room | Family Room | Overflow 1 | Overflow 2 | Left Wing Left | Left Wing Right | Right Wing Left | Right Wing Right | SVU Family Overflow | Adjustment | Kids | Notes | Timestamp
```

**Copy/paste this into A1-W1** (23 columns):
```
Name	Date	Location	Far Left	Left	Middle Left	Middle Right	Right	Far Right	Back	Mom's Room	Family Room	Overflow 1	Overflow 2	Left Wing Left	Left Wing Right	Right Wing Left	Right Wing Right	SVU Family Overflow	Adjustment	Kids	Notes	Timestamp
```

## Step 2: Deploy Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`
3. Copy the **entire contents** from `google-apps-script/Code.gs` in this project
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon)
6. Click **Deploy → New deployment**
7. Click the gear icon ⚙️ → Select **"Web app"**
8. Settings:
   - Execute as: **Me** (micwong@...)
   - Who has access: **Anyone**
9. Click **Deploy**
10. **Authorize** the script when prompted
11. **Copy the deployment URL** - looks like:
    ```
    https://script.google.com/macros/s/AKfycbz.../exec
    ```

## Step 3: Add to Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add this variable:

| Name | Value |
|------|-------|
| `VITE_APPS_SCRIPT_URL` | (paste the URL from Step 2) |

5. **Save**
6. Go to **Deployments** → click "..." → **Redeploy**

## Step 4: Test

1. Visit your deployed app
2. Enter password: `adminteam`
3. Go to "Submit Attendance"
4. Fill out a test record
5. Click Submit
6. Check your Google Sheet - data should appear in Row 2!

## Troubleshooting

### Can't find Extensions menu?
- Make sure you're in the main sheet view (not in a specific cell)
- The menu is at the top: File | Edit | View | Insert | Format | Data | Tools | **Extensions**

### Script authorization warning?
- This is normal for personal scripts
- Click "Advanced" → "Go to ... (unsafe)" → "Allow"
- It's your own script, completely safe

### Data not appearing in sheet?
- Check Apps Script **Executions** (⚠️ icon in left sidebar)
- Look for errors in recent executions
- Verify headers are exactly as shown above (case-sensitive)

### "Invalid password" error?
- Password is: `adminteam` (lowercase, no spaces)
- Check line 18 in Code.gs matches: `const VALID_PASSWORD = 'adminteam';`

## Your Spreadsheet Info

- **Spreadsheet ID**: `170LuY_GJ3OI5vzG-oFjYfCLTqSnsutA18zBXAqpj8SQ`
- **Direct link**: https://docs.google.com/spreadsheets/d/170LuY_GJ3OI5vzG-oFjYfCLTqSnsutA18zBXAqpj8SQ/edit
- **Required columns**: A through W (23 columns)
- **First row**: Headers
- **Data starts**: Row 2
