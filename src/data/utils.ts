import rawCourses from '../courses.json';
import metadataRaw from '../courseMetada.json';

// Type definitions for TypeScript safety
export type CourseRaw = typeof rawCourses[0];
export type CourseMeta = {
  difficulty: "Easy" | "Medium" | "Hard";
  workload: number;
  tags: string[];
  socialReason: string;
};

// Merged Type
export type EnrichedCourse = CourseRaw & CourseMeta;

export const getEnrichedCourses = (): EnrichedCourse[] => {
  const metadata = metadataRaw as Record<string, CourseMeta>;

  return rawCourses
    .filter(course => {
      // Filter out Labs, Recitations, and Thesis (keep only lectures)
      const isLecture = !course.section.includes("R") && !course.section.includes("L");
      const isUndergrad = parseInt(course.code.split(" ")[1]) < 500;
      return isLecture && isUndergrad;
    })
    .map(course => {
      // Find metadata by course code (e.g., "CS 201")
      const meta = metadata[course.code] || {
        difficulty: "Medium",
        workload: 10,
        tags: ["General"],
        socialReason: "Students find this course standard for the curriculum."
      };

      return { ...course, ...meta };
    });
};