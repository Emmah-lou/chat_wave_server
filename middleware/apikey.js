import { supabase } from "../config/supabase";

const apiKeyMiddleware = async (req, resp, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return resp.status(401).json({ error: "API key is required" });
  }
  if (apiKey !== process.env.PIXEL_SECRET) {
    return resp.status(401).json({ error: "API key is invalid" });
  }
  next();
};
export default apiKeyMiddleware;
