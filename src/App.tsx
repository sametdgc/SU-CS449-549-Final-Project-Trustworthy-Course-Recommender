import { useState, useMemo } from 'react';
import { getEnrichedCourses, type EnrichedCourse } from './data/utils';
import { CourseCard } from './components/CourseCard';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FlaskConical } from "lucide-react";

function App() {
  const [courses] = useState<EnrichedCourse[]>(getEnrichedCourses());
  
  // --- EXPERIMENT CONTROLS ---
  const [systemVersion, setSystemVersion] = useState<"A" | "B">("A"); // Default to A (With Explanations)
  
  // --- FILTERS ---
  const [maxWorkload, setMaxWorkload] = useState([20]); // Slider value
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

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

  // Handle Add/Remove
  const toggleCourse = (course: EnrichedCourse) => {
    setSelectedCourses(prev => 
      prev.includes(course.crn) 
        ? prev.filter(c => c !== course.crn)
        : [...prev, course.crn]
    );
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

      <main className="container max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
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
              <h3 className="font-semibold mb-2">My Plan</h3>
              {selectedCourses.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No courses selected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedCourses.map(crn => (
                    <Badge key={crn} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      {courses.find(c => c.crn === crn)?.code}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* --- MAIN GRID --- */}
        <section className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Available Courses</h2>
            <span className="text-sm text-slate-500">Showing {filteredCourses.length} courses</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course.crn} 
                course={course} 
                systemVersion={systemVersion} 
                onAdd={toggleCourse}
                isAdded={selectedCourses.includes(course.crn)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;