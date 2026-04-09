# City Light Attendance Counting Webapp

A React-based web application for tracking City Light Bible Church weekly attendance with Google Apps Script backend integration. Features real-time attendance submission, visual analytics dashboard, communion counts, and mobile-optimized interface.

## Features

### 📊 Dashboard
- **Interactive Charts**: Line and bar charts showing attendance trends over time
- **Multiple Views**:
  - All Locations: Shows MC Main Total, MC Overflow Total, SVU Total, and Combined Total
  - Mission College: Combined view of Main and Overflow locations
  - Silicon Valley University: SVU-specific data
- **Statistics Cards**: Average total, peak total, and weekly change metrics
- **Weekly Summary**: Generate and copy formatted summaries for any week and location
- **Attendance Records Table**: View, search, and edit all historical records with pagination
- **Mobile Optimized**: Responsive charts with angled labels to prevent overlap

### 📝 Attendance Submission
- **Three Location Support**:
  - Mission College Main Room (7 sections + common areas)
  - Mission College Overflow (2 overflow rooms + family areas)
  - Silicon Valley University (4 wing columns + overflow)
- **Running Totals**: Real-time calculation of adults, kids, and combined totals
- **Copy Summary**: Generate formatted summary text from current form data
- **Duplicate Prevention**: Warns if record already exists for date/location
- **Edit Functionality**: Click any record in the dashboard to edit it

### 🍞 Communion Page
- **Date Selection**: Choose from all available Sunday dates
- **Location-Specific Totals**:
  - Mission College: Main room, Overflow Room 1, Overflow Room 2
  - SVU: Left wing, Right wing
- **Validation Warnings**: Alert when viewing wrong location for a date
- **Refresh Capability**: Manual data refresh with loading indicators

### 📱 Mobile Experience
- **Hamburger Menu**: Clean slide-in navigation for mobile devices
- **Touch Optimized**: 44px minimum touch targets throughout
- **Responsive Charts**: Smaller fonts and angled labels for readability
- **Single Column Layouts**: Optimized forms and statistics for mobile
- **Smooth Scrolling**: Touch-friendly table and content scrolling

### 🔒 Security
- **Password Protection**: Simple password authentication with cookie persistence (6 months)
- **Demo Mode**: Test the app without Google Sheets connection
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- A Google account with access to Google Apps Script
- A Google Spreadsheet to store the data

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/michael-a-wong/city-light-attendance-counting.git
cd city-light-attendance-counting
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Google Apps Script Backend

#### Create Google Spreadsheet

1. Create a new Google Spreadsheet
2. Name it "City Light Attendance" (or your preferred name)
3. The Apps Script will automatically create the necessary sheet structure

#### Deploy Apps Script

1. In your Google Spreadsheet, go to **Extensions > Apps Script**
2. Delete any default code in `Code.gs`
3. Copy the code from your Apps Script file (the backend that handles data storage)
4. Create the following structure:
   - Sheet: `Attendance Data` with columns for all attendance fields
   - Password protection in the script
5. Deploy as a web app:
   - Click **Deploy > New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the **Web app URL**

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your configuration:
   ```env
   # Google Apps Script deployment URL
   VITE_APPS_SCRIPT_URL=your_apps_script_deployment_url_here

   # Optional: Enable demo mode (uses mock data, no Google Sheets required)
   VITE_DEMO_MODE=false
   ```

3. Update the password in `src/config/auth.ts`:
   ```typescript
   export const ATTENDANCE_PASSWORD = 'your-secure-password-here';
   ```

### 5. Run the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Usage

### First Time Access

1. Navigate to the app URL
2. Enter the attendance password
3. Password is saved for 6 months in a cookie

### Submitting Attendance

1. Navigate to **Submit Attendance** (or use hamburger menu on mobile)
2. Fill out the form:
   - Enter your name
   - Select the Sunday date
   - Choose location (Mission College Main, Overflow, or SVU)
   - Enter counts for each section (adults only)
   - Enter total kids count
   - Add any notes (optional)
3. Watch the running totals update in real-time
4. **Optional**: Click **📋 Copy Summary** to copy formatted summary
5. Click **Submit Attendance**
6. Automatically redirected to Dashboard on success

### Viewing Dashboard

1. Navigate to **Dashboard**
2. Use location filter to view:
   - **All Locations**: See breakdown of MC Main, MC Overflow, SVU
   - **Mission College**: Combined MC data
   - **Silicon Valley University**: SVU-only data
3. Toggle between **Line Chart** and **Bar Chart**
4. View statistics cards for quick insights
5. Click **Refresh Data** to reload latest data

### Weekly Summary

1. On Dashboard, scroll to **Weekly Summary** section
2. Select a Sunday date from dropdown
3. Choose location filter (All Locations, Mission College, or SVU)
4. Click **📋 Copy Summary** to copy formatted text
5. Paste summary into emails, Slack, or reports

### Viewing Communion Counts

