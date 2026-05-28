const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "ADMIN") {
      next();
    } else {
      return res.status(403).json({ message: "403 FORBIDDEN ACCESS" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "There was a server error checking permissions." });
  }
};

export { isAdmin };