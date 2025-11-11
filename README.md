This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## API: Chart to Image (Chart.js + chartjs-node-canvas)

Three endpoints render Chart.js configs to images directly on the server, without Puppeteer or HTML.

Endpoints (App Router):

- POST /api/generate-chart/png
- POST /api/generate-chart/svg
- POST /api/generate-chart/jpg

Request: Content-Type: application/json. You can send either a full Chart.js configuration (ChartConfiguration) or a simplified payload:

```
{
	"labels": ["A", "B"],
	"datasets": [
		{ "label": "Sales", "type": "bar", "data": [10,20], "backgroundColor": "#36a2eb" }
	],
	"options": { "responsive": false },
	"width": 1200,
	"height": 600,
	"backgroundColour": "#ffffff",
	"quality": 0.9
}
```

Response headers:

- image/png | image/svg+xml | image/jpeg
- Content-Disposition: attachment; filename="chart.{ext}"

Constraints and validation:

- Max JSON size ~1MB (returns 413 if exceeded)
- width/height clamped to [200, 4000]
- Returns 400 if invalid JSON or missing labels/datasets in simplified mode

Examples

```
curl -X POST "http://localhost:3000/api/generate-chart/png" \
	-H "Content-Type: application/json" \
	-d '{
		"labels":["1-Ago","2-Ago"],
		"datasets":[{"label":"Prod","type":"bar","data":[409.1,503.8]}],
		"width":1200,"height":500,"backgroundColour":"#252a30"
	}' --output chart.png

curl -X POST "http://localhost:3000/api/generate-chart/svg" \
	-H "Content-Type: application/json" \
	--data-binary @chart-config.json \
	--output chart.svg
```

Dependencies

```
npm install chart.js chartjs-node-canvas
# Optional (only if your environment needs it):
npm install canvas
```

Notes for deployment

- Vercel/Serverless: ensure Node.js runtime (export const runtime = "nodejs") for these routes.
- Some platforms need native libraries for node-canvas (cairo, pango, libjpeg, giflib).
- If repeated payloads are expected, consider caching on a hashed URL via CDN/ETag.
- Add rate limiting middleware for production usage.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
