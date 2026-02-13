import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unque: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  contacts:[
    {
      type:mongoose.Types.ObjectId,
      ref:"User"
    }
  ],
  joinedGroup:[
    {
        type: mongoose.Types.ObjectId,
        ref:"Group"
    }
  ],
  refreshToken: {
    type: String,
  },
});

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

export const User = mongoose.model("User", userSchema);
