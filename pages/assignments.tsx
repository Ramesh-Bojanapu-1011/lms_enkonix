import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { ChevronLeft, ChevronRight, Menu, Search } from "lucide-react";
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

const assignments: Assignment[] = [
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
];

const Assignments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
                  <h1 className="text-2xl font-bold text-gray-900">
                    Assignments
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    View and manage your course assignments
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                    <Search size={18} className="text-gray-500" />
                    <span>Filter by</span>
                    <button className="text-orange-500 font-semibold hover:opacity-80">
                      dates
                    </button>
                    <span className="text-gray-400">|</span>
                    <button className="text-orange-500 font-semibold hover:opacity-80">
                      Status
                    </button>
                  </div>
                  <div className="sm:hidden flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Search size={18} className="text-gray-400" />
                    <input
                      placeholder="Search..."
                      className="bg-transparent outline-none text-sm w-full"
                    />
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
                  {assignments.map((item, idx) => (
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
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[item.status]
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              statusDot[item.status]
                            }`}
                          ></span>
                          {item.status}
                        </span>
                      </div>
                      <div
                        className={`col-span-1 text-center text-sm font-semibold ${
                          item.submit === "Submitted"
                            ? "text-[#B6B6B6]"
                            : "text-[#727272] cursor-pointer"
                        }`}
                      >
                        {item.submit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards - Mobile */}
              <div className="mt-6 md:hidden space-y-4">
                {assignments.map((item, idx) => (
                  <div
                    key={item.title + idx}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm flex-1 pr-2">
                        {item.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                          statusStyles[item.status]
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            statusDot[item.status]
                          }`}
                        ></span>
                        {item.status}
                      </span>
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
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500 text-xs">Submit:</span>
                        <span
                          className={`text-xs font-semibold ${
                            item.submit === "Submitted"
                              ? "text-[#B6B6B6]"
                              : "text-orange-500 cursor-pointer"
                          }`}
                        >
                          {item.submit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-xs md:text-sm">Show</span>
                  <select className="border border-gray-200 rounded-md px-2 py-1 text-xs md:text-sm bg-white">
                    <option>10</option>
                    <option>20</option>
                    <option>30</option>
                  </select>
                  <span className="text-xs md:text-sm">Row</span>
                </div>

                <div className="flex items-center gap-1 md:gap-2 justify-center flex-wrap">
                  <button className="p-1.5 md:p-2 rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                    <ChevronLeft size={16} />
                  </button>
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded border text-xs md:text-sm font-semibold transition-colors ${
                        page === 1
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="hidden md:inline">
                    {[4, 5].map((page) => (
                      <button
                        key={page}
                        className="w-9 h-9 rounded border text-sm font-semibold transition-colors border-gray-200 text-gray-700 hover:bg-gray-50 ml-2"
                      >
                        {page}
                      </button>
                    ))}
                  </span>
                  <span className="px-1 md:px-2 text-gray-400 text-xs md:text-sm">
                    ...
                  </span>
                  <button className="w-8 h-8 md:w-9 md:h-9 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs md:text-sm">
                    10
                  </button>
                  <button className="p-1.5 md:p-2 rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assignments;
