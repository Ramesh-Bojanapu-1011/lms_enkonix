import { Download, Play } from "lucide-react";
import React from "react";

type Props = {
  recording: {
    id: number;
    title: string;
    image: string;
    course: string;
    videos: { title: string; url: string; duration: string }[];
  };
  key: number;
};

const RecordingCard = (props: Props) => {
  const handleDownload = async (
    videos: { title: string; url: string; duration: string }[],
  ) => {
    if (!videos || videos.length === 0 || typeof window === "undefined") return;

    for (const video of videos) {
      if (!video?.url) continue;

      const safeName = `${video.title || "recording"}.mp4`;

      try {
        const link = document.createElement("a");
        link.href = video.url;
        link.download = safeName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to start download", err);
      }

      try {
        const downloads = JSON.parse(
          localStorage.getItem("downloads-data") || "[]",
        );
        downloads.unshift({
          id: crypto.randomUUID(),
          fileName: safeName,
          fileSize: 0,
          downloadTime: new Date().toISOString(),
          noteTitle: `Recording: ${props.recording.title}`,
        });
        localStorage.setItem("downloads-data", JSON.stringify(downloads));
      } catch (err) {
        console.error("Failed to log download", err);
      }
    }
  };
  /* ⏱ Total duration */
  const totalSeconds = (props.recording.videos || []).reduce((total, video) => {
    if (!video.duration) return total;
    const [min, sec] = video.duration.split(":").map(Number);
    return total + min * 60 + sec;
  }, 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const totalDuration =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")} hrs`
      : `${minutes}m ${seconds}s`;
  return (
    <div
      className="bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     rounded-xl shadow-sm hover:shadow-md
                     transition overflow-hidden"
    >
      {/* Image */}
      <div className="h-36 overflow-hidden">
        <img
          src={props.recording.image}
          alt={props.recording.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {props.recording.title}
        </h3>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex gap-3">
          <span>⏱ {totalDuration}</span>
          <span>
            📘 {props.recording.videos.length} Lesson
            {props.recording.videos.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              window.location.href = `/recording/${props.recording.id}`;
            }}
            className="flex items-center gap-1
                           bg-orange-500 hover:bg-orange-600
                           text-white text-sm px-3 py-1.5
                           rounded-md transition"
          >
            <Play size={14} /> Watch Now
          </button>

          <button
            onClick={() => handleDownload(props.recording.videos)}
            className="flex items-center gap-1
                           text-orange-500 dark:text-orange-400
                           border border-orange-300 dark:border-orange-500
                           px-3 py-1.5 rounded-md
                           hover:bg-orange-50 dark:hover:bg-gray-700
                           transition"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingCard;