1. Navigate to **Communion** page
2. Select a Sunday date
3. Choose location (Mission College or SVU)
4. View totals for:
   - Mission College: Main Room, Overflow 1, Overflow 2
   - SVU: Left Wing, Right Wing
5. Click **Refresh** to reload data

### Editing Records

1. On Dashboard, scroll to **Attendance Records** table
2. Click on any record row to edit
3. Update values as needed
4. Click **Update Attendance** to save changes

## Project Structure

```
src/
├── components/
│   ├── AttendanceFormSections.tsx  # Form sections for different locations
│   └── PasswordPrompt.tsx          # Password authentication UI
├── contexts/
│   ├── AttendanceDataContext.tsx   # Shared data context (eliminates duplicate fetches)
│   └── AuthContext.tsx             # Authentication context
├── pages/
│   ├── Home.tsx                    # Dashboard with charts, stats, and weekly summary
│   ├── Home.css
│   ├── SubmitAttendance.tsx        # Attendance submission form
│   ├── SubmitAttendance.css
│   ├── EditAttendance.tsx          # Edit existing records
│   ├── EditAttendance.css
│   ├── Communion.tsx               # Communion counts page
│   └── Communion.css
├── services/
│   ├── appsScriptService.ts        # Google Apps Script API integration
│   └── mockData.ts                 # Demo mode data
├── types/
│   └── attendance-types.ts         # TypeScript type definitions
├── utils/
│   └── sanitization.ts             # Input sanitization utilities
├── config/
│   └── auth.ts                     # Authentication configuration
├── App.tsx                         # Main app with routing and navigation
└── App.css                         # Global styles and mobile hamburger menu
```

## Demo Mode

Enable demo mode to test the app without Google Sheets connection:

```env
VITE_DEMO_MODE=true
```

In demo mode:
- Uses mock data stored in browser localStorage
- No Google Apps Script required
- Perfect for development and testing
- Banner displayed indicating demo mode is active

## Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_APPS_SCRIPT_URL`
   - `VITE_DEMO_MODE=false`
4. Deploy
5. The `vercel.json` configuration handles SPA routing automatically

### Other Hosting Platforms

The app can be deployed to any static hosting service:
- Netlify (add `_redirects` file for SPA routing)
- Firebase Hosting
- AWS S3 + CloudFront
- GitHub Pages

**Important**: Ensure your hosting platform supports SPA routing (redirects all routes to `index.html`)

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_APPS_SCRIPT_URL` | Google Apps Script web app URL | Yes* | - |
| `VITE_DEMO_MODE` | Enable demo mode (true/false) | No | false |

*Not required if `VITE_DEMO_MODE=true`

## Mobile Optimizations

The app is fully optimized for mobile devices:

- **Compact Navigation**: Hamburger menu saves vertical space (~60px vs ~150px)
- **Touch Targets**: All buttons meet 44x44px minimum size
- **Responsive Charts**:
  - Reduced height on mobile (300px vs 400px desktop)
  - Angled X-axis labels prevent overlap
  - Smaller font sizes for better fit
- **Single Column Layouts**: Forms, stats, and summaries stack vertically
- **Smooth Scrolling**: Touch-optimized table scrolling
- **Form Inputs**: Larger input fields (1rem padding) for easier tapping

## Security Notes

- **Password Protection**: Simple password authentication (update in `src/config/auth.ts`)
- **Cookie Storage**: Authentication stored for 6 months
- **Input Sanitization**: All user inputs sanitized to prevent XSS attacks
- **Environment Variables**: Never commit `.env` file to version control
- **Apps Script**: Runs with your Google account permissions
- **Demo Mode**: Safe for testing without exposing real data

## Troubleshooting

### Data Not Loading

- Verify `VITE_APPS_SCRIPT_URL` is correct in `.env`
- Check that Apps Script is deployed as a web app
- Ensure Apps Script permissions are set to "Anyone"
- Check browser console for error messages
- Try refreshing data with the refresh button

### Authentication Issues

- Check that password in `src/config/auth.ts` matches your expected password
- Clear browser cookies if authentication state is stuck
- Verify password cookie expiration (default 6 months)

### Build Errors

- Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` again
- Make sure you're using Node.js v18 or higher
- Check that all environment variables are set correctly
- Run `pnpm typecheck` to check for TypeScript errors

### Mobile Navigation Issues

- Clear browser cache if hamburger menu not appearing
- Check viewport width detection (768px breakpoint)
- Ensure JavaScript is enabled

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Recharts** - Interactive charts and visualizations
- **Google Apps Script** - Backend data storage and API
- **js-cookie** - Cookie management for authentication
- **CSS Variables** - Dynamic theming (light/dark mode)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `pnpm test`
5. Run linter: `pnpm lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`)
8. Submit a pull request

## License

MIT License - feel free to use this project for your church or organization.

## Support

For questions or issues:
- Create an issue on GitHub
- Contact the Admin Team
- Check the troubleshooting section above

## Acknowledgments

Built with ❤️ for City Light Bible Church
