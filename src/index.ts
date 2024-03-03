import { app } from "./config/express";
import { connect } from "./config/db";
import config from "./config/env";

const HOST = config.host!;
const PORT = parseInt(config.port!);

connect();
app.listen(PORT, HOST, () => {
	console.log(`Hestia Backend is running on http://${HOST}:${PORT} 🚀`);
});
