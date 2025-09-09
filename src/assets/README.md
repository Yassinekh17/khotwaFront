# Assets Structure for Course Content

This directory contains the static assets for course content files.

## Directory Structure

```
src/assets/
├── pdfs/           # PDF course materials
├── videos/         # Video course content
├── ppts/          # PowerPoint presentations
└── img/           # Course images and thumbnails
```

## File Naming Convention

For demo purposes, files should follow this pattern:
- `course_{courseId}_chapter_{chapterId}.{extension}`

### Examples:
- `course_1_chapter_1.pdf`
- `course_1_chapter_2.mp4`
- `course_2_chapter_1.pptx`
- `course_3_chapter_3.pdf`

## Supported File Types

### PDFs
- Extension: `.pdf`
- Used for: Course materials, documentation, slides

### Videos
- Extensions: `.mp4`, `.webm`, `.ogg`
- Used for: Video lectures, tutorials, demonstrations

### PowerPoint
- Extensions: `.pptx`, `.ppt`
- Used for: Presentations, slides, interactive content

## Demo Content

When the backend is not available, the application creates demo courses with realistic content. The file URLs point to these locations, but the actual files don't need to exist for the interface to work.

## Adding Real Content

To add real course files:

1. Place your files in the appropriate directories
2. Update the file URLs in the course data
3. Ensure files are accessible via the web server

## Notes

- All file paths are relative to the `src/assets/` directory
- Files should be optimized for web delivery
- Consider file size limits for better performance
- Use appropriate compression for videos and images