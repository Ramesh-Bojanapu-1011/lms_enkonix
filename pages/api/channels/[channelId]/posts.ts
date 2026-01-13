import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import Channel from "@/data/models/channel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const { channelId } = req.query;

  if (req.method === "POST") {
    try {
      const { title, content, author } = req.body;

      if (!title || !content || !author) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({ success: false, error: "Channel not found" });
      }

      channel.posts.unshift({
        title,
        content,
        author,
        isPinned: false,
        replies: [],
      });

      await channel.save();

      return res.status(201).json({ success: true, post: channel.posts[0] });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ success: false, error: "Failed to create post" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
