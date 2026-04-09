# City Light Attendance Counting Webapp

A React-based web application for tracking City Light weekly attendance with Google Sheets integration. Features real-time attendance submission with running totals and visual analytics dashboard.

## Features

- **Attendance Submission Form**: Easy-to-use form with all required sections
- **Running Total Display**: See the total adult count update as you fill out the form
- **Dashboard**: View attendance trends with interactive charts (line and bar charts)
- **Statistics**: Average, peak, and lowest attendance metrics
- **Google Sheets Integration**: Store and retrieve data from Google Sheets
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- A Google Cloud Platform account
- A Google Spreadsheet to store the data

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/michael-a-wong/city-light-attendance-counting.git
cd city-light-attendance-counting
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Cloud Platform

#### Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Create API Credentials

**API Key:**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key for later use
4. (Recommended) Restrict the API key to only Google Sheets API

**OAuth 2.0 Client ID:**
1. Go to "APIs & Services" > "Credentials"
2. Configure the OAuth consent screen if you haven't already:
   - User Type: External
   - Add your email as a test user
3. Click "Create Credentials" > "OAuth client ID"
4. Choose "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (when deployed)
6. Copy the Client ID for later use

### 4. Set Up Google Spreadsheet

1. Create a new Google Spreadsheet
2. Name it something like "City Light Attendance"
3. In Sheet1, add the following headers in row 1:
   ```
   Name | Date | Far Left | Left | Middle Left | Middle Right | Right | Far Right | Back | Mom's Room | Overflow 1 | Overflow 2 | Family Room | Adjustment | Kids | Notes | Timestamp
   ```
4. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_GOOGLE_API_KEY=your_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
   ```

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Submitting Attendance

1. Navigate to the "Submit Attendance" tab
2. Click "Authenticate with Google" button
3. Sign in with your Google account and grant permissions
4. Fill out the form:
   - Enter your name
   - Select the Sunday date
   - Enter counts for each section (adults only)
   - Enter total kids count
   - Add any notes
5. Watch the "Adult Total So Far" update as you enter numbers
6. Click "Submit Attendance"

### Viewing Dashboard

1. Navigate to the "Dashboard" tab
2. Click "Authenticate with Google" if not already authenticated
3. View:
   - Statistics cards showing averages and peaks
   - Interactive charts (toggle between line and bar charts)
   - Recent attendance records table
4. Click "Refresh Data" to reload the latest data from Google Sheets

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx              # Dashboard with charts and statistics
│   ├── Home.css
│   ├── SubmitAttendance.tsx  # Attendance submission form
│   └── SubmitAttendance.css
├── services/
│   └── googleSheets.ts       # Google Sheets API integration
├── types/
│   └── attendance.ts         # TypeScript type definitions
├── App.tsx                   # Main app with routing
└── App.css                   # Global styles and navigation
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://michael-a-wong.github.io/city-light-attendance-counting",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.ts` to set the base path:
   ```typescript
   export default defineConfig({
     base: '/city-light-attendance-counting/',
     // ... rest of config
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Update OAuth authorized origins in Google Cloud Console to include your GitHub Pages URL

### Other Hosting Platforms

The app can be deployed to any static hosting service:
- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

Remember to update the authorized JavaScript origins in your Google Cloud OAuth settings.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_API_KEY` | Google API Key for Sheets API | Yes |
| `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID | Yes |
| `VITE_GOOGLE_SPREADSHEET_ID` | ID of the Google Spreadsheet | Yes |

## Security Notes

- Never commit your `.env` file to version control
- The `.gitignore` file already excludes `.env`
- Keep your API keys and credentials secure
- For production, consider using environment variables from your hosting platform
- Restrict API keys to only the necessary APIs and domains

## Troubleshooting

### Authentication Issues

- Make sure you've added your email as a test user in the OAuth consent screen
- Check that the authorized JavaScript origins include your current URL
- Clear browser cache and cookies if having persistent issues

### Data Not Loading

- Verify the Spreadsheet ID is correct
- Check that the Google Sheets API is enabled
- Make sure you've granted the necessary permissions when authenticating
- Check the browser console for error messages

### Build Errors

- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure you're using Node.js v16 or higher
- Check that all environment variables are set correctly

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Charts and visualizations
- **Google Sheets API** - Data storage
- **Google Identity Services** - Authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your church or organization.

## Support

For questions or issues, please contact the Admin Team or create an issue on GitHub.
