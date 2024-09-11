import { redirect } from "react-router-dom";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  const server = "http://localhost:3006";
  const redirect = "https://api.pevconnection.com";
} else {
  const server = "https://api.pevconnection.com";
  const redirect = "http://localhost:3000";
}
let vars = { serverUrl: server, redirect: redirect };
export default vars;
