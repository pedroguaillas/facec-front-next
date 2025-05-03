import axios from "axios";
import { Session } from "next-auth";

// Esta función devuelve una instancia de Axios con el token configurado
const getAxiosAuthServer = (session: Session) => {
    const token = session?.user?.token;

    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api", // Ajusta según tu config
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    return axiosInstance;
};

export default getAxiosAuthServer;
