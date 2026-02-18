let server, redirecturl, websocketUrl;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  server = "http://localhost:3006";
  websocketUrl = "ws://localhost:3006";
  redirecturl = "http://localhost:3000";
} else {
  server = "https://crm.pevconnection.com";
  websocketUrl = "wss://crm.pevconnection.com";
  redirecturl = "https://crm.pevconnection.com";
}
let publicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIiOElb8xQ6xXRmBTdVETZBJwjhvFh1D
hZ518mT2i/nB1Urth46bIa2NeAu5evptH6lU15SqoJfWy8BHEZA2pjkCAwEAAQ==
-----END PUBLIC KEY-----`;
let vars = {
  serverUrl: server,
  redirect: redirecturl,
  publicKey: publicKey,
  websocketUrl: websocketUrl,
};
export default vars;
