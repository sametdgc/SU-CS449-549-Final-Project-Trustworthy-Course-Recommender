import { type EnrichedCourse, minutesToTime } from "@/data/utils";
import { cn } from "@/lib/utils";
import { Clock, BookOpen, GraduationCap } from "lucide-react";

interface WeeklyScheduleProps {
  selectedCourses: EnrichedCourse[];
  onRemoveCourse: (course: EnrichedCourse) => void;
  maxCredits?: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const START_HOUR = 8; // 8 AM
const END_HOUR = 20; // 8 PM
const HOUR_HEIGHT = 60; // pixels per hour

// Color palette for courses
const COURSE_COLORS = [
  'bg-indigo-100 border-indigo-400 text-indigo-900',
  'bg-emerald-100 border-emerald-400 text-emerald-900',
  'bg-amber-100 border-amber-400 text-amber-900',
  'bg-rose-100 border-rose-400 text-rose-900',
  'bg-cyan-100 border-cyan-400 text-cyan-900',
  'bg-violet-100 border-violet-400 text-violet-900',
  'bg-orange-100 border-orange-400 text-orange-900',
  'bg-teal-100 border-teal-400 text-teal-900',
];

export const WeeklySchedule = ({ selectedCourses, onRemoveCourse, maxCredits = 20 }: WeeklyScheduleProps) => {
  // Calculate total credits
  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);

  // Create a color map for courses
  const courseColorMap = new Map<string, string>();
  selectedCourses.forEach((course, index) => {
    courseColorMap.set(course.crn, COURSE_COLORS[index % COURSE_COLORS.length]);
  });

  // Generate hour labels
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  // Get course blocks for each day
  const getCourseBlocksForDay = (dayIndex: number) => {
    const blocks: Array<{
      course: EnrichedCourse;
      startMinutes: number;
      endMinutes: number;
      top: number;
      height: number;
    }> = [];

    for (const course of selectedCourses) {
      for (const slot of course.timeSlots) {
        if (slot.dayIndex === dayIndex) {
          const startFromTop = slot.startMinutes - START_HOUR * 60;
          const duration = slot.endMinutes - slot.startMinutes;
          
          blocks.push({
            course,
            startMinutes: slot.startMinutes,
            endMinutes: slot.endMinutes,
            top: (startFromTop / 60) * HOUR_HEIGHT,
            height: (duration / 60) * HOUR_HEIGHT,
          });
        }
      }
    }

    return blocks;
  };

  if (selectedCourses.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700">No Courses Selected</h3>
            <p className="text-sm text-slate-500 mt-1">
              Select courses from the list to build your weekly schedule
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header with total credits */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Weekly Schedule</h2>
              <p className="text-indigo-200 text-sm">{selectedCourses.length} courses selected</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
            <Clock className="h-4 w-4 text-white" />
            <span className={totalCredits >= maxCredits ? "text-amber-300 font-bold" : "text-white font-bold"}>{totalCredits}</span>
            <span className="text-indigo-200 text-sm">/ {maxCredits} credits</span>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b bg-slate-50">
            <div className="p-3 text-center text-xs font-medium text-slate-500 uppercase">
              Time
            </div>
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-700 border-l">
                {day}
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] relative">
            {/* Hour Labels */}
            <div className="relative">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="border-b border-slate-100 text-xs text-slate-400 pr-2 text-right"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <span className="relative -top-2">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((day, dayIndex) => {
              const blocks = getCourseBlocksForDay(dayIndex);
              
              return (
                <div key={day} className="relative border-l">
                  {/* Hour lines */}
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className="border-b border-slate-100"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Course blocks */}
                  {blocks.map((block, idx) => (
                    <div
                      key={`${block.course.crn}-${idx}`}
                      className={cn(
                        "absolute left-1 right-1 rounded-md border-l-4 p-2 cursor-pointer",
                        "transition-all hover:shadow-md hover:scale-[1.02] hover:z-10",
                        courseColorMap.get(block.course.crn)
                      )}
                      style={{
                        top: block.top,
                        height: Math.max(block.height - 4, 30),
                      }}
                      onClick={() => onRemoveCourse(block.course)}
                      title={`Click to remove ${block.course.code}`}
                    >
                      <div className="h-full overflow-hidden">
                        <p className="font-bold text-xs truncate">{block.course.code}</p>
                        {block.height > 50 && (
                          <p className="text-[10px] opacity-75 truncate mt-0.5">
                            {minutesToTime(block.startMinutes)} - {minutesToTime(block.endMinutes)}
                          </p>
                        )}
                        {block.height > 70 && (
                          <p className="text-[10px] opacity-60 truncate">
                            {block.course.meetings[0]?.location?.split(' ').slice(0, 2).join(' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Legend */}
      <div className="border-t bg-slate-50 px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {selectedCourses.map(course => (
            <div
              key={course.crn}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer",
                "transition-all hover:shadow-sm",
                courseColorMap.get(course.crn)
              )}
              onClick={() => onRemoveCourse(course)}
              title={`Click to remove ${course.code}`}
            >
              <span>{course.code}</span>
              <span className="opacity-60">({course.credits} cr)</span>
              <span className="ml-1 opacity-50 hover:opacity-100">×</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

