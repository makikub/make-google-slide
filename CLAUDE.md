# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- **Build**: `./build.sh` - Combines all source files into `out/google-slides-generator.gs` for Google Apps Script deployment
- **Clean**: `rm -rf out/` - Remove generated output files

## Core Architecture

This project transforms a monolithic 1000+ line prompt file (`before-prompt.md`) into a modular Google Apps Script slide generation system with complete separation of concerns.

### Module Structure

```
src/first.gs      → Execution settings (SETTINGS object)
src/style.gs      → Design configuration (CONFIG object with colors, fonts, layouts)
src/theme.gs      → Theme abstraction API (bridges style.gs and slide.gs)
src/text-data.gs  → Slide data content (slideData array - customization target)
src/slide.gs      → Slide generation logic (uses Theme API exclusively)
```

### Key Architectural Pattern

The system implements a **Theme Abstraction Layer** that completely decouples styling from business logic:

```
slide.gs → Theme API → style.gs
                    ↘ CONFIG
```

- `slide.gs` NEVER references `CONFIG` directly
- All styling access goes through semantic methods: `Theme.getColor('primary')`, `Theme.getFontSize('title')`
- Style changes only require editing `style.gs`
- `slide.gs` remains unchanged when design is modified

### Build Process

The `build.sh` script combines files in this specific order:
1. `first.gs` - Execution settings
2. `style.gs` - Raw configuration 
3. `theme.gs` - API abstraction layer
4. `text-data.gs` - Sample data
5. `slide.gs` - Generation logic

Output goes to `out/google-slides-generator.gs` (987 lines, 43,927 bytes) ready for Google Apps Script.

### Supported Slide Types

- `title` - Title slide with logo and date
- `section` - Chapter dividers with ghost numbers
- `content` - Bullet points, 1/2 column layouts, images
- `compare` - Side-by-side comparison boxes
- `process` - Numbered step diagrams with connecting lines
- `timeline` - Horizontal timeline with status indicators
- `diagram` - Mermaid-style lane/card diagrams with auto-arrows
- `cards` - Grid layouts with rounded rectangle cards
- `table` - Data tables with headers
- `progress` - Progress bars with percentages
- `closing` - Simple logo ending

### Critical Development Rules

1. **Never modify the generated file**: `out/google-slides-generator.gs` is auto-generated
2. **Theme API enforcement**: `slide.gs` must NEVER directly access `CONFIG` - use `Theme.*` methods only
3. **Build after changes**: Always run `./build.sh` after editing source files
4. **Semantic styling**: Use descriptive names (`Theme.getColor('primary')` not `CONFIG.COLORS.primary_blue`)

### Customization Points

- **Content**: Edit `src/text-data.gs` slideData array
- **Design**: Modify `src/style.gs` CONFIG object (colors, fonts, layouts)  
- **Settings**: Adjust `src/first.gs` for slide clearing and target presentation
- **Logic**: Extend slide generators in `src/slide.gs` (via Theme API only)

The architecture ensures that design changes (90% of customizations) require only `style.gs` editing while maintaining a stable, testable business logic layer.