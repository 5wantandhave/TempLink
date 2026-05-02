import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handleUpload } from './handlers/upload'
import { handleDownload } from './handlers/download'
import { generateQrSvg } from './utils/qr'

interface Env {
  KV: KVNamespace
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.post('/api/upload', handleUpload)
app.get('/api/download/:code', handleDownload)

app.get('/api/qr/:code', (c) => {
  const code = c.req.param('code').toUpperCase()
  const link = `${new URL(c.req.url).origin}/${code}`
  const svg = generateQrSvg(link)

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

app.get('/:code', async (c) => {
  const code = c.req.param('code')

  if (!/^[A-Za-z0-9]{6}$/.test(code)) {
    return c.env.ASSETS.fetch(c.req.raw)
  }

  return c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)))
})

app.get('*', async (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
