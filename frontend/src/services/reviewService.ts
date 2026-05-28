import axios from "axios";

export const fetchProfileReview = async (token: string) => {
  const res = await axios.get(
    "http://localhost:3000/api/users/profile-review",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.review;
};