import { buildCourseUrl } from "@shared/utils";

export function getCourseUrl(id: number, title: string): string {
  return buildCourseUrl(id, title);
}

export function getCourseLessonUrl(courseId: number, courseTitle: string, lessonId: number): string {
  const slug = buildCourseUrl(courseId, courseTitle).split('/').pop();
  return `/courses/${courseId}/${slug}/lessons/${lessonId}`;
}
