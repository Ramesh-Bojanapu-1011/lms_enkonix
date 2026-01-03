import Calendar from '@/components/Calendar';
import Sidebar from '@/components/Sidebar';
import TabBar from '@/components/TabBar';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Menu, // Added for mobile menu
  Search,
  Target,
  X, // Added for closing mobile menu
} from 'lucide-react';
import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: number]: number;
  }>({});

  const resources = [
    { name: 'Auto-layout.pdf', size: '4.5 Mb', type: 'pdf', color: 'red' },
    { name: 'Designz_file.png', size: '3.2 Mb', type: 'image', color: 'green' },
    { name: 'Reusez_gr_v2.fig', size: '2.5 Mb', type: 'fig', color: 'blue' },
  ];

  const handleDownload = (index: number) => {
    if (downloadProgress[index] !== undefined) {
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });
      return;
    }
    setDownloadProgress((prev) => ({ ...prev, [index]: 0 }));
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        const currentProgress = prev[index];
        if (currentProgress >= 100) {
          clearInterval(interval);
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        }
        return { ...prev, [index]: currentProgress + 10 };
      });
    }, 300);
  };

  const todoList = [
    {
      task: 'Human Interaction Designs',
      date: 'Tuesday, 30 June 2024',
      completed: false,
    },
    {
      task: 'Design system Basics',
      date: 'Monday, 24 June 2024',
      completed: false,
    },
    {
      task: 'Introduction to UI',
      date: 'Friday, 10 June 2024',
      completed: true,
    },
    { task: 'Basics of Figma', date: 'Friday, 06 June 2024', completed: true },
  ];

  const classes = [
    {
      name: 'User Experience (UX) Design',
      hours: '5:30hrs',
      lessons: '05 Lessons',
      active: true,
    },
    {
      name: 'Visual Design and Branding',
      hours: '4:00hrs',
      lessons: '03 Lessons',
      active: false,
    },
  ];

  const upcomingLessons = [
    { name: 'UX Design Fundamentals', time: '5:30pm' },
    { name: 'Interaction Design', time: '9:00pm' },
  ];

  const hoursData = [
    { month: 'Jan', study: 45, onlineTest: 20 },
    { month: 'Feb', study: 35, onlineTest: 15 },
    { month: 'Mar', study: 60, onlineTest: 25 },
    { month: 'Apr', study: 40, onlineTest: 18 },
    { month: 'May', study: 25, onlineTest: 12 },
  ];

  return (
    <>
      <Head>
        <title>LMS Dashboard - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar - Responsive handling */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <Sidebar />
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">ESS Student Hub</span>
            <div className="w-8" /> {/* Placeholder for balance */}
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-4xl flex gap-2 items-center font-bold text-gray-800 mb-2">
                Hello Harsh <span className="">👋</span>
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Let's learn something new today!
              </p>
            </div>

            {/* Top Row - Stack on mobile, 3 cols on large */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Recent Enrolled Course */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Recent enrolled course
                </h3>
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                    <svg
                      className="text-orange-500"
                      width={30}
                      height={30}
                      viewBox="0 0 512 512"
                    >
                      <path
                        fill="currentColor"
                        d="M167.02 309.34c-40.12 2.58-76.53 17.86-97.19 72.3c-2.35 6.21-8 9.98-14.59 9.98c-11.11 0-45.46-27.67-55.25-34.35C0 439.62 37.93 512 128 512c75.86 0 128-43.77 128-120.19c0-3.11-.65-6.08-.97-9.13zM457.89 0c-15.16 0-29.37 6.71-40.21 16.45C213.27 199.05 192 203.34 192 257.09c0 13.7 3.25 26.76 8.73 38.7l63.82 53.18c7.21 1.8 14.64 3.03 22.39 3.03c62.11 0 98.11-45.47 211.16-256.46c7.38-14.35 13.9-29.85 13.9-45.99C512 20.64 486 0 457.89 0"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Product Design Course
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <span className="ml-3 text-xs font-semibold text-orange-500 whitespace-nowrap">
                      14/30 Tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Resources */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Your Resources
                </h3>
                <div className="space-y-4">
                  {resources.map((resource, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            resource.color === 'red'
                              ? 'bg-red-50'
                              : resource.color === 'green'
                                ? 'bg-green-50'
                                : 'bg-blue-50'
                          }`}
                        >
                          <BookOpen
                            size={18}
                            className={
                              resource.color === 'red'
                                ? 'text-red-500'
                                : resource.color === 'green'
                                  ? 'text-green-500'
                                  : 'text-blue-500'
                            }
                          />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {resource.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {resource.size}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(idx)}
                        className="text-xs font-semibold text-orange-500 hover:text-orange-600 ml-2"
                      >
                        {downloadProgress[idx] !== undefined
                          ? `${downloadProgress[idx]}%`
                          : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar - Full width on tablet, 1/3 on desktop */}
              <div className="md:col-span-2 lg:col-span-1">
                <Calendar />
              </div>
            </div>

            {/* Middle Row - Stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Hours Spent */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Hours Spent
                </h3>
                <div className="relative h-48 w-full">
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-full px-2">
                    {hoursData.map((data, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center flex-1"
                      >
                        <div className="flex group gap-1 items-end w-full px-1">
                          {/* tooltip */}
                          <div>
                            <div className="absolute -top-6 w-16 p-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity text-center">
                              Study: {data.study} hrs
                              <br />
                              Online Test: {data.onlineTest} hrs
                            </div>
                          </div>
                          <div
                            className="bg-orange-500 rounded-t w-1/2"
                            style={{ height: `${data.study * 1.5}px` }}
                          ></div>
                          <div
                            className="bg-orange-200 rounded-t w-1/2"
                            style={{ height: `${data.onlineTest * 1.5}px` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Performance
                  </h3>
                  <select className="text-[10px] border border-gray-200 rounded px-2 py-1">
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg
                      className="transform -rotate-90"
                      width="100"
                      height="100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#FED7AA"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#F97316"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251"
                        strokeDashoffset="50"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xl font-bold text-gray-800">
                      8.9
                    </span>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Assignment Submission Grade
                  </p>
                </div>
              </div>

              {/* To Do List */}
              <div className="md:col-span-2 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  To do List
                </h3>
                <div className="space-y-3">
                  {todoList.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`mt-1 shrink-0 ${
                          item.completed ? 'text-orange-500' : 'text-gray-300'
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Circle size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            item.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-800'
                          }`}
                        >
                          {item.task}
                        </p>
                        <p className="text-[10px] text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row - Classes and Lessons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Recent Enrolled Classes
                  </h3>
                  <Search size={18} className="text-gray-400" />
                </div>
                <div className="space-y-3">
                  {classes.map((cls, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        cls.active
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            cls.active ? 'bg-white' : 'bg-gray-100'
                          }`}
                        >
                          <BookOpen
                            className={
                              cls.active ? 'text-orange-500' : 'text-gray-400'
                            }
                            size={20}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              cls.active ? 'text-orange-500' : 'text-gray-800'
                            }`}
                          >
                            {cls.name}
                          </h4>
                          <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {cls.hours}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen size={12} /> {cls.lessons}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Upcoming Lessons
                </h3>
                <div className="space-y-3">
                  {upcomingLessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-100 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                          <Circle size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">
                            {lesson.name}
                          </h4>
                          <p className="text-[10px] text-gray-500">
                            {lesson.time}
                          </p>
                        </div>
                      </div>
                      <button className="bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
