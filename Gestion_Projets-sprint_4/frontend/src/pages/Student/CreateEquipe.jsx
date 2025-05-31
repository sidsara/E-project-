import axios from 'axios';

export const createEquipe = async (skillsRequired, userId, token) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/createEquipe', // Adjust to your real backend URL
      { skillsRequired },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,        // If you use custom headers for user auth
          Authorization: `Bearer ${token}`, // If you're using JWTs or session tokens
        },
        withCredentials: true, // optional: if you're using cookies/session
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to create team:', error.response?.data || error.message);
    throw error;
  }
};
