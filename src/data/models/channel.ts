import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    author: {
      type: String,
      required: true,
    },
    answer: String,
    explanation: String,
    sampleCode: String,
    codeLanguage: String,
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["announcement", "group"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "hash",
    },
    posts: [postSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Channel ||
  mongoose.model("Channel", channelSchema);
