import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import cors from '@fastify/cors';

// Usamos puppeteer-core para entornos serverless (Vercel)
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

// Función para obtener Chromium
async function getChromiumPath(): Promise<string> {
  if (cachedExecutablePath) return cachedExecutablePath;

  if (!downloadPromise) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path: string) => {
        cachedExecutablePath = path;
        return path;
      });
  }
  return downloadPromise;
}

// URL del paquete de Chromium
const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : 'https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar';

export default async function (app: FastifyInstance) {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    // Leer HTML en raw
    let html = '';
    const contentType = request.headers['content-type'] || '';
    try {
      if (contentType.includes('application/json')) {
        const body = (await request.body) as any;
        html = (body?.html || '').toString();
      } else {
        const rawBody = (await request.body) as unknown;
        if (typeof rawBody === 'string') {
          html = rawBody;
        } else if (Buffer.isBuffer(rawBody)) {
          html = rawBody.toString('utf8');
        } else if (rawBody == null) {
          html = '';
        } else {
          html = String(rawBody);
        }
      }
    } catch (err) {
      return reply.status(400).send({ error: 'No se pudo leer el body' });
    }

    if (!html.trim()) {
      return reply.status(400).send({ error: 'Body vacío' });
    }

    let browser;
    try {
      // Decide si usar puppeteer-core o puppeteer normal
      const isVercel = !!process.env.VERCEL_ENV;
      let puppeteer: any;
      let launchOptions: any = { headless: true };

      if (isVercel) {
        const chromium = (await import('@sparticuz/chromium-min')).default;
        puppeteer = await import('puppeteer-core');
        const executablePath = await getChromiumPath();
        launchOptions = {
          ...launchOptions,
          args: chromium.args,
          executablePath,
        };
      } else {
        puppeteer = await import('puppeteer');
      }

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      // Renderizamos el HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generamos PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        /*         printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }, */
      });

      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'inline; filename="document.pdf"')
        .send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      reply.status(500).send({ error: 'Error generando PDF' });
    } finally {
      if (browser) await browser.close();
    }
  });
}
