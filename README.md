# Generic Homam Manual Application

This is a generic React application for displaying homam (Vedic fire ritual) manuals with multi-language support. The application can load and switch between different homam manuals dynamically.

## Features

- **Multi-language Support**: English, Telugu, and Hindi
- **Dynamic Manual Loading**: Switch between different homam manuals
- **Responsive Design**: Works on desktop and mobile devices
- **Progressive Navigation**: Step-by-step guidance through ritual sections
- **Conditional Content**: Automatically hides sections without diagrams
- **Modern UI**: Clean, accessible interface with Tailwind CSS

## Project Structure

```
src/
├── data/
│   ├── config.json          # Configuration for available manuals
│   ├── siva-homam.json      # Siva Homam manual data
│   └── ganesh-homam.json    # Ganesh Homam manual data (example)
├── dataLoader.js            # Dynamic data loading utility
├── App.js                   # Main application component
└── index.js                 # Application entry point
```

## Adding a New Manual

To add a new homam manual to the application:

### 1. Create the Manual JSON File

Create a new JSON file in the `src/data/` directory with the following structure:

```json
{
  "title": {
    "english": "Manual Title",
    "telugu": "Telugu Title",
    "hindi": "Hindi Title"
  },
  "author": {
    "english": "Author Name",
    "telugu": "Author Name",
    "hindi": "Author Name"
  },
  "sections": [
    {
      "id": 0,
      "title": {
        "english": "Section Title",
        "telugu": "Telugu Section Title",
        "hindi": "Hindi Section Title"
      },
      "instructions": {
        "english": ["Instruction 1", "Instruction 2"],
        "telugu": ["Telugu Instruction 1", "Telugu Instruction 2"],
        "hindi": ["Hindi Instruction 1", "Hindi Instruction 2"]
      },
      "slokas": {
        "english": "Mantra in Roman script",
        "telugu": "మంత్ర Telugu script లో",
        "devanagari": "मंत्र Devanagari script में"
      },
      "diagram_placeholder": "Description of diagram or 'No diagram for this section.'"
    }
    // ... more sections
  ]
}
```

### 2. Update the Configuration

Add your new manual to `src/data/config.json`:

```json
{
  "manuals": [
    {
      "id": "your-manual-id",
      "name": "Your Manual Name",
      "filename": "your-manual.json",
      "description": "Brief description of your manual"
    }
    // ... existing manuals
  ],
  "defaultManual": "your-manual-id"  // Optional: set as default
}
```

### 3. Section Structure Guidelines

- **ID**: Start with 0 for introduction, then 1, 2, 3, etc.
- **Instructions**: Array of instruction strings for each language
- **Slokas**: Sanskrit mantras in different scripts
- **Diagrams**: Set to "No diagram for this section." if no diagram is needed

## Language Support

The application supports three languages:
- **English**: Latin script
- **Telugu**: Telugu script (తెలుగు)
- **Hindi**: Devanagari script (हिन्दी)

## Usage

1. Start the development server: `npm start`
2. Open http://localhost:3000 in your browser
3. Use the manual selector in the left sidebar to switch between manuals
4. Use the language selector in the top-right to change languages
5. Navigate through sections using the left sidebar or Previous/Next buttons

## Development

To run the application locally:

```bash
npm install
npm start
```

To build for production:

```bash
npm run build
```

## Contributing

When adding new manuals:
1. Follow the JSON structure exactly
2. Ensure all three languages are provided
3. Test the manual thoroughly in all languages
4. Verify section navigation works properly

## Example Manuals

The application comes with two example manuals:
- **Siva Homam**: Complete 24-section manual
- **Ganesh Homam**: Simple 3-section example manual

Use these as templates for creating new manuals.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
