import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, X } from "lucide-react";
import Head from "next/head";

type Role = "Student" | "Faculty";

type StudentCourse = {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  nextClass?: string;
};

type FacultyCourse = {
  id: string;
  title: string;
  students: number;
  avgGrade: number;
  instructor?: string;
  nextClass?: string;
};

const sampleStudentCourses: StudentCourse[] = [
  {
    id: "c1",
    title: "Introduction to Algorithms",
    instructor: "Dr. Hale",
    progress: 72,
    nextClass: "Jan 12 • 10:00 AM",
  },
  {
    id: "c2",
    title: "Linear Algebra",
    instructor: "Prof. Rivera",
    progress: 45,
    nextClass: "Jan 9 • 2:00 PM",
  },
];

const sampleFacultyCourses: FacultyCourse[] = [
  { id: "f1", title: "Database Systems", students: 34, avgGrade: 8.6 },
  { id: "f2", title: "Operating Systems", students: 28, avgGrade: 7.9 },
];

const Courses: React.FC = () => {
  const [role, setRole] = useState<Role>("Student");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentCourses, setStudentCourses] =
    useState<StudentCourse[]>(sampleStudentCourses);
  const [facultyCourses, setFacultyCourses] =
    useState<FacultyCourse[]>(sampleFacultyCourses);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    title: string;
    instructor: string;
    students: number;
    avgGrade: number;
    nextClass: string;
  } | null>(null);
  const [gradingCourse, setGradingCourse] = useState<{
    id: string;
    title: string;
    student: string;
    grade: number;
  } | null>(null);
  const [resourcesCourse, setResourcesCourse] = useState<{
    id: string;
    title: string;
    notes: string;
  } | null>(null);
  const [viewMaterialsCourse, setViewMaterialsCourse] = useState<{
    id: string;
    title: string;
    notes: string;
    attachmentName?: string;
    attachmentUrl?: string;
  } | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [newCourse, setNewCourse] = useState<{
    title: string;
    instructor: string;
    students: number;
    avgGrade: number;
  }>({ title: "", instructor: "", students: 0, avgGrade: 0 });

  useEffect(() => {
    const storedRole =
      typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (storedRole === "Faculty" || storedRole === "Student") {
      setRole(storedRole);
    }
    // fetch courses from api
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Map to student/faculty shapes
          setFacultyCourses(
            data.map((d: any) => ({
              id: d._id || d.id,
              title: d.title,
              students: d.students || 0,
              avgGrade: d.avgGrade || 0,
              instructor: d.instructor || "",
              nextClass: d.nextClass || "",
            })),
          );
          setStudentCourses(
            data.map((d: any) => ({
              id: d._id || d.id,
              title: d.title,
              instructor: d.instructor || "",
              progress: d.progress || 0,
              nextClass: d.nextClass,
            })),
          );
        }
      })
      .catch((err) => console.error("Failed to load courses", err));
  }, []);

  return (
    <>
      <Head>
        <title>Courses - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <div
          className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">ESS Student Hub</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Courses
                </h1>

                <div className="flex items-center gap-3">
                  {role === "Faculty" && (
                    <button
                      onClick={() => setShowAddCourseModal(true)}
                      className="ml-3 px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                    >
                      Add Course
                    </button>
                  )}
                </div>
              </div>

              {role === "Student" ? (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studentCourses.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {c.title}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {c.instructor}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Progress
                          </div>
                          <div className="text-sm font-semibold text-orange-500">
                            {c.progress}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        {c.nextClass && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Next: {c.nextClass}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                          Join Class
                        </button>
                        <button
                          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg"
                          onClick={() => {
                            try {
                              const materials = JSON.parse(
                                localStorage.getItem("course-materials") ||
                                  "{}",
                              );
                              const courseMaterial = materials[c.id];
                              if (courseMaterial) {
                                setViewMaterialsCourse({
                                  id: c.id,
                                  title: c.title,
                                  notes: courseMaterial.notes || "",
                                  attachmentName: courseMaterial.attachmentName,
                                  attachmentUrl: courseMaterial.attachmentUrl,
                                });
                              } else {
                                setViewMaterialsCourse({
                                  id: c.id,
                                  title: c.title,
                                  notes:
                                    "No materials available for this course yet.",
                                });
                              }
                            } catch (err) {
                              console.error("Failed to load materials", err);
                            }
                          }}
                        >
                          Materials
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              ) : (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {facultyCourses.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {c.title}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {c.students} students
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Avg
                          </div>
                          <div className="text-sm font-semibold text-orange-500">
                            {c.avgGrade}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                          onClick={() => {
                            const studentMatch = studentCourses.find(
                              (s) => s.id === c.id,
                            );
                            setEditingCourse({
                              id: c.id,
                              title: c.title,
                              instructor:
                                c.instructor || studentMatch?.instructor || "",
                              students: c.students,
                              avgGrade: c.avgGrade,
                              nextClass:
                                c.nextClass || studentMatch?.nextClass || "",
                            });
                          }}
                        >
                          Manage
                        </button>
                        <button
                          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg"
                          onClick={() =>
                            setGradingCourse({
                              id: c.id,
                              title: c.title,
                              student: "",
                              grade: 0,
                            })
                          }
                        >
                          Grade
                        </button>
                        <button
                          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg"
                          onClick={() =>
                            setResourcesCourse({
                              id: c.id,
                              title: c.title,
                              notes: "",
                            })
                          }
                        >
                          Add Notes & Files
                        </button>{" "}
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {showAddCourseModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setShowAddCourseModal(false)}
                >
                  <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Add Course
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddCourseModal(false)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close add course"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const payload = {
                            title: newCourse.title || "Untitled Course",
                            instructor: newCourse.instructor || "",
                            students: Number(newCourse.students) || 0,
                            avgGrade: Number(newCourse.avgGrade) || 0,
                          };
                          const res = await fetch("/api/courses", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          const created = await res.json();
                          if (res.ok) {
                            const facultyEntry: FacultyCourse = {
                              id: created._id || created.id,
                              title: created.title,
                              students: created.students || 0,
                              avgGrade: created.avgGrade || 0,
                            };
                            const studentEntry: StudentCourse = {
                              id: created._id || created.id,
                              title: created.title,
                              instructor: created.instructor || "",
                              progress: 0,
                              nextClass: created.nextClass,
                            };
                            setFacultyCourses((prev) => [
                              facultyEntry,
                              ...prev,
                            ]);
                            setStudentCourses((prev) => [
                              studentEntry,
                              ...prev,
                            ]);
                            setNewCourse({
                              title: "",
                              instructor: "",
                              students: 0,
                              avgGrade: 0,
                            });
                            setShowAddCourseModal(false);
                          } else {
                            console.error("Failed to create course", created);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Title
                        </label>
                        <input
                          value={newCourse.title}
                          onChange={(e) =>
                            setNewCourse((s) => ({
                              ...s,
                              title: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Course title"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Instructor
                        </label>
                        <input
                          value={newCourse.instructor}
                          onChange={(e) =>
                            setNewCourse((s) => ({
                              ...s,
                              instructor: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Instructor name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Students
                          </label>
                          <input
                            type="number"
                            value={newCourse.students}
                            onChange={(e) =>
                              setNewCourse((s) => ({
                                ...s,
                                students: Number(e.target.value),
                              }))
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Avg Grade
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={newCourse.avgGrade}
                            onChange={(e) =>
                              setNewCourse((s) => ({
                                ...s,
                                avgGrade: Number(e.target.value),
                              }))
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddCourseModal(false)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {editingCourse && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setEditingCourse(null)}
                >
                  <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Manage Course
                        </p>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {editingCourse.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCourse(null)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close manage course"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const payload = {
                            id: editingCourse.id,
                            title: editingCourse.title || "Untitled Course",
                            instructor: editingCourse.instructor,
                            students: Number(editingCourse.students) || 0,
                            avgGrade: Number(editingCourse.avgGrade) || 0,
                            nextClass: editingCourse.nextClass,
                          };
                          const res = await fetch("/api/courses", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          const updated = await res.json();
                          if (res.ok) {
                            setFacultyCourses((prev) =>
                              prev.map((fc) =>
                                fc.id === editingCourse.id
                                  ? {
                                      ...fc,
                                      title: payload.title,
                                      students: payload.students,
                                      avgGrade: payload.avgGrade,
                                      instructor: payload.instructor,
                                      nextClass: payload.nextClass,
                                    }
                                  : fc,
                              ),
                            );
                            setStudentCourses((prev) =>
                              prev.map((sc) =>
                                sc.id === editingCourse.id
                                  ? {
                                      ...sc,
                                      title: payload.title,
                                      instructor: payload.instructor,
                                      nextClass: payload.nextClass,
                                    }
                                  : sc,
                              ),
                            );
                            setEditingCourse(null);
                          } else {
                            console.error("Failed to update course", updated);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Title
                        </label>
                        <input
                          value={editingCourse.title}
                          onChange={(e) =>
                            setEditingCourse((s) =>
                              s ? { ...s, title: e.target.value } : s,
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Instructor
                        </label>
                        <input
                          value={editingCourse.instructor}
                          onChange={(e) =>
                            setEditingCourse((s) =>
                              s ? { ...s, instructor: e.target.value } : s,
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Students
                          </label>
                          <input
                            type="number"
                            value={editingCourse.students}
                            onChange={(e) =>
                              setEditingCourse((s) =>
                                s
                                  ? { ...s, students: Number(e.target.value) }
                                  : s,
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Avg Grade
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingCourse.avgGrade}
                            onChange={(e) =>
                              setEditingCourse((s) =>
                                s
                                  ? { ...s, avgGrade: Number(e.target.value) }
                                  : s,
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Next Class
                        </label>
                        <input
                          value={editingCourse.nextClass}
                          onChange={(e) =>
                            setEditingCourse((s) =>
                              s ? { ...s, nextClass: e.target.value } : s,
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="e.g. Jan 12 • 10:00 AM"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingCourse(null)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {gradingCourse && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setGradingCourse(null)}
                >
                  <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Grade Course
                        </p>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {gradingCourse.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGradingCourse(null)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close grade course"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // Stubbed persistence; replace with API call when backend exists.
                        setGradingCourse(null);
                      }}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Student
                        </label>
                        <input
                          value={gradingCourse.student}
                          onChange={(e) =>
                            setGradingCourse((s) =>
                              s ? { ...s, student: e.target.value } : s,
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Student name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Grade
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={gradingCourse.grade}
                          onChange={(e) =>
                            setGradingCourse((s) =>
                              s ? { ...s, grade: Number(e.target.value) } : s,
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Score (0-100)"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setGradingCourse(null)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Submit Grade
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {resourcesCourse && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setResourcesCourse(null)}
                >
                  <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Add Resources
                        </p>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {resourcesCourse.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResourcesCourse(null)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close add resources"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          let attachmentUrl = "";
                          let attachmentName = "";
                          if (resourceFile) {
                            const reader = new FileReader();
                            attachmentUrl = await new Promise<string>(
                              (resolve, reject) => {
                                reader.onload = () =>
                                  resolve(String(reader.result));
                                reader.onerror = () => reject(reader.error);
                                reader.readAsDataURL(resourceFile);
                              },
                            );
                            attachmentName = resourceFile.name;
                          }

                          const materials = JSON.parse(
                            localStorage.getItem("course-materials") || "{}",
                          );
                          materials[resourcesCourse.id] = {
                            notes: resourcesCourse.notes,
                            attachmentName,
                            attachmentUrl,
                            updatedAt: new Date().toISOString(),
                          };
                          localStorage.setItem(
                            "course-materials",
                            JSON.stringify(materials),
                          );

                          setResourcesCourse(null);
                          setResourceFile(null);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea
                          value={resourcesCourse.notes}
                          onChange={(e) =>
                            setResourcesCourse((s) =>
                              s ? { ...s, notes: e.target.value } : s,
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                          placeholder="Enter course notes..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Upload File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setResourceFile(file);
                          }}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                        />
                        {resourceFile && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Selected: {resourceFile.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX,
                          XLS, XLSX
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setResourcesCourse(null)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add Resources
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {viewMaterialsCourse && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setViewMaterialsCourse(null)}
                >
                  <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Course Materials
                        </p>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {viewMaterialsCourse.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMaterialsCourse(null)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close materials"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {viewMaterialsCourse.notes}
                        </p>
                      </div>

                      {viewMaterialsCourse.attachmentName && (
                        <div className="space-y-2 rounded-lg border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800/40">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Attachment:</span>
                            <span className="text-gray-600 dark:text-gray-300">
                              {viewMaterialsCourse.attachmentName}
                            </span>
                            {viewMaterialsCourse.attachmentUrl && (
                              <>
                                <a
                                  href={viewMaterialsCourse.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                  Preview
                                </a>
                                <a
                                  href={viewMaterialsCourse.attachmentUrl}
                                  download={viewMaterialsCourse.attachmentName}
                                  onClick={() => {
                                    try {
                                      const downloads = JSON.parse(
                                        localStorage.getItem(
                                          "downloads-data",
                                        ) || "[]",
                                      );
                                      downloads.unshift({
                                        id: crypto.randomUUID(),
                                        fileName:
                                          viewMaterialsCourse.attachmentName ||
                                          "file",
                                        fileSize: 0,
                                        downloadTime: new Date().toISOString(),
                                        noteTitle: viewMaterialsCourse.title,
                                      });
                                      localStorage.setItem(
                                        "downloads-data",
                                        JSON.stringify(downloads),
                                      );
                                    } catch (err) {
                                      console.error(
                                        "Failed to track download",
                                        err,
                                      );
                                    }
                                  }}
                                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                  Download
                                </a>
                              </>
                            )}
                          </div>

                          {viewMaterialsCourse.attachmentUrl &&
                            /\\.(png|jpe?g|gif|webp|svg)$/i.test(
                              viewMaterialsCourse.attachmentName || "",
                            ) && (
                              <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <img
                                  src={viewMaterialsCourse.attachmentUrl}
                                  alt={viewMaterialsCourse.attachmentName}
                                  className="max-h-64 w-full object-contain"
                                />
                              </div>
                            )}
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setViewMaterialsCourse(null)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;
