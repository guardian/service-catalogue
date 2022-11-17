import { buildApp } from './app';
import { getConfig } from './config';

const config = getConfig();
const app = buildApp(config);

const PORT = process.env.PORT ?? '3233';
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log(`Access via http://localhost:${PORT}`);
});
