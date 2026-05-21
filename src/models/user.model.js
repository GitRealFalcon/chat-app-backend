import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 180,
    },
    password: {
      type: String,
      required: true,
    },
    block: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    verificationCode: {
      type: Number,
    },
    verificationExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeenAt: {
      type: Date,
    },
    privacy: {
      lastSeen: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      profilePhoto: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      about: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
    },
    chats: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    joinedGroup: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Group",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.index({ isOnline: 1, lastSeenAt: -1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (currentPassword) {
  return await bcrypt.compare(currentPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return JWT.sign(
    { id: this._id, name: this.name, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return JWT.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.refreshToken;
  delete user.verificationCode;
  delete user.verificationExpiry;

  return user;
};

export const User = mongoose.model("User", userSchema);
