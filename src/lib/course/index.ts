import type { Lesson, Task } from "./types";
import { LESSONS_1_9 } from "./lessons-1-9";
import { LESSONS_10_18 } from "./lessons-10-18";
import { LESSONS_19_26 } from "./lessons-19-26";

export * from "./types";

const RAW_LESSONS: Lesson[] = [...LESSONS_1_9, ...LESSONS_10_18, ...LESSONS_19_26];

// Every lesson includes its звонок-step (call). The data already provides one call task per lesson.
export const LESSONS: Lesson[] = RAW_LESSONS;

/** Human-readable URL slugs for each lesson, keyed by internal lesson id. */
export const LESSON_SLUGS: Record<string, string> = {
  "lesson-1": "introduction-to-pm",
  "lesson-2": "project-attributes-sdlc",
  "lesson-3": "sdlc-backend-frontend-api",
  "lesson-4": "documentation-types-spec",
  "lesson-5": "writing-spec-idef0-use-case",
  "lesson-6": "writing-user-stories",
  "lesson-7": "information-architecture-userflow-cjm",
  "lesson-8": "mvp-definition",
  "lesson-9": "ux-ui-frontend-backend-testing",
  "lesson-10": "ai-basics-prompt-engineering",
  "lesson-11": "git-glossary",
  "lesson-12": "team-building-tuckman",
  "lesson-13": "client-communication",
  "lesson-14": "team-conflicts",
  "lesson-15": "project-management-styles",
  "lesson-16": "knowledge-testing",
  "lesson-17": "risks-risk-register",
  "lesson-18": "waterfall-agile-kanban-lean",
  "lesson-19": "scrum-roles-dod-dor",
  "lesson-20": "scrum-story-points-velocity",
  "lesson-21": "best-practices-and-tools",
  "lesson-22": "tools-notion-trello",
  "lesson-23": "tools-jira",
  "lesson-24": "spec-correction",
  "lesson-25": "product-building-outsource-vs-product",
  "lesson-26": "course-retro-open-lesson",
};

const SLUG_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(LESSON_SLUGS).map(([id, slug]) => [slug, id]),
);

/** The public URL slug for a lesson (falls back to its id). */
export function lessonSlug(lesson: Pick<Lesson, "id">): string {
  return LESSON_SLUGS[lesson.id] ?? lesson.id;
}

/** Resolve a lesson by either its slug or its internal id. */
export function getLesson(idOrSlug: string): Lesson | undefined {
  const id = SLUG_TO_ID[idOrSlug] ?? idOrSlug;
  return LESSONS.find((l) => l.id === id);
}

/** Returns the ordered runtime steps for a lesson: theory, the 5 tasks, summary. */
export function lessonStepCount(lesson: Lesson): number {
  // theory + tasks + summary
  return 1 + lesson.tasks.length + 1;
}

export function getTask(lesson: Lesson, index: number): Task | undefined {
  return lesson.tasks[index];
}
