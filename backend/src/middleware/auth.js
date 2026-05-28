import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const syncedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { 
        email: user.email, 
        name: user.user_metadata?.name 
      },
      create: {
        id: user.id,
        name: user.user_metadata?.name || "New User",
        email: user.email,
        role: "USER",
      },
    });

    req.user = syncedUser;
    next();
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};