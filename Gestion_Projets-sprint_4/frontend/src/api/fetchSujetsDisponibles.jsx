import axios from 'axios';

export const fetchSujetsDisponibles = async ({ keywords = '', niveau }) => {
  try {
    const response = await axios.get('http://localhost:3000/sujets-disponibles', {
      params: {
        keywords,
        niveau
      },
      withCredentials: true // 🔥 VERY IMPORTANT: send cookies (JWT) to backend
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des sujets disponibles:', error);
    throw error;
  }
};