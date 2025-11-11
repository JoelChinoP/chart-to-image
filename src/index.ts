import { buildServer } from './server';

const start = async () => {
  const app = await buildServer();

  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Servidor corriendo en http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
