import { type EnrichedCourse, minutesToTime } from "@/data/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, CheckCircle2, GraduationCap, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: EnrichedCourse;
  systemVersion: "A" | "B"; // The Experiment Variable
  onAdd: (course: EnrichedCourse) => void;
  isAdded: boolean;
  hasConflict?: boolean;
  conflictingCourses?: EnrichedCourse[];
  exceedsCredits?: boolean;
}

export const CourseCard = ({ 
  course, 
  systemVersion, 
  onAdd, 
  isAdded, 
  hasConflict = false,
  conflictingCourses = [],
  exceedsCredits = false
}: CourseCardProps) => {
  
  // Color coding for difficulty
  const difficultyColor = {
    Easy: "bg-green-100 text-green-800 hover:bg-green-200",
    Medium: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Hard: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  };

  // Format schedule times for display
  const getScheduleDisplay = () => {
    if (!course.timeSlots || course.timeSlots.length === 0) {
      return "Schedule TBA";
    }

    const scheduleByDay = new Map<string, string[]>();
    for (const slot of course.timeSlots) {
      const timeStr = `${minutesToTime(slot.startMinutes)} - ${minutesToTime(slot.endMinutes)}`;
      if (!scheduleByDay.has(slot.day)) {
        scheduleByDay.set(slot.day, []);
      }
      scheduleByDay.get(slot.day)!.push(timeStr);
    }

    return Array.from(scheduleByDay.entries())
      .map(([day, times]) => `${day.slice(0, 3)}: ${times.join(', ')}`)
      .join(' | ');
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-300",
      isAdded 
        ? "border-green-500 ring-1 ring-green-500 bg-green-50/10" 
        : exceedsCredits
          ? "border-red-300 bg-red-50/30 opacity-60"
          : hasConflict 
            ? "border-amber-400 bg-amber-50/30" 
            : "hover:shadow-md"
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">{course.code}</CardTitle>
            <CardDescription className="text-md font-medium text-slate-600 mt-1">
              {course.name}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className={difficultyColor[course.difficulty]}>
              {course.difficulty}
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
            >
              <GraduationCap className="w-3 h-3 mr-1" />
              {course.credits} Credits
            </Badge>
          </div>
        </div>
        
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mt-2">
          {course.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-500">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Logistics */}
        <div className="grid grid-cols-1 gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{course.meetings[0]?.instructors?.replace(" (P)", "") || "TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>~{course.workload} hrs/week</span>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">{getScheduleDisplay()}</span>
          </div>
        </div>

        {/* Conflict Warning */}
        {hasConflict && !isAdded && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-amber-800">Schedule Conflict: </span>
              <span className="text-amber-700">
                Overlaps with {conflictingCourses.map(c => c.code).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* --- SYSTEM A: THE TRUST ELEMENT (Enhanced) --- */}
        {systemVersion === "A" && (
          <div className="mt-4 relative overflow-hidden rounded-lg bg-emerald-50/50 border border-emerald-100 p-4 transition-all hover:bg-emerald-50">
            {/* Decorative accent on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
            
            <div className="flex gap-3">
              {/* Eye-catching Icon Container */}
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center ring-1 ring-emerald-200">
                  <Users className="h-4 w-4 text-emerald-700" />
                </div>
              </div>
              
              {/* Text Content */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Student Insight
                </p>
                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  "{course.socialReason}"
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onAdd(course)} 
          variant={isAdded ? "secondary" : hasConflict ? "outline" : "default"}
          disabled={exceedsCredits && !isAdded}
          className={cn(
            "w-full",
            isAdded && "bg-green-600 text-white hover:bg-green-700",
            hasConflict && !isAdded && !exceedsCredits && "border-amber-400 text-amber-700 hover:bg-amber-50",
            exceedsCredits && !isAdded && "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          {isAdded ? (
            <><CheckCircle2 className="mr-2 h-4 w-4" /> Added to Plan</>
          ) : exceedsCredits ? (
            <><AlertTriangle className="mr-2 h-4 w-4" /> Credit Limit Reached</>
          ) : hasConflict ? (
            <><AlertTriangle className="mr-2 h-4 w-4" /> Add Anyway (Conflict)</>
          ) : (
            "Select Course"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
