import { connectDB } from "@/data/database/mangodb";
import Course from "@/data/models/course";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const courses = await Course.find().sort({ createdAt: -1 });
      return res.status(200).json(courses);
    }

    if (req.method === "POST") {
      const { title, instructor, students, avgGrade, nextClass } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });

      const course = new Course({
        title,
        instructor,
        students,
        avgGrade,
        nextClass,
      });
      await course.save();
      return res.status(201).json(course);
    }

    if (req.method === "PUT") {
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: "Course id required" });
      const updated = await Course.findByIdAndUpdate(id, data, { new: true });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "Course id required" });
      await Course.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("/api/courses error", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
