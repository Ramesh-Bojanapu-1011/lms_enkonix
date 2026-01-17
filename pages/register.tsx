import {
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    panId: "",
    govtIdType: "",
    govtId: "",
    tenth: "",
    tenthSchoolType: "",
    tenthSchoolName: "",
    tenthYear: "",
    hasInter: false,
    inter: "",
    interSchoolType: "",
    interSchoolName: "",
    interYear: "",
    hasDiploma: false,
    diploma: "",
    diplomaSchoolType: "",
    diplomaSchoolName: "",
    diplomaYear: "",
    others: [
      {
        course: "",
        marks: "",
        schoolType: "",
        schoolName: "",
        yearOfPassing: "",
      },
    ],
    interests: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const interestDomains = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "UI/UX Design",
    "DevOps",
    "Blockchain",
    "IoT",
    "Artificial Intelligence",
    "Database Management",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOthersChange = (
    index: number,
    field: "course" | "marks" | "schoolType" | "schoolName" | "yearOfPassing",
    value: string
  ) => {
    const newOthers = [...formData.others];
    newOthers[index] = { ...newOthers[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      others: newOthers,
    }));
  };

  const addOtherRecord = () => {
    setFormData((prev) => ({
      ...prev,
      others: [
        ...prev.others,
        {
          course: "",
          marks: "",
          schoolType: "",
          schoolName: "",
          yearOfPassing: "",
        },
      ],
    }));
  };

  const removeOtherRecord = (index: number) => {
    if (formData.others.length > 1) {
      const newOthers = formData.others.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        others: newOthers,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (
      !formData.phone ||
      !formData.panId ||
      !formData.govtIdType ||
      !formData.govtId
    ) {
      setError("Please provide phone number and ID proofs");
      return;
    }

    if (
      !formData.tenth ||
      !formData.tenthSchoolType ||
      !formData.tenthSchoolName ||
      !formData.tenthYear
    ) {
      setError(
        "Please provide complete 10th standard details including school information"
      );
      return;
    }

    // Check if at least one of Inter or Diploma is selected and filled
    if (!formData.hasInter && !formData.hasDiploma) {
      setError(
        "Please select and complete either Inter/12th or Diploma details"
      );
      return;
    }

    if (
      formData.hasInter &&
      (!formData.inter ||
        !formData.interSchoolType ||
        !formData.interSchoolName ||
        !formData.interYear)
    ) {
      setError(
        "Please provide complete Inter/12th details including school information"
      );
      return;
    }

    if (
      formData.hasDiploma &&
      (!formData.diploma ||
        !formData.diplomaSchoolType ||
        !formData.diplomaSchoolName ||
        !formData.diplomaYear)
    ) {
      setError(
        "Please provide complete Diploma details including institution information"
      );
      return;
    }

    const otherMissingYear = formData.others.some((record) => {
      const hasAnyValue =
        record.course.trim() !== "" ||
        record.marks.trim() !== "" ||
        record.schoolType.trim() !== "" ||
        record.schoolName.trim() !== "";
      return hasAnyValue && record.yearOfPassing.trim() === "";
    });

    if (otherMissingYear) {
      setError(
        "Please add year of passing for each additional academic record you filled"
      );
      return;
    }

    if (formData.interests.length === 0) {
      setError("Please select at least one interest domain");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          interests: formData.interests,
          role: "student",
          phone: formData.phone,
          panId: formData.panId,
          govtIdType: formData.govtIdType,
          govtId: formData.govtId,
          academicRecords: {
            tenth: formData.tenth,
            tenthSchoolType: formData.tenthSchoolType,
            tenthSchoolName: formData.tenthSchoolName,
            tenthYear: formData.tenthYear,
            ...(formData.hasInter && {
              inter: formData.inter,
              interSchoolType: formData.interSchoolType,
              interSchoolName: formData.interSchoolName,
              interYear: formData.interYear,
            }),
            ...(formData.hasDiploma && {
              diploma: formData.diploma,
              diplomaSchoolType: formData.diplomaSchoolType,
              diplomaSchoolName: formData.diplomaSchoolName,
              diplomaYear: formData.diplomaYear,
            }),
            others: formData.others
              .filter(
                (record) =>
                  record.course.trim() !== "" &&
                  record.marks.trim() !== "" &&
                  record.yearOfPassing.trim() !== ""
              )
              .map((record) => ({
                details: `${record.course}: ${record.marks}`,
                schoolType: record.schoolType,
                schoolName: record.schoolName,
                yearOfPassing: record.yearOfPassing,
              })),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to login
        router.push("/login?registered=true");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Student Registration - LMS Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/50">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Student Registration
            </h1>
            <p className="text-gray-400">Join our Learning Management System</p>
          </div>

          {/* Registration Form */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-400" />
                  Basic Information
                </h2>

                {/* Full Name */}
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="student@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="relative">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ID Proofs Section */}
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  ID Proofs
                </h2>

                {/* PAN ID */}
                <div className="relative">
                  <label
                    htmlFor="panId"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    PAN Card Number *
                  </label>
                  <input
                    id="panId"
                    name="panId"
                    type="text"
                    required
                    value={formData.panId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="ABCDE1234F"
                  />
                </div>

                {/* Government ID Type */}
                <div className="relative">
                  <label
                    htmlFor="govtIdType"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Government ID Type *
                  </label>
                  <select
                    id="govtIdType"
                    name="govtIdType"
                    required
                    value={formData.govtIdType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-gray-800">
                      Select ID Type
                    </option>
                    <option value="Aadhaar" className="bg-gray-800">
                      Aadhaar Card
                    </option>
                    <option value="Passport" className="bg-gray-800">
                      Passport
                    </option>
                    <option value="Voter ID" className="bg-gray-800">
                      Voter ID
                    </option>
                    <option value="Driving License" className="bg-gray-800">
                      Driving License
                    </option>
                  </select>
                </div>

                {/* Government ID */}
                <div className="relative">
                  <label
                    htmlFor="govtId"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Government ID Number *
                  </label>
                  <input
                    id="govtId"
                    name="govtId"
                    type="text"
                    required
                    value={formData.govtId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="1234-5678-9012"
                  />
                </div>
              </div>

              {/* Academic Records Section */}
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Academic Records
                </h2>

                {/* 10th Standard */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    10th Standard Details *
                  </label>
                  <input
                    id="tenthSchoolName"
                    name="tenthSchoolName"
                    type="text"
                    required
                    value={formData.tenthSchoolName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="School Name"
                  />
                  <select
                    id="tenthSchoolType"
                    name="tenthSchoolType"
                    required
                    value={formData.tenthSchoolType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-gray-800">
                      Select Board
                    </option>
                    <option value="CBSE" className="bg-gray-800">
                      CBSE Board
                    </option>
                    <option value="State Board" className="bg-gray-800">
                      State Board
                    </option>
                    <option value="ICSE" className="bg-gray-800">
                      ICSE Board
                    </option>
                    <option value="Inter Board" className="bg-gray-800">
                      Inter Board
                    </option>
                    <option value="Other" className="bg-gray-800">
                      Other
                    </option>
                  </select>
                  <input
                    id="tenth"
                    name="tenth"
                    type="text"
                    required
                    value={formData.tenth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Percentage/CGPA (e.g., 95% or 9.5 CGPA)"
                  />
                  <input
                    id="tenthYear"
                    name="tenthYear"
                    type="text"
                    required
                    value={formData.tenthYear}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Year of passing (YYYY)"
                  />
                </div>

                {/* Intermediate/12th */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="hasInter"
                      checked={formData.hasInter}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasInter: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <label
                      htmlFor="hasInter"
                      className="text-sm font-medium text-gray-300"
                    >
                      Intermediate/12th Standard Details
                    </label>
                  </div>

                  {formData.hasInter && (
                    <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                      <input
                        id="interSchoolName"
                        name="interSchoolName"
                        type="text"
                        required={formData.hasInter}
                        value={formData.interSchoolName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="College/School Name"
                      />

                      <select
                        id="interSchoolType"
                        name="interSchoolType"
                        required={formData.hasInter}
                        value={formData.interSchoolType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-gray-800">
                          Select Board
                        </option>
                        <option value="CBSE" className="bg-gray-800">
                          CBSE Board
                        </option>
                        <option value="State Board" className="bg-gray-800">
                          State Board
                        </option>
                        <option value="ICSE" className="bg-gray-800">
                          ICSE Board
                        </option>
                        <option value="Inter Board" className="bg-gray-800">
                          Inter Board
                        </option>
                        <option value="Junior College" className="bg-gray-800">
                          Junior College
                        </option>
                        <option value="Other" className="bg-gray-800">
                          Other
                        </option>
                      </select>
                      <input
                        id="inter"
                        name="inter"
                        type="text"
                        required={formData.hasInter}
                        value={formData.inter}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Percentage/CGPA (e.g., 90% or 9.0 CGPA)"
                      />
                      <input
                        id="interYear"
                        name="interYear"
                        type="text"
                        required={formData.hasInter}
                        value={formData.interYear}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Year of passing (YYYY)"
                      />
                    </div>
                  )}
                </div>

                {/* Diploma */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="hasDiploma"
                      checked={formData.hasDiploma}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasDiploma: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <label
                      htmlFor="hasDiploma"
                      className="text-sm font-medium text-gray-300"
                    >
                      Diploma Details
                    </label>
                  </div>

                  {formData.hasDiploma && (
                    <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                      <input
                        id="diplomaSchoolName"
                        name="diplomaSchoolName"
                        type="text"
                        required={formData.hasDiploma}
                        value={formData.diplomaSchoolName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Institution/Polytechnic Name"
                      />

                      <select
                        id="diplomaSchoolType"
                        name="diplomaSchoolType"
                        required={formData.hasDiploma}
                        value={formData.diplomaSchoolType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-gray-800">
                          Select Institution Type
                        </option>
                        <option
                          value="Government Polytechnic"
                          className="bg-gray-800"
                        >
                          Government Polytechnic
                        </option>
                        <option
                          value="Private Polytechnic"
                          className="bg-gray-800"
                        >
                          Private Polytechnic
                        </option>
                        <option
                          value="Technical Institute"
                          className="bg-gray-800"
                        >
                          Technical Institute
                        </option>
                        <option value="Other" className="bg-gray-800">
                          Other
                        </option>
                      </select>
                      <input
                        id="diploma"
                        name="diploma"
                        type="text"
                        required={formData.hasDiploma}
                        value={formData.diploma}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Percentage/CGPA (e.g., 85% or 8.5 CGPA)"
                      />
                      <input
                        id="diplomaYear"
                        name="diplomaYear"
                        type="text"
                        required={formData.hasDiploma}
                        value={formData.diplomaYear}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Year of passing (YYYY)"
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 italic">
                  * Please select at least one: Intermediate/12th or Diploma (or
                  both if applicable)
                </p>

                {/* Other Academic Records */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Other Academic Records (Bachelor's, Master's, etc.)
                  </label>
                  {formData.others.map((record, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={record.course}
                          onChange={(e) =>
                            handleOthersChange(index, "course", e.target.value)
                          }
                          className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Course Name (e.g., Bachelor's, Master's)"
                        />
                        <input
                          type="text"
                          value={record.marks}
                          onChange={(e) =>
                            handleOthersChange(index, "marks", e.target.value)
                          }
                          className="w-40 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="85% / 8.5 CGPA"
                        />
                        <input
                          type="text"
                          value={record.yearOfPassing}
                          onChange={(e) =>
                            handleOthersChange(
                              index,
                              "yearOfPassing",
                              e.target.value
                            )
                          }
                          className="w-40 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Year (YYYY)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={record.schoolType}
                          onChange={(e) =>
                            handleOthersChange(
                              index,
                              "schoolType",
                              e.target.value
                            )
                          }
                          className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="" className="bg-gray-800">
                            Select Institution Type
                          </option>
                          <option value="University" className="bg-gray-800">
                            University
                          </option>
                          <option value="Autonomous" className="bg-gray-800">
                            Autonomous College
                          </option>
                          <option value="Government" className="bg-gray-800">
                            Government College
                          </option>
                          <option value="Private" className="bg-gray-800">
                            Private College
                          </option>
                          <option
                            value="Deemed University"
                            className="bg-gray-800"
                          >
                            Deemed University
                          </option>
                          <option value="Other" className="bg-gray-800">
                            Other
                          </option>
                        </select>
                        <input
                          type="text"
                          value={record.schoolName}
                          onChange={(e) =>
                            handleOthersChange(
                              index,
                              "schoolName",
                              e.target.value
                            )
                          }
                          className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="University/College Name"
                        />
                        {formData.others.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOtherRecord(index)}
                            className="px-4 py-3 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors whitespace-nowrap"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOtherRecord}
                    className="text-sm text-orange-400 hover:text-orange-300 font-medium"
                  >
                    + Add Another Record
                  </button>
                </div>
              </div>

              {/* Interest Domains Section */}
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Interest Domains *
                </h2>
                <p className="text-xs text-gray-400">
                  Select at least one area of interest
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {interestDomains.map((domain) => (
                    <label
                      key={domain}
                      className="flex items-center gap-3 p-3 bg-gray-700/30 border border-gray-600/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(domain)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              interests: [...prev.interests, domain],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              interests: prev.interests.filter(
                                (interest) => interest !== domain
                              ),
                            }));
                          }
                        }}
                        className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">{domain}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-orange-500/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              {/* Login Link */}
              <p className="text-center text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-400 hover:text-orange-300 font-semibold"
                >
                  Login now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
