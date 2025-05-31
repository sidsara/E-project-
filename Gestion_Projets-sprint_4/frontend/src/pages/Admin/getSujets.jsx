import axios from "axios";

export const getSujets = async () => {
  try {
    const response = await axios.get("http://localhost:3000/sujets"); // Adjust the URL if needed
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets :", error);
    throw error;
  }
};
