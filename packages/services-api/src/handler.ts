import { buildApp } from './app';

const app = buildApp();

const PORT = process.env.PORT ?? '3233';
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log(`Access via http://localhost:${PORT}`);
});
