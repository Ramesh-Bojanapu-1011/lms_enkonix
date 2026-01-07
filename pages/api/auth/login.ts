import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import users from "@/data/models/users";

type User = {
  email: string;
  role: "Admin" | "Faculty" | "Student";
  name: string;
};

type ResponseData = {
  success?: boolean;
  user?: User;
  token?: string;
  error?: string;
};

// Role mapping from database/demo values to frontend values
const roleMap: Record<string, "Admin" | "Faculty" | "Student"> = {
  admin: "Admin",
  user: "Faculty",
  guest: "Student",
};

// Demo/fallback credentials
const demoUsers: Record<
  string,
  { password: string; role: "admin" | "user" | "guest"; name: string }
> = {
  "admin@gmail.com": { password: "1234", role: "admin", name: "Admin User" },
  "faculty@gmail.com": { password: "1111", role: "user", name: "Faculty User" },
  "student@gmail.com": {
    password: "1212",
    role: "guest",
    name: "Student User",
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Query database for user
    const user = await users.findOne({ email: email.toLowerCase() });

    let userData: any;

    if (user) {
      // User found in database - compare password
      if (password !== user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      userData = {
        email: user.email,
        role: roleMap[user.role] || "Student",
        name: user.name,
      };
    } else {
      // User not found in DB - check demo/fallback credentials
      const demoUser = demoUsers[email.toLowerCase()];
      if (!demoUser || password !== demoUser.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      userData = {
        email: email.toLowerCase(),
        role: roleMap[demoUser.role] || "Student",
        name: demoUser.name,
      };
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

    return res.status(200).json({
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
