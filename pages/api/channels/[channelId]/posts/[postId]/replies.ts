import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import Channel from "@/data/models/channel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const { channelId, postId } = req.query;

  if (req.method === "POST") {
    try {
      const { author, explanation, sampleCode, codeLanguage } = req.body;

      if (!author || !explanation) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({ success: false, error: "Channel not found" });
      }

      const post = channel.posts.id(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: "Post not found" });
      }

      post.replies.push({
        author,
        explanation,
        sampleCode,
        codeLanguage,
      });

      await channel.save();

      return res.status(201).json({ success: true, reply: post.replies[post.replies.length - 1] });
    } catch (error) {
      console.error("Error creating reply:", error);
      return res.status(500).json({ success: false, error: "Failed to create reply" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
