export function generateSlug(text: string, id?: number): string {
  // Normalize Arabic text using NFC normalization
  const normalized = text.normalize('NFC');
  
  // For Arabic text, we want to keep the Arabic characters
  const slug = normalized
    .trim()
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove Arabic diacritics (optional - keeps base letters clean)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Keep only Arabic letters, Arabic-Indic digits, Latin letters, ASCII digits, and hyphens
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  // Return slug or fallback to course-{id} if slug is empty
  return slug || (id ? `course-${id}` : 'course');
}

// Helper to build course URL with slug
export function buildCourseUrl(id: number, title: string): string {
  const slug = generateSlug(title, id);
  return `/courses/${id}/${slug}`;
}
