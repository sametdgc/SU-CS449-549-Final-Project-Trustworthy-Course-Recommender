import rawCourses from '../courses.json';
import metadataRaw from '../courseMetada.json';
import creditsConfig from '../courseConfig.json';

// Type definitions for TypeScript safety
export type CourseRaw = typeof rawCourses[0];
export type CourseMeta = {
  difficulty: "Easy" | "Medium" | "Hard";
  workload: number;
  tags: string[];
  socialReason: string;
};

export type CourseCredits = {
  credits: number;
};

// Time slot for scheduling
export type TimeSlot = {
  day: string;
  startMinutes: number; // Minutes from midnight
  endMinutes: number;
  dayIndex: number;
};

// Merged Type
export type EnrichedCourse = CourseRaw & CourseMeta & CourseCredits & {
  timeSlots: TimeSlot[];
};

// Day mapping
const dayMapping: Record<string, { full: string; index: number }> = {
  'M': { full: 'Monday', index: 0 },
  'T': { full: 'Tuesday', index: 1 },
  'W': { full: 'Wednesday', index: 2 },
  'R': { full: 'Thursday', index: 3 },
  'F': { full: 'Friday', index: 4 },
};

// Parse time string like "12:40 pm" to minutes from midnight
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toLowerCase();
  
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

// Convert minutes to display time
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Parse meeting times to TimeSlot array
const parseMeetingTimes = (meetings: CourseRaw['meetings']): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  for (const meeting of meetings) {
    if (!meeting.time || !meeting.days) continue;
    
    const timeParts = meeting.time.split(' - ');
    if (timeParts.length !== 2) continue;
    
    const startMinutes = parseTimeToMinutes(timeParts[0]);
    const endMinutes = parseTimeToMinutes(timeParts[1]);
    
    // Handle each day in the days string
    for (const dayChar of meeting.days) {
      const dayInfo = dayMapping[dayChar];
      if (dayInfo) {
        slots.push({
          day: dayInfo.full,
          startMinutes,
          endMinutes,
          dayIndex: dayInfo.index,
        });
      }
    }
  }
  
  return slots;
};

// Check if two time slots overlap
export const timeSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  if (slot1.dayIndex !== slot2.dayIndex) return false;
  return slot1.startMinutes < slot2.endMinutes && slot2.startMinutes < slot1.endMinutes;
};

// Check if a course conflicts with selected courses
export const hasConflict = (course: EnrichedCourse, selectedCourses: EnrichedCourse[]): boolean => {
  for (const selected of selectedCourses) {
    for (const slot1 of course.timeSlots) {
      for (const slot2 of selected.timeSlots) {
        if (timeSlotsOverlap(slot1, slot2)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get conflicting courses
export const getConflictingCourses = (course: EnrichedCourse, selectedCourses: EnrichedCourse[]): EnrichedCourse[] => {
  const conflicts: EnrichedCourse[] = [];
  
  for (const selected of selectedCourses) {
    for (const slot1 of course.timeSlots) {
      for (const slot2 of selected.timeSlots) {
        if (timeSlotsOverlap(slot1, slot2)) {
          if (!conflicts.includes(selected)) {
            conflicts.push(selected);
          }
        }
      }
    }
  }
  
  return conflicts;
};

// Difficulty priority for suggestions (Easy = 0, Medium = 1, Hard = 2)
const difficultyPriority: Record<string, number> = {
  'Easy': 0,
  'Medium': 1,
  'Hard': 2,
};

// Find alternative courses that don't conflict, sorted by difficulty (easy first)
export const findAlternativeCourses = (
  selectedCourses: EnrichedCourse[],
  allCourses: EnrichedCourse[],
  maxSuggestions: number = 3
): EnrichedCourse[] => {
  const selectedCRNs = new Set(selectedCourses.map(c => c.crn));
  
  const alternatives = allCourses
    .filter(course => {
      // Exclude already selected courses
      if (selectedCRNs.has(course.crn)) return false;
      // Check for no conflicts
      return !hasConflict(course, selectedCourses);
    })
    .sort((a, b) => {
      // Sort by difficulty: Easy -> Medium -> Hard
      const diffA = difficultyPriority[a.difficulty] ?? 1;
      const diffB = difficultyPriority[b.difficulty] ?? 1;
      if (diffA !== diffB) return diffA - diffB;
      // Secondary sort by workload (lower first)
      return a.workload - b.workload;
    });
  
  return alternatives.slice(0, maxSuggestions);
};

export const getEnrichedCourses = (): EnrichedCourse[] => {
  const metadata = metadataRaw as Record<string, CourseMeta>;
  const credits = creditsConfig as Record<string, CourseCredits>;

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

      const creditInfo = credits[course.code] || { credits: 3 };
      const timeSlots = parseMeetingTimes(course.meetings);

      return { ...course, ...meta, ...creditInfo, timeSlots };
    });
};
