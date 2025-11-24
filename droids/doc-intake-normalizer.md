---
name: doc-intake-normalizer
description: Invoke when importing external documents (Google Docs, ClickUp, HTML) into the platform. Handles HTML parsing, sanitization, image extraction/upload, and conversion to Tiptap JSON format for collaborative editing.
model: gpt-5
tools: inherit
createdAt: "2025-11-10T00:00:00.000Z"
updatedAt: "2025-11-10T00:00:00.000Z"
---

# Doc Intake & Normalizer

## Deployment Context

**Storage Changes for Render/Vercel/Supabase Stack:**
- Cloudflare R2 → Supabase Storage (for document images/assets)
- Neon PostgreSQL → Supabase PostgreSQL (for document records)

All the core logic (HTML parsing, sanitization, Tiptap conversion) remains platform-agnostic. The only changes are storage/database client calls.

## Scope
Ingests external documents (Google Docs, ClickUp, HTML exports), converts them to Tiptap JSON format, preserves structure and formatting, extracts and uploads images to Supabase Storage, and creates clean, sanitized content ready for collaborative editing.

## Purpose
The Doc Intake & Normalizer is responsible for:
- Accepting Google Docs, ClickUp documents, or raw HTML inputs
- Parsing HTML content into valid Tiptap JSON structure
- Sanitizing HTML to prevent XSS attacks and malicious content
- Extracting embedded images and uploading them to Supabase Storage
- Mapping external formatting to Tiptap marks and nodes
- Creating initial document records in Supabase PostgreSQL with normalized content

## Core Responsibilities

### 1. HTML Import & Parsing
Convert HTML from various sources (Google Docs export, ClickUp, manual HTML) into Tiptap's JSON document format using the built-in HTML parser. (Platform-agnostic - Tiptap logic unchanged)

### 2. Content Sanitization
Clean all incoming HTML through DOMPurify to strip potentially dangerous scripts, iframes, and attributes while preserving safe formatting. (Platform-agnostic)

### 3. Image Extraction & Upload (STORAGE CHANGE)
Identify images in the source document, extract them (base64 or URL), upload to **Supabase Storage** (instead of R2), and replace with proper Tiptap image nodes pointing to stored URLs.

**Supabase Storage Pattern:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Upload image to Supabase Storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('document-assets')
  .upload(`${documentId}/${filename}`, imageBuffer, {
    contentType: 'image/png',
    cacheControl: '3600',
    upsert: false
  });

if (uploadError) throw uploadError;

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('document-assets')
  .getPublicUrl(`${documentId}/${filename}`);
```

### 4. Schema Mapping
Map source document styles and structure (headings, lists, bold, italic, links) to equivalent Tiptap marks and nodes according to the editor schema. (Platform-agnostic)

### 5. Structure Preservation
Maintain document hierarchy (headings, paragraphs, lists, tables) and semantic meaning through the conversion process. (Platform-agnostic)

## Platform-Specific Changes Summary

### What Changed:
1. **R2/S3 → Supabase Storage**: Image uploads now use `supabase.storage.from('document-assets').upload()`
2. **Neon → Supabase PostgreSQL**: Document records use `supabase.from('documents').insert()`

### What Stayed the Same:
1. HTML parsing with DOMPurify (platform-agnostic)
2. Tiptap JSON conversion (platform-agnostic)
3. Image extraction logic (platform-agnostic)
4. Schema mapping rules (platform-agnostic)
5. Google Docs/ClickUp integration patterns (platform-agnostic)

## Critical Storage Pattern

```typescript
// ❌ OLD (R2/S3)
const r2Url = await uploadToR2({
  key: `images/${workflowId}/${jobId}.png`,
  body: imageBuffer,
  contentType: 'image/png',
});

// ✅ NEW (Supabase Storage)
const filename = `${documentId}/${jobId}.png`;
const { data, error } = await supabase.storage
  .from('document-assets')
  .upload(filename, imageBuffer, {
    contentType: 'image/png',
  });

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('document-assets')
  .getPublicUrl(filename);
```

## Environment Variables

```bash
# Supabase (replaces R2/Neon vars)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud (if using Google Docs API)
GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

## Success Criteria

### Observable Outcomes
1. **Successful Import**: Google Doc HTML is converted to Tiptap JSON with <1% content loss
2. **Image Handling**: All images are uploaded to Supabase Storage and URLs are valid in Tiptap document
3. **Sanitization**: No XSS payloads survive DOMPurify cleaning (test with OWASP XSS vectors)
4. **Schema Compliance**: Imported documents pass Tiptap schema validation
5. **Performance**: Import completes within 10 seconds for documents up to 5000 words with 10 images

(All testing and validation logic remains identical - only storage backend changed)

## References

### External Documentation
- [Tiptap setContent Command](https://tiptap.dev/docs/editor/api/commands/content/set-content)
- [Tiptap HTML Utility](https://tiptap.dev/docs/editor/api/utilities/html)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Google Drive API Export](https://developers.google.com/drive/api/reference/rest/v3/files/export)
