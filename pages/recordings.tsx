import RecordingCard from "@/components/RecordingCard";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Search, Menu, X } from "lucide-react";
import React from "react";
import Head from "next/head";

type Props = {};

const recordings = (props: Props) => {
  const [recordings, setRecordings] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const ITEMS_PER_PAGE = 3;

  React.useEffect(() => {
    setCurrentPage(0);
  }, [search]);

  React.useEffect(() => {
    const fetchRecordings = async () => {
      const res = await fetch(
        "https://jsonplaceholder.typicode.com/photos?_limit=6",
      ).then((res) => res.json());
      console.log(res);

      const formattedData = res.map(
        (item: { id: any; title: string | any[] }) => ({
          id: item.id,
          title: item.title.slice(0, 25),
          image:
            "https://cdn.pixabay.com/photo/2020/11/10/21/00/boy-5731001_1280.jpg",
          course: "Demo Course",
          videos: [
            {
              title: "Introduction",
              url: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
              duration: "5:20",
            },
            { title: "Chapter 1", url: "/video/demo.mp4", duration: "12:10" },
            {
              title: "Chapter 2",
              url: "https://www.youtube.com/watch?v=pK-yGAs3bMI",
              duration: "9:45",
            },
          ],
        }),
      );

      setRecordings(formattedData);
      localStorage.setItem("recordings-data", JSON.stringify(formattedData));
    };

    fetchRecordings();
  }, []);

  const filtered = recordings.filter((r: { title: string }) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleRecordings = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <>
      <Head>
        <title>Recordings - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Sidebar */}
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
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Class Recordings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Access and review past class sessions
                </p>
              </div>

              {/* Search */}
              <div className="flex items-center gap-3 mb-6 max-w-md border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-900">
                <Search size={18} className="text-orange-500" />
                <input
                  type="text"
                  placeholder="Filter by course"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleRecordings.map((rec) => (
                  <RecordingCard key={rec} recording={rec} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      currentPage === 0
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      currentPage === totalPages - 1
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default recordings;
