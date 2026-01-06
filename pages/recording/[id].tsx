import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { ArrowLeft, Download, Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";

type Recording = {
  id: number;
  title: string;
  image: string;
  course: string;
  videos: { title: string; url: string; duration: string }[];
};

type Props = {};

const CoursePlayerPage = (props: Props) => {
  const router = useRouter();
  const { id } = router.query;
  const [recording, setRecording] = useState<Recording | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    try {
      const stored = localStorage.getItem("recordings-data");
      if (stored) {
        const recordings: Recording[] = JSON.parse(stored);
        const found = recordings.find((r) => r.id === Number(id));
        if (found) {
          setRecording(found);
        }
      }
    } catch (err) {
      console.error("Failed to load recording", err);
    }
  }, [id]);

  const handleDownload = (video: { title: string; url: string }) => {
    try {
      const link = document.createElement("a");
      link.href = video.url;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const downloads = JSON.parse(
        localStorage.getItem("downloads-data") || "[]",
      );
      downloads.unshift({
        id: crypto.randomUUID(),
        fileName: `${video.title}.mp4`,
        fileSize: 0,
        downloadTime: new Date().toISOString(),
        noteTitle: `Recording: ${recording?.title}`,
      });
      localStorage.setItem("downloads-data", JSON.stringify(downloads));
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (!recording) {
    return (
      <>
        <Head>
          <title>Loading... - ESS Student Hub</title>
        </Head>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  const currentVideo = recording.videos[currentVideoIndex];

  return (
    <>
      <Head>
        <title>{recording.title} - Recording Player</title>
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
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6 flex items-center gap-4">
                <button
                  onClick={() => router.push("/recordings")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <ArrowLeft
                    size={20}
                    className="text-gray-700 dark:text-gray-200"
                  />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {recording.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {recording.course}
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player */}
                <div className="lg:col-span-2">
                  <div className="bg-black rounded-xl overflow-hidden aspect-video">
                    {currentVideo.url.includes("youtube") ? (
                      <iframe
                        src={currentVideo.url.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allowFullScreen
                        title={currentVideo.title}
                      />
                    ) : (
                      <video
                        src={currentVideo.url}
                        controls
                        className="w-full h-full"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>

                  {/* Current Video Info */}
                  <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentVideo.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Duration: {currentVideo.duration}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(currentVideo)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Playlist */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Playlist ({recording.videos.length} videos)
                    </h3>
                    <div className="space-y-2">
                      {recording.videos.map((video, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentVideoIndex(index)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            currentVideoIndex === index
                              ? "bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500"
                              : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  currentVideoIndex === index
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {index + 1}. {video.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {video.duration}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePlayerPage;
