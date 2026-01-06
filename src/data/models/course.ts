import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema({
  title: { type: String, required: true },
  instructor: { type: String },
  students: { type: Number, default: 0 },
  avgGrade: { type: Number, default: 0 },
  nextClass: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
