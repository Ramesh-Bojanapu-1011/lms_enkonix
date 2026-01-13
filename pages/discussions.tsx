import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import {
  Menu,
  MessageSquare,
  Plus,
  Search,
  X,
  User,
  Clock,
  Hash,
  Megaphone,
  Code,
  BookOpen,
  Send,
  Sparkles,
  Loader,
  MessageSquareCode,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

type Reply = {
  id: string;
  author: string;
  timestamp: string;
  answer: string;
  explanation?: string;
  sampleCode?: string;
  codeLanguage?: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  createdAt: string;
  replies: Reply[];
  isPinned?: boolean;
};

type Channel = {
  id: string;
  name: string;
  type: "announcement" | "group";
  description: string;
  icon: string;
  posts: Post[];
};

const Discussions = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeChannelId, setActiveChannelId] = useState("announcements");
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  const [channels, setChannels] = useState<Channel[]>([]);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  });

  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    type: "group" as Channel["type"],
  });

  const [newReply, setNewReply] = useState({
    answer: "",
    explanation: "",
    sampleCode: "",
    codeLanguage: "javascript",
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [includeAnswer, setIncludeAnswer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user?.role === "Admin";

  const activeChannel = channels.find((ch) => ch.id === activeChannelId);

  // Fetch channels from API
  useEffect(() => {
    fetchChannels();
  }, []);

  const scrollToLatestMessage = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/channels");
      const data = await response.json();
      if (data.success) {
        const formattedChannels = data.channels.map((ch: any) => ({
          id: ch._id,
          name: ch.name,
          type: ch.type,
          description: ch.description,
          icon: ch.icon,
          posts: ch.posts.map((post: any) => ({
            id: post._id,
            title: post.title,
            content: post.content,
            author: post.author,
            timestamp: formatTimestamp(post.createdAt),
            createdAt: post.createdAt,
            isPinned: post.isPinned,
            replies: post.replies.map((reply: any) => ({
              id: reply._id,
              author: reply.author,
              timestamp: formatTimestamp(reply.createdAt),
              explanation: reply.explanation,
              sampleCode: reply.sampleCode,
              codeLanguage: reply.codeLanguage,
            })),
          })),
        }));
        setChannels(formattedChannels);
        if (formattedChannels.length > 0 && !activeChannelId) {
          setActiveChannelId(formattedChannels[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
    setIsLoading(false);
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "just now";
    if (diffInMins < 60)
      return `${diffInMins} ${diffInMins === 1 ? "minute" : "minutes"} ago`;
    if (diffInHours < 24)
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    if (diffInDays < 7)
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    return createdAt.toLocaleDateString();
  };

  // Auto-generate AI response when a new post is opened in reply modal
  React.useEffect(() => {
    if (showReplyModal && selectedPost && isAutoGenerating === false) {
      const isNewPost = selectedPost.timestamp === "just now";
      const isAnnouncementChannel = activeChannel?.type === "announcement";
      const isAdminOrFaculty =
        user?.role === "Admin" || user?.role === "Faculty";

      // Skip AI generation for admins/faculty in announcement channels
      if (isAnnouncementChannel && isAdminOrFaculty) {
        return;
      }

      if (isNewPost && newReply.explanation === "") {
        setIsAutoGenerating(true);
        setTimeout(() => {
          generateAIExplanation();
          setIsAutoGenerating(false);
        }, 300);
      }
    }
  }, [showReplyModal, selectedPost]);

  useEffect(() => {
    if (activeChannel?.type !== "group") return;
    scrollToLatestMessage();
  }, [activeChannelId, activeChannel?.posts.length]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      alert("Only admins can create channels.");
      return;
    }

    const trimmedName = newChannel.name.trim();
    const trimmedDescription = newChannel.description.trim();

    if (!trimmedName || !trimmedDescription) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          type: newChannel.type,
          description: trimmedDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchChannels(); // Refresh channels from database
        setActiveChannelId(data.channel._id);
        setShowNewChannelModal(false);
        setNewChannel({
          name: "",
          description: "",
          type: "group" as Channel["type"],
        });
      } else {
        alert(data.error || "Failed to create channel");
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`/api/channels/${activeChannelId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          author: user?.name || "Anonymous",
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchChannels(); // Refresh channels from database
        setShowNewPostModal(false);
        setNewPost({ title: "", content: "" });

        // Automatically open reply modal for the new post
        const newPostItem: Post = {
          id: data.post._id,
          title: data.post.title,
          content: data.post.content,
          author: data.post.author,
          timestamp: formatTimestamp(data.post.createdAt),
          createdAt: data.post.createdAt,
          replies: [],
        };

        // setSelectedPost(newPostItem);
        // setShowReplyModal(true);
      } else {
        alert(data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  // Send a chat message in group channels (uses posts API)
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;
    if (activeChannel?.type !== "group") return;
    if (!canChatInGroup()) {
      alert("Chatting in groups is limited to students.");
      return;
    }

    try {
      const title = text.length > 50 ? text.slice(0, 50) + "..." : text;
      const response = await fetch(`/api/channels/${activeChannelId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: text,
          author: user?.name || "Anonymous",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage("");
        await fetchChannels();
        const newPostItem: Post = {
          id: data.post._id,
          title: data.post.title,
          content: data.post.content,
          createdAt: data.post.createdAt,
          author: data.post.author,
          timestamp: formatTimestamp(data.post.createdAt),
          replies: [],
        };
        // Auto-generate and post AI reply for chat messages
        generateAndPostAutoReply(newPostItem);
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  // Generate AI reply and post it to the message thread (group chat)
  const generateAndPostAutoReply = async (post: Post) => {
    try {
      setIsGeneratingAI(true);
      const response = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: post.title, content: post.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI explanation");
      }

      const data = await response.json();
      if (data.success && data.data) {
        const explanationText = `${
          includeAnswer && data.data.answer
            ? `Answer: ${data.data.answer}\n\n`
            : ""
        }${data.data.explanation || ""}`.trim();
        const sampleCodeText = data.data.sampleCode || "";
        const codeLanguageText = data.data.codeLanguage || "javascript";

        const replyRes = await fetch(
          `/api/channels/${activeChannelId}/posts/${post.id}/replies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              author: "AI Assistant",
              explanation: explanationText,
              sampleCode: sampleCodeText,
              codeLanguage: codeLanguageText,
            }),
          }
        );

        const replyData = await replyRes.json();
        if (replyData.success) {
          await fetchChannels();
        }
      } else {
        throw new Error(data.error || "Failed to generate explanation");
      }
    } catch (error) {
      console.error("Error generating/posting AI reply:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canReply()) {
      alert("Only faculty or admins can reply in announcements.");
      return;
    }

    if (!newReply.answer) {
      alert("Please provide an answer");
      return;
    }

    if (!selectedPost) return;

    try {
      const response = await fetch(
        `/api/channels/${activeChannelId}/posts/${selectedPost.id}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: user?.name || "Anonymous",
            answer: newReply.answer,
            explanation: newReply.explanation || "",
            sampleCode: newReply.sampleCode || "",
            codeLanguage: newReply.codeLanguage || "javascript",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchChannels(); // Refresh channels from database
        setShowReplyModal(false);
        setSelectedPost(null);
        setNewReply({
          answer: "",
          explanation: "",
          sampleCode: "",
          codeLanguage: "javascript",
        });
        alert("Reply posted successfully!");
      } else {
        alert(data.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply");
    }
  };

  const sortedPosts = (activeChannel?.posts || []).slice().sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    // Announcements: newest first (reverse chronological)
    // Groups: oldest first for chat continuity
    if (activeChannel?.type === "announcement") {
      return bTime - aTime; // newest first
    }
    return aTime - bTime; // oldest first, latest at bottom
  });

  const filteredPosts = sortedPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canPost = () => {
    if (activeChannel?.type === "announcement") {
      return user?.role === "Faculty" || user?.role === "Admin";
    }
    return true;
  };

  const canReply = () => {
    if (activeChannel?.type === "announcement") {
      return user?.role === "Faculty" || user?.role === "Admin";
    }
    return true;
  };

  // Only students (non-admin/faculty) can chat in group channels
  const canChatInGroup = () => {
    return (
      activeChannel?.type === "group" &&
      !(user?.role === "Admin" || user?.role === "Faculty")
    );
  };

  const generateAIExplanation = async () => {
    if (!selectedPost) return;

    setIsGeneratingAI(true);

    try {
      // Call API to search Google and generate response
      const response = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedPost.title,
          content: selectedPost.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI explanation");
      }

      const data = await response.json();
      console.log("AI Explanation Data:", data);

      if (data.success && data.data) {
        setNewReply({
          answer: data.data.answer,
          explanation: data.data.explanation,
          sampleCode: data.data.sampleCode,
          codeLanguage: data.data.codeLanguage,
        });
      } else {
        throw new Error(data.error || "Failed to generate explanation");
      }
    } catch (error) {
      console.error("Error generating AI explanation:", error);

      // Fallback to local pattern-based response

      alert(
        "Using offline AI mode. For better results, check your internet connection."
      );
    }

    setIsGeneratingAI(false);
  };

  return (
    <>
      <Head>
        <title>Channels | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300  lg:relative lg:translate-x-0  bg-white dark:bg-gray-900 h-screen overflow-y-auto overflow-x-hidden  ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
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
            <span className="font-bold text-orange-500">Channels</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 flex overflow-hidden">
            {/* Channel Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto hidden md:block">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Channels
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewChannelModal(true)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Create channel"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              <div className="p-2">
                {channels
                  .slice()
                  .sort((a, b) => {
                    // Announcements first, then groups
                    if (a.type === "announcement" && b.type === "group") return -1;
                    if (a.type === "group" && b.type === "announcement") return 1;
                    return 0;
                  })
                  .map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                      activeChannelId === channel.id
                        ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {channel.type === "announcement" ? (
                      <Megaphone size={18} />
                    ) : (
                      <Hash size={18} />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{channel.name}</div>
                      {activeChannelId === channel.id && (
                        <div className="text-xs opacity-70 mt-0.5">
                          {channel.posts.length} posts
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {activeChannel?.type === "announcement" ? (
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                        <Megaphone className="text-orange-500" size={24} />
                      </div>
                    ) : (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Hash className="text-blue-500" size={24} />
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {activeChannel?.name}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activeChannel?.description}
                      </p>
                    </div>
                  </div>
                  {activeChannel?.type === "announcement" && canPost() && (
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                    >
                      <Plus size={18} />
                      <span className="hidden sm:inline">New Post</span>
                    </button>
                  )}
                </div>

                <div className="relative mt-4">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {activeChannel?.type === "group" ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {filteredPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare
                          className="mx-auto text-gray-400 mb-3"
                          size={48}
                        />
                        <p className="text-gray-500 dark:text-gray-400">
                          Start the conversation
                        </p>
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <div key={post.id} className="space-y-2">
                          {/* Message bubble */}
                          <div
                            className={`flex ${
                              post.author === (user?.name || "")
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow ${
                                post.author === (user?.name || "")
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              <div className="text-xs opacity-80 mb-1 flex items-center gap-2">
                                <User size={14} />
                                <span className="font-semibold">
                                  {post.author}
                                </span>
                                <span className="opacity-70">
                                  • {post.timestamp}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap wrap-break-word text-sm">
                                {post.content}
                              </div>
                            </div>
                          </div>

                          {/* Replies as follow-up bubbles */}
                          {post.replies.length > 0 && (
                            <div className="space-y-2 pl-8">
                              {post.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex justify-start"
                                >
                                  <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                                    <div className="text-xs opacity-80 mb-1 flex items-center gap-2">
                                      <User size={14} />
                                      <span className="font-semibold">
                                        {reply.author}
                                      </span>
                                      <span className="opacity-70">
                                        • {reply.timestamp}
                                      </span>
                                    </div>
                                      {reply.answer && (
                                        <div className="mb-2">
                                          <div className="text-[11px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">
                                            Answer
                                          </div>
                                          <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                            {reply.answer}
                                          </div>
                                        </div>
                                      )}
                                    {reply.explanation && (
                                        <div className="mb-2">
                                          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">
                                            Explanation
                                          </div>
                                          <div className="whitespace-pre-wrap wrap-break-word leading-relaxed text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                                            {reply.explanation}
                                          </div>
                                        </div>
                                    )}
                                    {reply.sampleCode && (
                                      <div className="mt-2">
                                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-1">
                                            <span>Sample Code</span>
                                            {reply.codeLanguage && (
                                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 text-[10px]">
                                                {reply.codeLanguage}
                                              </span>
                                            )}
                                          </div>
                                          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs border border-gray-800">
                                            <code>{reply.sampleCode}</code>
                                          </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat composer (only for students) */}
                  {canChatInGroup() ? (
                    <form
                      onSubmit={sendMessage}
                      className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || isGeneratingAI}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300"
                        >
                          <Send size={16} />
                          Send
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Chat posting is disabled for Admin and Faculty.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare
                        className="mx-auto text-gray-400 mb-3"
                        size={48}
                      />
                      <p className="text-gray-500 dark:text-gray-400">
                        No posts yet. {canPost() && "Be the first to post!"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                        >
                          {/* Post Header */}
                          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                {post.title}
                                {post.isPinned && (
                                  <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
                                    Pinned
                                  </span>
                                )}
                              </h3>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User size={14} />
                                <span>{post.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{post.timestamp}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                <span>{post.replies.length} replies</span>
                              </div>
                            </div>
                          </div>

                          {/* Replies */}
                          {post.replies.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 space-y-4">
                              {post.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <User
                                      size={16}
                                      className="text-orange-500"
                                    />
                                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                      {reply.author}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {reply.timestamp}
                                    </span>
                                  </div>
                                  {reply.answer && (
                                    <div className="mb-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare
                                          size={14}
                                          className="text-green-500"
                                        />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                          Answer
                                        </span>
                                      </div>
                                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        {reply.answer}
                                      </p>
                                    </div>
                                  )}
                                  {reply.explanation && (
                                    <div className="mb-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <MessageSquareCode
                                          size={14}
                                          className="text-blue-500"
                                        />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                          Reply
                                        </span>
                                      </div>
                                      <div className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-wrap wrap-break-word leading-relaxed bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                                        {reply.explanation}
                                      </div>
                                    </div>
                                  )}
                                  {reply.sampleCode && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Code
                                          size={14}
                                          className="text-purple-500"
                                        />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                          Sample Code
                                        </span>
                                        {reply.codeLanguage && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({reply.codeLanguage})
                                          </span>
                                        )}
                                      </div>
                                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                        <code>{reply.sampleCode}</code>
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Button */}
                          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                            {canReply() ? (
                              <button
                                onClick={() => {
                                  setSelectedPost(post);
                                  setShowReplyModal(true);
                                }}
                                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
                              >
                                <Send size={14} />
                                Reply to this post
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Replies are limited to faculty and admins in
                                announcements.
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Channel Modal */}
        {showNewChannelModal && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Create Channel
                </h2>
                <button
                  onClick={() => {
                    setShowNewChannelModal(false);
                    setNewChannel({
                      name: "",
                      description: "",
                      type: "group" as Channel["type"],
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannel.name}
                    onChange={(e) =>
                      setNewChannel({
                        ...newChannel,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Machine Learning"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newChannel.description}
                    onChange={(e) =>
                      setNewChannel({
                        ...newChannel,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Describe what this channel is for"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Channel Type
                  </label>
                  <select
                    value={newChannel.type}
                    onChange={(e) =>
                      setNewChannel({
                        ...newChannel,
                        type: e.target.value as Channel["type"],
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="group">
                      Group (Students can ask doughts)
                    </option>
                    <option value="announcement">
                      Announcement (faculty/admin post)
                    </option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewChannelModal(false);
                      setNewChannel({
                        name: "",
                        description: "",
                        type: "group" as Channel["type"],
                      });
                    }}
                    className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {activeChannel?.type === "announcement"
                    ? "New Announcement"
                    : "New Question"}
                </h2>
                <button
                  onClick={() => {
                    setShowNewPostModal(false);
                    setNewPost({ title: "", content: "" });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        title: e.target.value,
                      })
                    }
                    placeholder={
                      activeChannel?.type === "announcement"
                        ? "Announcement title..."
                        : "What's your question?"
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        content: e.target.value,
                      })
                    }
                    placeholder={
                      activeChannel?.type === "announcement"
                        ? "Write your announcement here..."
                        : "Describe your question in detail..."
                    }
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewPostModal(false);
                      setNewPost({ title: "", content: "" });
                    }}
                    className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Reply to Post
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedPost.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedPost(null);
                    setNewReply({
                      answer: "",
                      explanation: "",
                      sampleCode: "",
                      codeLanguage: "javascript",
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateReply} className="p-6 space-y-4">
                {/* Answer (Required) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-green-500" />
                      <span>Replay *</span>
                    </div>
                  </label>
                  <textarea
                    value={newReply.explanation}
                    onChange={(e) =>
                      setNewReply({
                        ...newReply,
                        explanation: e.target.value,
                      })
                    }
                    placeholder="Send replay to that announcement"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Give a brief reply to the announcement.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyModal(false);
                      setSelectedPost(null);
                      setNewReply({
                        answer: "",
                        explanation: "",
                        sampleCode: "",
                        codeLanguage: "javascript",
                      });
                    }}
                    className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
                  >
                    <Send size={16} />
                    Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Discussions;
