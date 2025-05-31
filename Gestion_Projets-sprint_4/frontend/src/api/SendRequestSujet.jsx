import axios from "axios";

// sendSujetRequest.js
export const sendSujetRequest = async (sujetId) => {
  const token = localStorage.getItem("token"); // 🔐 JWT from localStorage

  const response = await axios.post(
    "http://localhost:3000/api/demandes/send",
    { sujetId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Token passed correctly
      },
    }
  );

  return response.data;
};
