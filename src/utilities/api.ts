import Axios from "axios";

export const isProduction = () => {
    return process.env["NODE_ENV"] === "production";
};

export const getDomain = () => {
    const prodUrl = "https://sopra-fs24-group-26-server.oa.r.appspot.com/";
    const devUrl = "http://localhost:8080";

    return isProduction() ? prodUrl : devUrl;
};

export const api: Axios.AxiosInstance = Axios.create({
    baseURL: getDomain(),
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});
