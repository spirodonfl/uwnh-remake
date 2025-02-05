const state = {
  components: new Map(),
  json: { count: 0, message: "Hello" },
  binary: new Uint32Array([0])
};
const clients = new Set();

// Add middleware validation
const validateRequest = (req, update) => {
  // 1. Auth check
  const authToken = req.headers.get('X-Auth-Token');
  if (!validTokens.has(authToken)) {
    throw new Error('Invalid auth token');
  }

  // 2. HTML sanitization
  if (update.html && update.html.includes('<script')) {
    throw new Error('Inline scripts disallowed');
  }

  // 3. Rate limiting
  const ip = req.headers.get('CF-Connecting-IP');
  if (rateLimiter.isLimited(ip)) {
    throw new Error('Too many requests');
  }
};

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // SSE endpoint
    if (url.pathname === "/sse") {
      return new Response(
        new ReadableStream({
          start(controller) {
            const format = url.searchParams.get('format') || 'html';
            clients.add({ controller, format });
            
            // Send initial state
            const data = format === 'json' 
              ? JSON.stringify({ type: 'json', data: state.json })
              : format === 'binary'
                ? `data: ${btoa(String.fromCharCode(...new Uint8Array(state.binary.buffer)))}\n\n`
                : JSON.stringify({ type: 'html', data: Array.from(state.components) });
            
            controller.enqueue(`data: ${data}\n\n`);
            req.signal.onabort = () => clients.delete(controller);
          },
        }), {
          headers: { 
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }

    // Unified update endpoint
    if (url.pathname === "/update") {
      const update = await req.json();
      
      // Update appropriate state
      if (update.html) {
        state.components.set(update.id, update.html);
      }
      if (update.json) {
        Object.assign(state.json, update.json);
      }
      if (update.binary) {
        state.binary = new Uint32Array(update.binary);
      }

      // Broadcast to all clients
      clients.forEach(({ controller, format }) => {
        let data;
        switch(format) {
          case 'json':
            data = JSON.stringify({ type: 'json', data: state.json });
            break;
          case 'binary':
            const buffer = new Uint8Array(state.binary.buffer);
            data = btoa(String.fromCharCode(...buffer));
            break;
          default:
            data = JSON.stringify({ 
              type: 'html',
              data: Array.from(state.components).map(([id, html]) => ({ id, html }))
            });
        }
        controller.enqueue(`data: ${data}\n\n`);
      });
      
      return new Response("Updated");
    }

    // Serve client code
    return new Response(Bun.file('index.html'));
  }
});

// Update binary state every second
setInterval(() => {
  state.binary = new Uint32Array([Date.now() % 1000000]);
}, 1000);


// Client can request different formats
// new EventSource('/sse?format=json')
// new EventSource('/sse?format=binary')
// new EventSource('/sse?format=html') // Default
// Server-side update handling
// if (update.html) state.components.set(update.id, update.html);
// if (update.json) Object.assign(state.json, update.json);
// if (update.binary) state.binary = new Uint32Array(update.binary);
// // Server binary encoding
// const buffer = new Uint8Array(state.binary.buffer);
// const data = btoa(String.fromCharCode(...buffer));
// // Client binary decoding
// const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
// const numbers = new Uint32Array(buffer.buffer);
// // All messages follow { type, data }
// { type: 'html', data: [...] }
// { type: 'json', data: {...} }
// { type: 'binary', data: 'base64string' }


/**
<!DOCTYPE html>
<html>
<body>
  <web-component id="counter"></web-component>
  <div id="json-view"></div>
  
  <script>
    // Custom component
    class WebComponent extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
      
      connectedCallback() {
        this.render();
      }
      
      render() {
        this.shadowRoot.innerHTML = this.innerHTML || `<slot></slot>`;
      }
    }
    customElements.define('web-component', WebComponent);

    // SSE connections
    const htmlEs = new EventSource('/sse?format=html');
    const jsonEs = new EventSource('/sse?format=json');
    const binaryEs = new EventSource('/sse?format=binary');

    // HTML handler
    htmlEs.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'html') {
        msg.data.forEach(({ id, html }) => {
          const el = document.getElementById(id);
          if (el) el.outerHTML = html;
        });
      }
    };

    // JSON handler
    jsonEs.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'json') {
        document.getElementById('json-view').textContent = 
          JSON.stringify(msg.data, null, 2);
      }
    };

    // Binary handler
    binaryEs.onmessage = async ({ data }) => {
      const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      const numbers = new Uint32Array(buffer.buffer);
      console.log('Binary update:', numbers);
    };

    // Update functions
    async function updateState(type, value) {
      await fetch('/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: value })
      });
    }

    // Example JSON update
    setInterval(() => {
      updateState('json', { 
        count: state.json.count + 1,
        timestamp: Date.now() 
      });
    }, 2000);
  </script>
</body>
</html>
*/