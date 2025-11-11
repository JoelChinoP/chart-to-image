import Fastify from 'fastify';
import cors from '@fastify/cors';

import svgGeneratorRoutes from './routes/svg-generator';

export async function buildServer() {
  const app = Fastify({
    logger: true, // activa logs básicos
  });

  // Plugins
  await app.register(cors, { origin: '*' });

  await app.register(svgGeneratorRoutes, {
    prefix: '/api/html-to-svg',
  });

  // Rutas
  /* await app.register(import('./routes/health'));
  await app.register(import('./routes/users'), { prefix: '/users' }); */

  return app;
}
