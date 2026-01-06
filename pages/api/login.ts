import type { NextApiRequest, NextApiResponse } from "next";
import user from "@/data/models/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: string;
  };

  //   const loggedInuser = await user.findOne({ email: email });

  //   if (!loggedInuser) {
  //     return res.status(401).json({ error: "Invalid credentials" });
  //   }
  // Provide sensible defaults for local/demo testing
  const defaultEmail = email || "demo@school.edu";
  const defaultPassword = password || "password"; // working demo password
  const defaultRole = (role as string) || "student";

  // Simple mock auth: accept when password === 'password'
  if (defaultPassword !== "password") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Return a fake token and the resolved role/email for demo purposes
  return res.status(200).json({
    success: true,
    token: "fake-jwt-token",
    role: defaultRole,
    email: defaultEmail,
  });
}
