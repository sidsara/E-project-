import axios from "axios";

// UpdateSujets.jsx (or your API client)
export const updateSujet = async (id, data) => {
  try {
    const response = await axios.put(
      `http://localhost:3000/update-sujet/${id}`,
      data, // Plain JSON object
      {
        headers: {
          "Content-Type": "application/json", // Standard for JSON
        },
        withCredentials: true, // If using cookies/session-based auth
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Update failed" };
  }
};
