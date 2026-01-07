import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import {
  Menu,
  BookOpen,
  Users,
  Clock,
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

type Course = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  code?: string;
  instructor: string;
  students?: number;
  duration?: string;
  progress?: number;
  status?: "enrolled" | "completed" | "available";
  description?: string;
  semester?: string;
  credits?: number;
  enrolledStudents?: string[];
};

const Courses = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    instructor: "",
    semester: "",
    credits: 3,
  });

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch courses on mount
    fetch("/api/courses", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const formattedCourses = data.data.map((c: any) => ({
            id: c._id,
            _id: c._id,
            title: c.name,
            name: c.name,
            code: c.code,
            instructor: c.instructor,
            students: c.enrolledStudents?.length || 0,
            description: c.description,
            semester: c.semester,
            credits: c.credits,
          }));
          setCourses(formattedCourses);
        }
      })
      .catch((err) => console.error("Failed to fetch courses:", err));
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      (course.title || course.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (course.instructor || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const canCreateCourse = user?.role === "Admin" || user?.role === "Faculty";
  const isAdmin = user?.role === "Admin";

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      instructor: "",
      semester: "",
      credits: 3,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCourse(null);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || course.title || "",
      code: course.code || "",
      description: course.description || "",
      instructor: course.instructor || "",
      semester: course.semester || "",
      credits: course.credits || 3,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCourse(null);
    resetForm();
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.instructor) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingCourse) {
      // Update existing course
      const id = (editingCourse as any)._id || editingCourse.id;
      try {
        const res = await fetch("/api/courses", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user?.role || "",
            "x-user-email": user?.email || "",
          },
          body: JSON.stringify({
            id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCourses((prev) =>
            prev.map((c) =>
              ((c as any)._id || c.id) === id
                ? {
                    ...c,
                    name: data.data.name,
                    title: data.data.name,
                    code: data.data.code,
                    instructor: data.data.instructor,
                    description: data.data.description,
                    semester: data.data.semester,
                    credits: data.data.credits,
                  }
                : c,
            ),
          );
          closeEditModal();
        } else {
          alert(data.error || "Failed to update course");
        }
      } catch (err) {
        console.error("Error updating course:", err);
      }
    } else {
      // Create new course
      try {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.email || "",
            "x-user-role": user?.role || "",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCourses((prev) => [
            ...prev,
            {
              id: data.data._id,
              _id: data.data._id,
              title: data.data.name,
              name: data.data.name,
              code: data.data.code,
              instructor: data.data.instructor,
              students: 0,
              description: data.data.description,
              semester: data.data.semester,
              credits: data.data.credits,
            },
          ]);
          closeCreateModal();
        } else {
          alert(data.error || "Failed to create course");
        }
      } catch (err) {
        console.error("Error creating course:", err);
      }
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm("Delete this course?")) return;
    const id = (course as any)._id || course.id;
    if (!id) return;
    try {
      const res = await fetch("/api/courses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email || "",
          "x-user-role": user?.role || "",
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setCourses((prev) =>
          prev.filter((c) => ((c as any)._id || c.id) !== id),
        );
      } else {
        alert(data.error || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  return (
    <>
      <Head>
        <title>Courses | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 
  transform transition-transform duration-300 
  lg:relative lg:translate-x-0 
  bg-white dark:bg-gray-900
  h-screen overflow-y-auto overflow-x-hidden
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">Courses</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Courses
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Student" &&
                    "Browse and enroll in available courses"}
                  {user?.role === "Faculty" &&
                    "Manage your courses and track student enrollment"}
                  {user?.role === "Admin" &&
                    "Manage all courses and instructors"}
                </p>
              </div>
              {canCreateCourse && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Create Course
                </button>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {showCreateModal && (
              <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Create New Course
                </h3>
                <form onSubmit={handleSaveCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      type="text"
                      placeholder="Course Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Course Code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      type="text"
                      placeholder="Instructor"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                    <input
                      type="text"
                      placeholder="Semester"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 h-20"
                  />
                  <input
                    type="number"
                    placeholder="Credits"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits: parseInt(e.target.value),
                      })
                    }
                    className="px-3 py-2 border rounded dark:bg-gray-800 w-full"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-orange-500 text-white"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showEditModal && editingCourse && (
              <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Edit Course
                </h3>
                <form onSubmit={handleSaveCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      type="text"
                      placeholder="Course Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Course Code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required
                      type="text"
                      placeholder="Instructor"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                    <input
                      type="text"
                      placeholder="Semester"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className="px-3 py-2 border rounded dark:bg-gray-800"
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 h-20"
                  />
                  <input
                    type="number"
                    placeholder="Credits"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits: parseInt(e.target.value),
                      })
                    }
                    className="px-3 py-2 border rounded dark:bg-gray-800 w-full"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-orange-500 text-white"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={(course as any)._id || course.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <BookOpen className="text-orange-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {course.title || course.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.instructor}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Users size={16} />
                      <span>{course.students} students</span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock size={16} />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course.code && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {course.code}
                      </div>
                    )}
                  </div>

                  {user?.role === "Student" &&
                    course.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                  {course.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {course.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {user?.role === "Student" &&
                      course.status === "available" && (
                        <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium">
                          Enroll
                        </button>
                      )}
                    {user?.role === "Student" &&
                      course.status === "enrolled" && (
                        <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                          Continue Learning
                        </button>
                      )}
                    {(user?.role === "Faculty" || user?.role === "Admin") && (
                      <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;
