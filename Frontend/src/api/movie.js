import { axiosInstance } from ".";

export const getAllMovies = async () => {
  try {
    const response = await axiosInstance.get("/movies/getAllMovies");
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const updateMovie = async (payload) => {
  try {
    const response = await axiosInstance.patch("/movies/updateMovie", payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const deleteMovie = async (payload) => {
  try {
    const response = await axiosInstance.post("/movies/deleteMovie", payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};