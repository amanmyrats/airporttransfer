// src/app/shared/utils/slug.util.ts
export function buildSectionAnchor(heading: string | null | undefined, suffix: string | number): string {
    const base = (heading ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const slug = base || 'section';
    return `${slug}-${suffix}`;
  }
  