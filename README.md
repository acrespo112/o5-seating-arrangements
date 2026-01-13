# Seating Assignment App - Setup Instructions

## PDF View Feature Setup

The app includes a PDF View mode that overlays employee names on your actual floorplan PDFs. However, since this is a client-side React application, there are a few ways to make the PDFs accessible:

### Option 1: Run with a Local Server (Recommended)

If you want the PDF overlays to work, you need to serve the files through a web server:

1. Save your PDF files in a `public` folder in your project
2. Update the `pdfUrl` paths in the code to reference them like: `/4th_Floor_NEW.pdf`
3. Run the app with a development server that serves static files

### Option 2: Convert PDFs to Images

The most reliable way for the browser to display them:

1. Convert your PDF floorplans to PNG or JPG images
2. Update the code to use `<img>` tags instead of PDF.js
3. Place images in a publicly accessible location

### Option 3: Use the Other View Modes

The app has 4 other view modes that work perfectly without PDFs:
- **Grid View**: Full desk listing
- **Map View**: Interactive spatial grid
- **Floorplan View**: Beautiful employee cards organized by zone
- **Directory**: Alphabetical employee list

### Current Implementation

The app currently uses:
- **LocalStorage** for persistent data (✅ Works immediately)
- **PDF.js** for rendering PDFs (⚠️ Requires proper file serving)

### Quick Start (Without PDF View)

The app works perfectly right now with all features except the PDF overlay. Simply:
1. Open the React file in your browser/application
2. Start assigning employees to desks in Grid View
3. Your assignments will persist automatically
4. Use Map View, Floorplan View, or Directory to visualize assignments

### File Paths Issue

The current paths in the code:
```javascript
pdfUrl: '/mnt/user-data/uploads/4th_Floor_NEW.pdf'
```

These paths work in the Claude environment but won't work when you deploy this to a web browser. You'll need to either:

1. **Host the PDFs online** and use full URLs: `https://your-domain.com/floorplans/4th_floor.pdf`
2. **Place in a public folder** and use relative paths: `/floorplans/4th_floor.pdf`
3. **Embed as base64** (for small PDFs only, not recommended for full floorplans)

### Recommended Solution

For the best experience with PDF overlays:

1. Convert your PDFs to high-res PNG images (you can use an online converter)
2. Host the images somewhere accessible (like in a `public/images` folder)
3. I can update the code to use `<img>` tags instead of PDF.js

Would you like me to modify the code to use images instead of PDFs? This would be much more reliable and work immediately in any browser.
