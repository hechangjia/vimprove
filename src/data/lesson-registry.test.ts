import { describe, expect, it } from 'vitest';
import { CATEGORIES, LESSONS } from './index';

describe('lesson registry', () => {
  it('has unique lesson slugs and category ids', () => {
    expect(new Set(LESSONS.map(lesson => lesson.slug)).size).toBe(LESSONS.length);
    expect(new Set(CATEGORIES.map(category => category.id)).size).toBe(CATEGORIES.length);
  });

  it('registers every lesson under an existing category', () => {
    const categoryIds = new Set(CATEGORIES.map(category => category.id));

    for (const lesson of LESSONS) {
      expect(categoryIds.has(lesson.categoryId), lesson.slug).toBe(true);
    }
  });

  it('keeps categories ordered and populated', () => {
    const lessonsByCategory = new Map<string, number>();

    for (const lesson of LESSONS) {
      lessonsByCategory.set(lesson.categoryId, (lessonsByCategory.get(lesson.categoryId) ?? 0) + 1);
    }

    CATEGORIES.forEach((category, index) => {
      expect(category.order, category.id).toBe(index + 1);
      expect(lessonsByCategory.get(category.id) ?? 0, category.id).toBeGreaterThan(0);
    });
  });

  it('keeps lesson metadata and content blocks non-empty', () => {
    for (const lesson of LESSONS) {
      expect(lesson.title.trim(), lesson.slug).not.toBe('');
      expect(lesson.shortDescription.trim(), lesson.slug).not.toBe('');
      expect(lesson.contentBlocks.length, lesson.slug).toBeGreaterThan(0);

      lesson.contentBlocks.forEach((block, index) => {
        expect(block.type, `${lesson.slug} content block ${index}`).toMatch(
          /^(markdown|key-list|challenge|run-example|hjkl-snake|game-2048|find-target|window-navigator|operator-gym|text-object-ninja|scroll-surfer|cheat-sheet)$/
        );
      });
    }
  });

  it('keeps visible curriculum at the published v3.2 size', () => {
    expect(LESSONS.length).toBe(80);
    expect(CATEGORIES.length).toBe(16);
  });
});
