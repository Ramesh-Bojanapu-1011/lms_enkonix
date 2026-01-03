import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { ChevronLeft, ChevronRight, Menu, Plus, Search } from "lucide-react";
import Head from "next/head";
import React from "react";

type AssignmentStatus = "Done" | "Progress" | "Pending";

type Assignment = {
  title: string;
  course: string;
  dueDate: string;
  status: AssignmentStatus;
  submit: "Submitted" | "Upload";
};

const statusStyles: Record<AssignmentStatus, string> = {
  Done: "bg-green-100 text-green-700",
  Progress: "bg-blue-100 text-blue-600",
  Pending: "bg-red-100 text-red-600",
};

const statusDot: Record<AssignmentStatus, string> = {
  Done: "bg-green-500",
  Progress: "bg-blue-500",
  Pending: "bg-red-500",
};

const Assignments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    AssignmentStatus | "All"
  >("All");
  const [monthFilter, setMonthFilter] = React.useState<string>("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [openSubmitDropdown, setOpenSubmitDropdown] = React.useState<
    number | null
  >(null);
  const [openStatusDropdown, setOpenStatusDropdown] = React.useState<
    number | null
  >(null);
  const [newAssignment, setNewAssignment] = React.useState<Assignment>({
    title: "",
    course: "",
    dueDate: "",
    status: "Pending",
    submit: "Upload",
  });

  const [assignments, setAssignments] = React.useState<Assignment[]>([
    {
      title: "Conducting User Research and Personas",
      course: "User Research and Personas",
      dueDate: "July 1, 2024",
      status: "Done",
      submit: "Submitted",
    },
    {
      title: "Competitive Analysis Report",
      course: "Competitive Analysis in UX",
      dueDate: "July 25, 2024",
      status: "Progress",
      submit: "Upload",
    },
    {
      title: "Creating Wireframes",
      course: "Wireframing and Prototyping",
      dueDate: "August 1, 2024",
      status: "Progress",
      submit: "Upload",
    },
    {
      title: "Usability Testing and Findings",
      course: "Usability Testing and Iteration",
      dueDate: "August 22, 2024",
      status: "Pending",
      submit: "Upload",
    },
    {
      title: "Developing Visual Design Language",
      course: "Visual Design and Branding",
      dueDate: "August 29, 2024",
      status: "Pending",
      submit: "Upload",
    },
    {
      title: "Creating a Design System",
      course: "Design Systems and Components",
      dueDate: "September 5, 2024",
      status: "Pending",
      submit: "Upload",
    },
  ]);

  const monthOptions = React.useMemo(() => {
    const months = assignments.map((a) =>
      new Date(a.dueDate).toLocaleString("default", { month: "long" }),
    );
    return ["All", ...Array.from(new Set(months))];
  }, []);

  const filteredAssignments = assignments.filter(
    ({ title, course, status, submit, dueDate }) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        course.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query) ||
        submit.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "All" || status === statusFilter;

      const dueMonth = new Date(dueDate).toLocaleString("default", {
        month: "long",
      });
      const matchesMonth = monthFilter === "All" || dueMonth === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    },
  );

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleAssignmentChange = (field: keyof Assignment, value: string) => {
    setNewAssignment((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title.trim() || !newAssignment.course.trim()) return;
    setAssignments((prev) => [...prev, newAssignment]);
    setShowAddModal(false);
    setNewAssignment({
      title: "",
      course: "",
      dueDate: "",
      status: "Pending",
      submit: "Upload",
    });
  };

  const handleSubmitChange = (
    index: number,
    newSubmit: "Submitted" | "Upload",
  ) => {
    const actualIndex = startIndex + index;
    setAssignments((prev) =>
      prev.map((item, idx) =>
        idx === actualIndex ? { ...item, submit: newSubmit } : item,
      ),
    );
    setOpenSubmitDropdown(null);
  };

  const handleStatusChange = (index: number, newStatus: AssignmentStatus) => {
    const actualIndex = startIndex + index;
    setAssignments((prev) =>
      prev.map((item, idx) =>
        idx === actualIndex ? { ...item, status: newStatus } : item,
      ),
    );
    setOpenStatusDropdown(null);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, monthFilter]);

  return (
    <>
      <Head>
        <title>Assignments - LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2">
              <Menu size={24} />
            </button>
            <span className="font-bold">Assignments</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4  ">
            <div className="bg-white       p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className=" flex w-full  gap-2.5 items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Assignments
                    </h1>
                    <button
                      type="button"
                      aria-label="Add assignment"
                      onClick={() => setShowAddModal(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-orange-500 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    View and manage your course assignments
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Filter by</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {monthOptions.map((month) => (
                          <option key={month} value={month}>
                            {month === "All" ? "All dates" : month}
                          </option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as AssignmentStatus | "All",
                          )
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="All">All status</option>
                        <option value="Done">Done</option>
                        <option value="Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div className="relative w-64">
                      <Search
                        size={16}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search assignments"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="sm:hidden flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      <Search size={18} className="text-gray-400" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search assignments"
                        className="bg-transparent outline-none text-sm w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {monthOptions.map((month) => (
                          <option key={month} value={month}>
                            {month === "All" ? "All dates" : month}
                          </option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as AssignmentStatus | "All",
                          )
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="All">All status</option>
                        <option value="Done">Done</option>
                        <option value="Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table - Desktop */}
              <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden hidden md:block">
                <div className="bg-gray-50 grid grid-cols-12 text-xs font-semibold text-gray-600 px-4 py-3">
                  <div className="col-span-4">Assignment Title</div>
                  <div className="col-span-3">Course/lessons</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-center">Submit</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {paginatedAssignments.map((item, idx) => (
                    <div
                      key={item.title + idx}
                      className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-4 font-semibold text-gray-800 truncate pr-4">
                        {item.title}
                      </div>
                      <div className="col-span-3 text-gray-600 truncate pr-4">
                        {item.course}
                      </div>
                      <div className="col-span-2 text-gray-600">
                        {item.dueDate}
                      </div>
                      <div className="col-span-2 relative">
                        <button
                          onClick={() =>
                            setOpenStatusDropdown(
                              openStatusDropdown === idx ? null : idx,
                            )
                          }
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                            statusStyles[item.status]
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              statusDot[item.status]
                            }`}
                          ></span>
                          {item.status}
                        </button>
                        {openStatusDropdown === idx && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-35">
                            <button
                              onClick={() => handleStatusChange(idx, "Pending")}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 first:rounded-t-lg flex items-center gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Pending
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(idx, "Progress")
                              }
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Progress
                            </button>
                            <button
                              onClick={() => handleStatusChange(idx, "Done")}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 last:rounded-b-lg flex items-center gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="col-span-1 text-center relative">
                        <button
                          onClick={() =>
                            setOpenSubmitDropdown(
                              openSubmitDropdown === idx ? null : idx,
                            )
                          }
                          className={`text-sm font-semibold px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                            item.submit === "Submitted"
                              ? "text-[#B6B6B6]"
                              : "text-[#727272]"
                          }`}
                        >
                          {item.submit}
                        </button>
                        {openSubmitDropdown === idx && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-35">
                            <button
                              onClick={() => handleSubmitChange(idx, "Upload")}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 first:rounded-t-lg"
                            >
                              Upload
                            </button>
                            <button
                              onClick={() =>
                                handleSubmitChange(idx, "Submitted")
                              }
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 last:rounded-b-lg"
                            >
                              Submitted
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards - Mobile */}
              <div className="mt-6 md:hidden space-y-4">
                {paginatedAssignments.map((item, idx) => (
                  <div
                    key={item.title + idx}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm flex-1 pr-2">
                        {item.title}
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenStatusDropdown(
                              openStatusDropdown === idx ? null : idx,
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${
                            statusStyles[item.status]
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              statusDot[item.status]
                            }`}
                          ></span>
                          {item.status}
                        </button>
                        {openStatusDropdown === idx && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32.5">
                            <button
                              onClick={() => handleStatusChange(idx, "Pending")}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700 first:rounded-t-lg flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Pending
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(idx, "Progress")
                              }
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Progress
                            </button>
                            <button
                              onClick={() => handleStatusChange(idx, "Done")}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700 last:rounded-b-lg flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Course:</span>
                        <span className="text-gray-700 font-medium text-xs">
                          {item.course}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Due Date:</span>
                        <span className="text-gray-700 text-xs">
                          {item.dueDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 relative">
                        <span className="text-gray-500 text-xs">Submit:</span>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenSubmitDropdown(
                                openSubmitDropdown === idx ? null : idx,
                              )
                            }
                            className={`text-xs font-semibold px-2 py-1 rounded hover:bg-gray-100 ${
                              item.submit === "Submitted"
                                ? "text-[#B6B6B6]"
                                : "text-orange-500"
                            }`}
                          >
                            {item.submit}
                          </button>
                          {openSubmitDropdown === idx && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-35">
                              <button
                                onClick={() =>
                                  handleSubmitChange(idx, "Upload")
                                }
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 first:rounded-t-lg"
                              >
                                Upload
                              </button>
                              <button
                                onClick={() =>
                                  handleSubmitChange(idx, "Submitted")
                                }
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 last:rounded-b-lg"
                              >
                                Submitted
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-xs md:text-sm">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-md px-2 py-1 text-xs md:text-sm bg-white"
                  >
                    <option>10</option>
                    <option>20</option>
                    <option>30</option>
                  </select>
                  <span className="text-xs md:text-sm">Row</span>
                </div>

                <div className="flex items-center gap-1 md:gap-2 justify-center flex-wrap">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 md:p-2 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from(
                    { length: Math.min(3, totalPages) },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded border text-xs md:text-sm font-semibold transition-colors ${
                        page === currentPage
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 3 && (
                    <>
                      <span className="px-1 md:px-2 text-gray-400 text-xs md:text-sm">
                        ...
                      </span>
                      {totalPages > 4 && (
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-8 h-8 md:w-9 md:h-9 rounded border text-xs md:text-sm font-semibold transition-colors ${
                            totalPages === currentPage
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 md:p-2 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Add Assignment Modal */}
              {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Add New Assignment
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                        aria-label="Close modal"
                      >
                        <Search size={16} className="rotate-45" />
                      </button>
                    </div>
                    <form
                      onSubmit={handleAddAssignment}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Assignment Title *
                        </label>
                        <input
                          value={newAssignment.title}
                          onChange={(e) =>
                            handleAssignmentChange("title", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter assignment title"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Course/Lesson *
                        </label>
                        <input
                          value={newAssignment.course}
                          onChange={(e) =>
                            handleAssignmentChange("course", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter course name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={newAssignment.dueDate}
                            onChange={(e) =>
                              handleAssignmentChange("dueDate", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Status
                          </label>
                          <select
                            value={newAssignment.status}
                            onChange={(e) =>
                              handleAssignmentChange(
                                "status",
                                e.target.value as AssignmentStatus,
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Submission Status
                        </label>
                        <select
                          value={newAssignment.submit}
                          onChange={(e) =>
                            handleAssignmentChange(
                              "submit",
                              e.target.value as "Submitted" | "Upload",
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Upload">Upload</option>
                          <option value="Submitted">Submitted</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add Assignment
                        </button>
                      </div>
                    </form>
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

export default Assignments;
