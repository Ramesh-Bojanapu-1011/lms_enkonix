import Sidebar from '@/components/Sidebar';
import TabBar from '@/components/TabBar';
import { Menu, Search } from 'lucide-react';
import Head from 'next/head';
import React from 'react';

const Assignments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const assignments = [
    {
      title: 'Conducting User Resea...',
      course: 'User Research',
      dueDate: 'July 1, 2024',
      status: 'Done',
    },
    {
      title: 'Competitive Analysis',
      course: 'Market Analysis',
      dueDate: 'July 25, 2024',
      status: 'Progress',
    },
    {
      title: 'Creating Wireframes',
      course: 'Prototyping',
      dueDate: 'Aug 1, 2024',
      status: 'Pending',
    },
  ];

  return (
    <>
      <Head>
        <title>Assignments - LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
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

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
              <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                <Search size={18} className="text-gray-400" />
                <input
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>

            {/* Responsive Table Wrapper */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-150 text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500">
                      TITLE
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500">
                      COURSE
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500">
                      DUE DATE
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-800">
                        {item.title}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.course}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.dueDate}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'Done'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assignments;
