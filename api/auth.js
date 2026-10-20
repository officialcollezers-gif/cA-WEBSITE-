import { endpoint, body, sameOrigin, fail } from "../server/http.js";
import {
  readSession,
  verifyGoogle,
  sessionToken,
  setSession,
} from "../server/auth.js";
export default endpoint(async (req, res) => {
  if (req.method === "GET")
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      user: readSession(req)?.email || null,
    };
  sameOrigin(req);
  if (req.method === "DELETE") {
    setSession(res, "", true);
    return { ok: true };
  }
  if (req.method !== "POST") fail(405, "Method not allowed.");
  const data = await body(req);
  const email = await verifyGoogle(data.credential);
  setSession(res, sessionToken(email));
  return { user: email };
});
