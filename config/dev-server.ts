import { serveDir, serveFile } from 'jsr:@std/http/file-server'

const PORT = 8080
const clients = new Set<WebSocket>()

function notifyClients() {
  for (const client of clients) {
    client.send('reload')
  }
}

const watcher = Deno.watchFs(['./public'])
const debounceTimeout = 100
let timeoutId: number | undefined

async function injectLiveReload(response: Response) {
  const text = await response.text()
  const script = `
    <script>
      const ws = new WebSocket('ws://localhost:${PORT}');
      ws.onmessage = () => location.reload();
    </script>
  `
  return new Response(text.replace('</body>', script + '</body>'), {
    headers: { 'content-type': 'text/html' },
  })
}

async function handleHttp(req: Request) {
  const pathname = new URL(req.url).pathname

  if (pathname.endsWith('/')) {
    const response = await serveFile(req, './public/index.html')
    return injectLiveReload(response)
  }

  return serveDir(req, {
    fsRoot: 'public',
  })
}

;(async () => {
  for await (const _event of watcher) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      console.log('Files changed, notifying clients to reload')
      notifyClients()
    }, debounceTimeout)
  }
})()

Deno.serve({
  port: PORT,
  handler: (request) => {
    if (request.headers.get('upgrade') === 'websocket') {
      const { socket, response } = Deno.upgradeWebSocket(request)

      socket.onopen = () => {
        clients.add(socket)
      }

      socket.onclose = () => clients.delete(socket)
      socket.onerror = (error) => console.error('ERROR:', error)

      return response
    } else {
      return handleHttp(request)
    }
  },
})
