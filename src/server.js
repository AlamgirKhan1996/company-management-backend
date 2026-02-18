import app from "./app.js";
import env from "./config/env.js";
const PORT = env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`));
export default app;

console.log("DB_URL:", process.env.DATABASE_URL);