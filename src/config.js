let server, redirecturl;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  server = "http://localhost:3006";
  redirecturl = "http://localhost:3000";
} else {
  server = "https://crm.pevconnection.com";
  redirecturl = "https://crm.pevconnection.com";
}
let vars = { serverUrl: server, redirect: redirecturl };
export default vars;
