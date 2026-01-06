import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import User from "@/data/models/user";

const allowedRoles = ["Student", "Faculty", "Admin"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    await connectDB();

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // NOTE: For demo purposes the password is stored as-is.
    // In production, hash the password with bcrypt or similar.
    const created = await User.create({ name, email, password, role });

    return res.status(201).json({ success: true, userId: created._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
