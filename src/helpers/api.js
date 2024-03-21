import axios from "axios";
import { getDomain } from "./utils";

export const api = axios.create({
    baseURL: getDomain(),
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});
