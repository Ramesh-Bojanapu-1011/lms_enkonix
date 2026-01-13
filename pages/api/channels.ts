import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import Channel from "@/data/models/channel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const channels = await Channel.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, channels });
    } catch (error) {
      console.error("Error fetching channels:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch channels" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, type, description, icon } = req.body;

      if (!name || !type || !description) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const channel = await Channel.create({
        name,
        type,
        description,
        icon: icon || (type === "announcement" ? "megaphone" : "hash"),
        posts: [],
      });

      return res.status(201).json({ success: true, channel });
    } catch (error: any) {
      console.error("Error creating channel:", error);
      if (error.code === 11000) {
        return res.status(400).json({ success: false, error: "Channel name already exists" });
      }
      return res.status(500).json({ success: false, error: "Failed to create channel" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
