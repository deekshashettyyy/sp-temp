
import mongoose from "mongoose";

export const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "SkillProof API is running",
    data: {
      database:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",
    },
  });
};
