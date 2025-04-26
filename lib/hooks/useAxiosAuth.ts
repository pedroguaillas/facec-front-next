"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { axiosAuth } from "../axios";

const useAxiosAuth = () => {
    const { data: session } = useSession();

    useEffect(() => {
        const requestIntercept = axiosAuth.interceptors.request.use(
            async (config) => {
                // console.log('Config: ', config)
                if (!session?.user?.token) return config;
                // console.log('Token: ', session.user.token);
                config.headers["Authorization"] = `Bearer ${session.user.token}`;

                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = axiosAuth.interceptors.response.use(
            // (response) => response,
            (response) => {
                return new Promise((resolve,) => {
                    setTimeout(() => {
                        resolve(response);
                    }, 2000);
                });
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            axiosAuth.interceptors.response.eject(responseIntercept);
        };
    }, [session]);

    return axiosAuth;
};

export default useAxiosAuth;
