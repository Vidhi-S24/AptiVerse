import axios from "axios";

export const fetchProfileReview = async (token: string) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const res = await axios.get(
    `${API_URL}/api/users/profile-review`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.review;
};
