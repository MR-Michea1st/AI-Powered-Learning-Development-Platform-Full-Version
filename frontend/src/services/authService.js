import axios from "axios";

export async function login(email, password) {
  try {
    console.log("Logging in with:", email, password);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"; 
    const response = await axios.post(`${apiBaseUrl}/api/token/`, { email , password });
    return response;
    
  } catch (err) {
    console.error("Login Failed because of " , err);
  }
  
}
