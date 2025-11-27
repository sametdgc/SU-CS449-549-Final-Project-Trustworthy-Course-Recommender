import { type EnrichedCourse } from "@/data/utils";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: EnrichedCourse;
  systemVersion: "A" | "B"; // The Experiment Variable
  onAdd: (course: EnrichedCourse) => void;
  isAdded: boolean;
}

export const CourseCard = ({ course, systemVersion, onAdd, isAdded }: CourseCardProps) => {
  
  // Color coding for difficulty
  const difficultyColor = {
    Easy: "bg-green-100 text-green-800 hover:bg-green-200",
    Medium: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Hard: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  };

  return (
    <Card className={cn("w-full transition-all duration-300", isAdded ? "border-green-500 ring-1 ring-green-500 bg-green-50/10" : "hover:shadow-md")}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">{course.code}</CardTitle>
            <CardDescription className="text-md font-medium text-slate-600 mt-1">
              {course.name}
            </CardDescription>
          </div>
          <Badge variant="secondary" className={difficultyColor[course.difficulty]}>
            {course.difficulty}
          </Badge>
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
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{course.meetings[0].instructors.replace(" (P)", "")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>~{course.workload} hrs/week</span>
          </div>
        </div>

        {/* --- SYSTEM A: THE TRUST ELEMENT --- */}
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
          variant={isAdded ? "secondary" : "default"}
          className={cn("w-full", isAdded && "bg-green-600 text-white hover:bg-green-700")}
        >
          {isAdded ? (
            <><CheckCircle2 className="mr-2 h-4 w-4" /> Added to Plan</>
          ) : (
            "Select Course"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};