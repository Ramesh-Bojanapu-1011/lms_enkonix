import { connectDB } from "@/data/database/mangodb";
import users from "@/data/models/user";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === "GET") {
      await connectDB();
      const all = await users.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ users: all });
    }

    if (req.method === "POST") {
      await connectDB();
      const data = req.body;
      const userDoc = new users(data);
      await userDoc.save();
      console.log("Created user:", userDoc);
      return res.status(200).json({ message: "User created", user: userDoc });
    }

    if (req.method === "PUT") {
      await connectDB();
      const { id, ...updates } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Missing user id" });
      }
      const updated = await users.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User updated", user: updated });
    }

    if (req.method === "DELETE") {
      await connectDB();
      const id =
        (req.body && req.body.id) || (req.query && (req.query.id as string));
      if (!id) {
        return res.status(400).json({ error: "Missing user id" });
      }
      const deleted = await users.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User deleted" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("Error handling users request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
