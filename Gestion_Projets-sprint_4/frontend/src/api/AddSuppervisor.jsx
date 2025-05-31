import axios from "axios";

// Update only the encadrant (leave other fields unchanged)
export const AddSuppervisor = async (id, encadrantEmail) => {
  try {
    const response = await axios.put(
      `http://localhost:3000/update-sujet/${id}`,
      {
        encadrantsEmails: [encadrantEmail], // Send as array
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Update failed" };
  }
};
