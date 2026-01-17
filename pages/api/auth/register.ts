import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import User from "@/data/models/user";

const allowedRoles = ["student", "faculty", "admin"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    email,
    password,
    role,
    phone,
    panId,
    govtIdType,
    govtId,
    interests,
    academicRecords,
  } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string;
    panId?: string;
    govtIdType?: string;
    govtId?: string;
    interests?: string[];
    academicRecords?: {
      tenth?: string;
      tenthSchoolType?: string;
      tenthSchoolName?: string;
      tenthYear?: string;
      inter?: string;
      interSchoolType?: string;
      interSchoolName?: string;
      interYear?: string;
      diploma?: string;
      diplomaSchoolType?: string;
      diplomaSchoolName?: string;
      diplomaYear?: string;
      others?: Array<{
        details: string;
        schoolType: string;
        schoolName: string;
        yearOfPassing?: string;
      }>;
    };
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  // Additional requirements for student registrations
  if (role === "student") {
    if (!phone) {
      return res.status(400).json({ error: "Phone is required for students" });
    }
    if (!panId) {
      return res.status(400).json({ error: "PAN ID is required for students" });
    }
    if (!govtIdType) {
      return res
        .status(400)
        .json({ error: "Government ID Type is required for students" });
    }
    if (!govtId) {
      return res
        .status(400)
        .json({ error: "Government ID is required for students" });
    }
    if (!interests || interests.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one interest domain is required for students" });
    }
    if (
      !academicRecords ||
      !academicRecords.tenth ||
      !academicRecords.tenthSchoolType ||
      !academicRecords.tenthSchoolName ||
      !academicRecords.tenthYear
    ) {
      return res.status(400).json({
        error:
          "Complete 10th standard details including school information are required for students",
      });
    }

    // Check if at least one of Inter or Diploma is provided
    const hasInter =
      academicRecords.inter &&
      academicRecords.interSchoolType &&
      academicRecords.interSchoolName &&
      academicRecords.interYear;
    const hasDiploma =
      academicRecords.diploma &&
      academicRecords.diplomaSchoolType &&
      academicRecords.diplomaSchoolName &&
      academicRecords.diplomaYear;

    if (!hasInter && !hasDiploma) {
      return res.status(400).json({
        error:
          "Please provide complete details for either Inter/12th or Diploma (or both)",
      });
    }
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
    const created = await User.create({
      name,
      email,
      password,
      role,
      phone,
      panId,
      govtIdType,
      govtId,
      interests,
      academicRecords,
    });

    return res.status(201).json({ success: true, userId: created._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
