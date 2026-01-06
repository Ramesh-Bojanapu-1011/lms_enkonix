import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import Head from "next/head";
import { Menu, X, Trash2, FileText } from "lucide-react";

type Download = {
  id: string;
  fileName: string;
  fileSize: number;
  downloadTime: string;
  noteTitle: string;
};

const DownloadsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [downloads, setDownloads] = useState<Download[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("downloads-data");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDownloads(parsed);
          return;
        }
      }
      setDownloads([]);
    } catch (err) {
      console.error("Failed to load downloads from storage", err);
    }
  }, []);

  const handleDelete = (id: string) => {
    setDownloads((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem("downloads-data", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save downloads", err);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setDownloads([]);
    try {
      localStorage.removeItem("downloads-data");
    } catch (err) {
      console.error("Failed to clear downloads", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <Head>
        <title>Downloads - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
            aria-label="Close menu"
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
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">ESS Student Hub</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Downloads
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your downloaded files and details.
                  </p>
                </div>
                {downloads.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {downloads.length === 0 ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 flex flex-col items-center justify-center gap-4 text-center">
                  <FileText
                    size={48}
                    className="text-gray-300 dark:text-gray-700"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      No Downloads Yet
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      When you download files from notes, they will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloads.map((download) => (
                    <div
                      key={download.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="shrink-0 mt-1">
                          <FileText
                            size={24}
                            className="text-orange-500 dark:text-orange-400"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
                            {download.fileName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {download.noteTitle && (
                              <>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  From:
                                </span>
                                <span>{download.noteTitle}</span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {download.fileSize > 0 && (
                              <span>
                                Size: {formatFileSize(download.fileSize)}
                              </span>
                            )}
                            <span>
                              Downloaded:{" "}
                              {new Intl.DateTimeFormat("en", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(download.downloadTime))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(download.id)}
                        className="shrink-0 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition"
                        aria-label="Delete download"
                        title="Remove from list"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadsPage;
