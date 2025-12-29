import { useState, useMemo } from 'react';
import { getEnrichedCourses, hasConflict, getConflictingCourses, findAlternativeCourses, type EnrichedCourse } from './data/utils';
import { CourseCard } from './components/CourseCard';
import { WeeklySchedule } from './components/WeeklySchedule';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FlaskConical, Calendar, LayoutGrid, Sparkles, GraduationCap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function App() {
  const [courses] = useState<EnrichedCourse[]>(getEnrichedCourses());
  
  // --- EXPERIMENT CONTROLS ---
  const [systemVersion, setSystemVersion] = useState<"A" | "B">("A"); // Default to A (With Explanations)
  
  // --- VIEW MODE ---
  const [viewMode, setViewMode] = useState<"courses" | "schedule">("courses");
  
  // --- FILTERS ---
  const [maxWorkload, setMaxWorkload] = useState([20]); // Slider value
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<EnrichedCourse[]>([]);

  // Calculate total credits
  const MAX_CREDITS = 20;
  const totalCredits = useMemo(() => {
    return selectedCourses.reduce((sum, course) => sum + course.credits, 0);
  }, [selectedCourses]);

  // Check if adding a course would exceed credit limit
  const wouldExceedCredits = (course: EnrichedCourse) => {
    if (isCourseSelected(course)) return false;
    return totalCredits + course.credits > MAX_CREDITS;
  };

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesWorkload = c.workload <= maxWorkload[0];
      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesWorkload && matchesSearch;
    });
  }, [courses, maxWorkload, searchTerm]);

  // Get alternative suggestions when there are conflicts (only courses that fit credit limit)
  const alternativeSuggestions = useMemo(() => {
    if (selectedCourses.length === 0) return [];
    const remainingCredits = MAX_CREDITS - totalCredits;
    const suggestions = findAlternativeCourses(selectedCourses, courses, 10);
    return suggestions.filter(c => c.credits <= remainingCredits).slice(0, 4);
  }, [selectedCourses, courses, totalCredits]);

  // Handle Add/Remove
  const toggleCourse = (course: EnrichedCourse) => {
    setSelectedCourses(prev => {
      const isSelected = prev.some(c => c.crn === course.crn);
      if (isSelected) {
        return prev.filter(c => c.crn !== course.crn);
      } else {
        // Check credit limit before adding
        const currentCredits = prev.reduce((sum, c) => sum + c.credits, 0);
        if (currentCredits + course.credits > MAX_CREDITS) {
          return prev; // Don't add if it exceeds limit
        }
        return [...prev, course];
      }
    });
  };

  // Check if a course is selected
  const isCourseSelected = (course: EnrichedCourse) => {
    return selectedCourses.some(c => c.crn === course.crn);
  };

  // Check if a course has conflict with selected courses
  const getCourseConflict = (course: EnrichedCourse) => {
    if (isCourseSelected(course)) return { hasConflict: false, conflictingCourses: [] };
    const conflicts = getConflictingCourses(course, selectedCourses);
    return { hasConflict: conflicts.length > 0, conflictingCourses: conflicts };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center justify-between px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="font-bold text-lg hidden md:block">Sabanci Course Planner</h1>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <Button
              variant={viewMode === "courses" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("courses")}
              className={cn(
                "gap-2",
                viewMode === "courses" && "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </Button>
            <Button
              variant={viewMode === "schedule" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("schedule")}
              className={cn(
                "gap-2",
                viewMode === "schedule" && "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </Button>
          </div>

          {/* THE EXPERIMENT TOGGLE (Hidden in real production, visible for Demo) */}
          <div className="flex items-center space-x-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
            <FlaskConical className="h-4 w-4 text-slate-500" />
            <Label htmlFor="mode-toggle" className="text-xs font-mono text-slate-600">
              EXP MODE: {systemVersion}
            </Label>
            <Switch 
              id="mode-toggle" 
              checked={systemVersion === "A"}
              onCheckedChange={(checked) => setSystemVersion(checked ? "A" : "B")}
            />
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-8 py-8">
        {viewMode === "schedule" ? (
          // SCHEDULE VIEW
          <div className="space-y-6">
            <WeeklySchedule 
              selectedCourses={selectedCourses}
              onRemoveCourse={toggleCourse}
              maxCredits={MAX_CREDITS}
            />

            {/* Alternative Suggestions when viewing schedule (Only in System A) */}
            {systemVersion === "A" && selectedCourses.length > 0 && alternativeSuggestions.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-slate-800">Suggested Courses (No Conflicts)</h3>
                  <span className="text-sm text-slate-500">— sorted by difficulty: Easy → Medium → Hard</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {alternativeSuggestions.map(course => (
                    <div
                      key={course.crn}
                      className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-slate-50 hover:bg-white"
                      onClick={() => toggleCourse(course)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-indigo-700">{course.code}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            course.difficulty === "Easy" && "bg-green-100 text-green-700",
                            course.difficulty === "Medium" && "bg-blue-100 text-blue-700",
                            course.difficulty === "Hard" && "bg-orange-100 text-orange-700"
                          )}
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{course.name}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <GraduationCap className="h-3 w-3" />
                        <span>{course.credits} credits</span>
                        <span className="mx-1">•</span>
                        <span>{course.workload} hrs/wk</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // COURSES VIEW
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* --- SIDEBAR (FILTERS) --- */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Search</h3>
                  <input 
                    type="text" 
                    placeholder="e.g. CS 412 or AI" 
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-sm">Max Workload</h3>
                    <span className="text-xs text-slate-500">{maxWorkload[0]} hrs/week</span>
                  </div>
                  <Slider 
                    defaultValue={[20]} 
                    max={20} 
                    min={5} 
                    step={1} 
                    value={maxWorkload} 
                    onValueChange={setMaxWorkload} 
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">My Plan</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                      <span className={cn("font-bold", totalCredits >= MAX_CREDITS ? "text-red-600" : "text-indigo-600")}>{totalCredits}</span>
                      <span className="text-slate-500">/ {MAX_CREDITS} credits</span>
                    </div>
                  </div>
                  {/* Credit Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        totalCredits >= MAX_CREDITS ? "bg-red-500" : totalCredits >= MAX_CREDITS - 4 ? "bg-amber-500" : "bg-indigo-600"
                      )}
                      style={{ width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%` }}
                    />
                  </div>
                  {selectedCourses.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No courses selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedCourses.map(course => (
                        <Badge 
                          key={course.crn} 
                          variant="secondary" 
                          className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                          onClick={() => toggleCourse(course)}
                        >
                          {course.code}
                          <span className="ml-1 opacity-60">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Schedule Button */}
                {selectedCourses.length > 0 && (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setViewMode("schedule")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Schedule
                  </Button>
                )}

                {/* Conflict Alert */}
                {selectedCourses.length >= 2 && (() => {
                  // Check if any selected courses conflict with each other
                  for (let i = 0; i < selectedCourses.length; i++) {
                    for (let j = i + 1; j < selectedCourses.length; j++) {
                      if (hasConflict(selectedCourses[i], [selectedCourses[j]])) {
                        return (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-amber-800">
                                <p className="font-medium">Schedule conflicts detected!</p>
                                <p className="mt-1 text-amber-700">Some courses overlap in time.</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                  }
                  return null;
                })()}
              </div>

              {/* Alternative Suggestions in Sidebar (Only in System A) */}
              {systemVersion === "A" && selectedCourses.length > 0 && alternativeSuggestions.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-900">Suggestions</h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">
                    Courses that fit your schedule (easiest first):
                  </p>
                  <div className="space-y-2">
                    {alternativeSuggestions.slice(0, 3).map(course => (
                      <div
                        key={course.crn}
                        className="p-3 bg-white rounded-lg border border-amber-100 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => toggleCourse(course)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-slate-800">{course.code}</span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              course.difficulty === "Easy" && "bg-green-100 text-green-700",
                              course.difficulty === "Medium" && "bg-blue-100 text-blue-700",
                              course.difficulty === "Hard" && "bg-orange-100 text-orange-700"
                            )}
                          >
                            {course.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{course.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* --- MAIN GRID --- */}
            <section className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Available Courses</h2>
                <span className="text-sm text-slate-500">Showing {filteredCourses.length} courses</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map(course => {
                  const { hasConflict: courseHasConflict, conflictingCourses } = getCourseConflict(course);
                  return (
                    <CourseCard 
                      key={course.crn} 
                      course={course} 
                      systemVersion={systemVersion} 
                      onAdd={toggleCourse}
                      isAdded={isCourseSelected(course)}
                      hasConflict={courseHasConflict}
                      conflictingCourses={conflictingCourses}
                      exceedsCredits={wouldExceedCredits(course)}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
