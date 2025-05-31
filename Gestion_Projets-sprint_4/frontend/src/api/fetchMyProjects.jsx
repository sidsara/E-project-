import axios from 'axios';

const fetchMyProjects = async () => {
  try {
    const response = await axios.get('http://localhost:3000/myProjects', {
      headers: {
        Authorization: `Bearer ${yourAuthToken}`, // or other header if needed
      },
    });

    const projects = response.data.data;
    console.log('My Projects:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching my projects:', error.response?.data || error.message);
    throw error;
  }
};
