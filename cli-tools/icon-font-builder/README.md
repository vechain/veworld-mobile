# Icon Font Builder

A Python tool that generates a custom icon font (TTF) and TypeScript mapping file from SVG icons defined in a JSON configuration file.

## Overview

This tool reads icon definitions from a JSON file, converts SVG icons into a font file using FontForge, and generates a TypeScript map file that maps icon names to their Unicode code points. The generated font can be used in your React Native application.

## Prerequisites

1. **FontForge** - Download and install for your platform from [fontforge.org](https://fontforge.org/en-US/downloads/)
2. **Python 3** - Ensure Python 3 is installed on your system

## Setup

1. **Create a virtual environment** (recommended):
   ```bash
   python3 -m venv .venv
   ```

2. **Activate the virtual environment**:
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```
   - On Windows:
     ```bash
     .venv\Scripts\activate
     ```

3. **Install dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```

## Usage

### Step 1: Add Icons to the JSON File

Open `DesignSystemIcons.json` and add your icon definitions to the `icons` array. Each icon should follow this structure:

```json
{
    "icons": [
        {
            "style": "glyph",
            "width": 24,
            "height": 24,
            "tags": "",
            "name": "my-icon-name",
            "content": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>",
            "set_id": 1,
            "code": 60000
        }
    ]
}
```

**Icon Properties:**
- `name`: Unique identifier for the icon (used in the generated TypeScript map)
- `content`: The complete SVG markup as a string (escape quotes with `\"`)
- `code`: Unicode code point for the icon (must be unique)
- `width` / `height`: Dimensions of the icon (typically 24x24)
- `style`: Should be `"glyph"` for font icons
- `tags`: Optional tags for categorization
- `set_id`: Optional set identifier

**Important Notes:**
- Each icon must have a unique `code` (Unicode code point)
- The `name` will be prefixed with `icon-` in the generated TypeScript map (e.g., `"my-icon"` becomes `"icon-my-icon"`)
- Ensure SVG content is properly escaped in the JSON

### Step 2: Run the Script

Run the main script to generate the font and TypeScript map:

```bash
python3 main.py
```

The script will:
1. Read icon definitions from `DesignSystemIcons.json`
2. Create temporary SVG files in `svg_cache/` (automatically created)
3. Generate the font file (`DesignSystemIcons.ttf`)
4. Generate the TypeScript map file (`designSystemIconMap.ts`)
5. Output both files to `../../src/Assets/Fonts/DesignSystemIcons/`

