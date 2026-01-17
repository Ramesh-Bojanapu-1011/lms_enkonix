import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "faculty", "student"],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  panId: {
    type: String,
    required: false,
  },
  govtIdType: {
    type: String,
    required: false,
  },
  govtId: {
    type: String,
    required: false,
  },
  interests: {
    type: [String],
    required: false,
  },
  academicRecords: {
    tenth: { type: String, required: false },
    tenthSchoolType: { type: String, required: false },
    tenthSchoolName: { type: String, required: false },
    tenthYear: { type: String, required: false },
    inter: { type: String, required: false },
    interSchoolType: { type: String, required: false },
    interSchoolName: { type: String, required: false },
    interYear: { type: String, required: false },
    diploma: { type: String, required: false },
    diplomaSchoolType: { type: String, required: false },
    diplomaSchoolName: { type: String, required: false },
    diplomaYear: { type: String, required: false },
    others: [
      {
        details: { type: String },
        schoolType: { type: String },
        schoolName: { type: String },
        yearOfPassing: { type: String },
      },
    ],
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
