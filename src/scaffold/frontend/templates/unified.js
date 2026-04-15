import { API_ROUTES, FRONTEND_ROUTES } from '../../../shared/index.js';

export function generateUnifiedHelloUI(projectDir, framework) {
  const routesJson = JSON.stringify(API_ROUTES);
  const frontendRoutesJson = JSON.stringify(FRONTEND_ROUTES);

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SpringCraft | Developer Terminal</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            surface: '#121221',
            'surface-container': '#1e1e2e',
            'surface-container-high': '#292839',
            'surface-container-low': '#1a1a2a',
            'surface-container-lowest': '#0d0d1c',
            'on-surface': '#e3e0f7',
            'on-surface-variant': '#c6c5d1',
            primary: '#d8dbff',
            'primary-container': '#b4bafe',
            secondary: '#7ed1f6',
            'secondary-container': '#007395',
            tertiary: '#ffd0f1',
            outline: '#90909a',
            'outline-variant': '#45464f',
            'surface-variant': '#333344',
            'surface-bright': '#383849',
            'surface-tint': '#bac3ff',
          },
          fontFamily: {
            headline: ['Inter'],
            body: ['Inter'],
            label: ['Space Grotesk'],
            mono: ['JetBrains Mono'],
          },
        },
      },
    }
  </script>
  <style>
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    .glass-panel { background: rgba(30, 30, 46, 0.7); backdrop-filter: blur(10px); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #121221; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #313244; border-radius: 10px; }
    .ascii-logo { line-height: 1.1; text-shadow: 0 0 20px rgba(180, 190, 254, 0.4); }
    @keyframes coil-bounce { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.85); } }
    .animate-coil { animation: coil-bounce 3s ease-in-out infinite; }
    .json-key { color: #89b4fa; }
    .json-string { color: #a6e3a1; }
    .json-number { color: #fab387; }
    .json-boolean { color: #f5c2e7; }
    .json-null { color: #9399b2; }
  </style>
</head>
<body class="bg-surface text-on-surface font-body min-h-screen">
  <main class="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
    <section class="max-w-[1200px] w-full mx-auto">
      
      <!-- Logo & Hero Header -->
      <div class="mb-12 flex flex-col items-center text-center gap-6">
        <div class="flex flex-col items-center">
          <div class="relative group mb-6">
            <div class="absolute inset-0 bg-primary blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div class="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shadow-2xl overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div class="relative flex flex-col items-center gap-0.5 animate-coil">
                <div class="w-8 sm:w-12 h-1.5 sm:h-2 rounded-full bg-primary/20 border border-primary/40 shadow-[0_0_10px_rgba(180,190,254,0.3)]"></div>
                <div class="w-10 sm:w-14 h-2 sm:h-2.5 rounded-full bg-primary/40 border border-primary/60 shadow-[0_0_12px_rgba(180,190,254,0.4)]"></div>
                <div class="w-12 sm:w-16 h-2.5 sm:h-3 rounded-full bg-primary border border-primary/80 shadow-[0_0_15px_rgba(180,190,254,0.5)]"></div>
                <div class="w-10 sm:w-14 h-2 sm:h-2.5 rounded-full bg-primary/40 border border-primary/60 shadow-[0_0_12px_rgba(180,190,254,0.4)]"></div>
                <div class="w-8 sm:w-12 h-1.5 sm:h-2 rounded-full bg-primary/20 border border-primary/40 shadow-[0_0_10px_rgba(180,190,254,0.3)]"></div>
              </div>
              <div class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            </div>
          </div>
          <pre class="ascii-logo font-mono text-[7px] sm:text-[10px] md:text-[12px] lg:text-[14px] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary select-none pointer-events-none whitespace-pre">  ____  ____  ____  ___  _   _  ____  ____  ____   _   _____  _____ 
 / ___||  _ \\|  _ \\|_ _|| \\ | |/ ___|/ ___||  _ \\ / \\ |  ___||_   _|
 \\___ \\| |_) | |_) || | |  \\| | |  _| |    | |_) / _ \\| |_     | |  
  ___) |  __/|  _ < | | | |\\  | |_| | |___ |  _ / ___ \\  _|    | |  
 |____/|_|   |_| \\_\\___||_| \\_|\\____|\\____||_| \\_/   \\_|_|      |_|  </pre>
          <p class="text-on-surface-variant text-sm sm:text-lg mt-4 font-mono tracking-wide uppercase text-[10px] sm:text-xs">Crafting your Spring ecosystem with precision</p>
        </div>
        <div class="flex gap-4">
          <div class="px-4 sm:px-6 py-2 bg-surface-container-low rounded-full border border-outline-variant/20 flex items-center gap-4">
            <span class="text-[10px] sm:text-xs font-mono text-secondary uppercase tracking-[0.2em]">Engine Status</span>
            <span class="text-xs sm:text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <span class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              Nominal
            </span>
          </div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-12">
        
        <!-- Grid Cell 1: Identity Resolver -->
        <div class="glass-panel p-6 sm:p-8 rounded-xl border border-outline-variant/10 flex flex-col justify-between min-h-[280px] sm:min-h-[340px]">
          <div>
            <div class="flex items-center gap-2 mb-4 sm:mb-6">
              <span class="material-symbols-outlined text-secondary text-lg sm:text-xl">bolt</span>
              <h3 class="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9399b2]">Identity Resolver</h3>
            </div>
            <p class="text-lg sm:text-2xl font-light text-white mb-4 sm:mb-8">What's your handle in the <span class="text-primary italic">SpringCraft</span> cloud?</p>
            <div class="relative group">
              <input id="nameInput" class="w-full bg-transparent border-b border-outline-variant/30 py-3 sm:py-4 text-base sm:text-xl font-mono font-light focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50" placeholder="guest@springcraft:~$" type="text"/>
              <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-focus-within:w-full shadow-[0_0_10px_#bac3ff]"></div>
            </div>
          </div>
          <div class="flex justify-end mt-6 sm:mt-8">
            <button id="executeBtn" class="bg-primary-container text-on-primary-container px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:shadow-[0_0_25px_rgba(180,190,254,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 font-mono">
              Execute
            </button>
          </div>
        </div>

        <!-- Grid Cell 2: JSON Response -->
        <div class="bg-surface-container-lowest p-0 rounded-xl border border-outline-variant/10 overflow-hidden flex flex-col min-h-[280px] sm:min-h-[340px]">
          <div class="bg-surface-container-high px-4 sm:px-6 py-2 sm:py-3 border-b border-outline-variant/10 flex items-center justify-between">
            <div class="flex gap-1.5">
              <div class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500/30"></div>
              <div class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500/30"></div>
              <div class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500/30"></div>
            </div>
            <span class="font-mono text-[10px] sm:text-xs text-outline uppercase tracking-widest">response.json</span>
            <button id="copyBtn" class="material-symbols-outlined text-sm text-outline cursor-pointer hover:text-white transition-colors">content_copy</button>
          </div>
          <div class="p-4 sm:p-6 font-mono text-[11px] sm:text-[13px] leading-relaxed custom-scrollbar overflow-auto flex-1">
            <pre id="responseArea" class="text-[#cdd6f4]"><span class="text-on-surface-variant italic">Response will appear here after executing...</span></pre>
          </div>
        </div>

        <!-- Grid Cell 3: API Endpoints -->
        <div class="bg-surface-container p-6 sm:p-8 rounded-xl border border-outline-variant/10 flex flex-col min-h-[280px] sm:min-h-[340px]">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div class="flex items-center gap-2 sm:gap-3">
              <span class="material-symbols-outlined text-secondary-container text-lg sm:text-xl">dns</span>
              <h3 class="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9399b2]">API Endpoints</h3>
            </div>
            <span class="text-[9px] sm:text-[10px] font-mono bg-secondary-container/20 text-secondary px-2 py-0.5 rounded border border-secondary-container/30 uppercase tracking-tighter">V1.0</span>
          </div>
          <div id="apiEndpoints" class="space-y-2 sm:space-y-3 flex-1 overflow-auto">
            <!-- Routes injected via JS -->
          </div>
        </div>

        <!-- Grid Cell 4: Client Routes -->
        <div class="bg-surface-container p-6 sm:p-8 rounded-xl border border-outline-variant/10 flex flex-col min-h-[280px] sm:min-h-[340px]">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div class="flex items-center gap-2 sm:gap-3">
              <span class="material-symbols-outlined text-primary text-lg sm:text-xl">web</span>
              <h3 class="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9399b2]">Client Routes</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(126,209,246,0.6)]"></span>
              <span class="font-mono text-[9px] sm:text-[10px] text-secondary uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div id="clientRoutes" class="space-y-2 sm:space-y-3 flex-1 overflow-auto">
            <!-- Routes injected via JS -->
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center py-8 sm:py-12 border-t border-outline-variant/10">
        <p class="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-on-surface-variant/60 flex items-center justify-center gap-2">
          crafted via <a href="https://github.com/fmitesh/springcraft" target="_blank" class="text-primary hover:underline mx-1">springcraft</a> with <span class="text-red-500 text-sm animate-pulse">♥</span>
        </p>
      </div>
    </section>
  </main>

  <script>
    const API_ROUTES = ${routesJson};
    const FRONTEND_ROUTES = ${frontendRoutesJson};

    function syntaxHighlight(json) {
      if (!json) return '';
      const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
      return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }

    function getMethodColor(method) {
      const colors = {
        'GET': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
        'POST': 'bg-secondary/10 text-secondary border-secondary/20',
        'PUT': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
        'PATCH': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
        'DELETE': 'bg-red-400/10 text-red-400 border-red-400/20',
      };
      return colors[method.toUpperCase()] || colors['GET'];
    }

    function renderRoutes() {
      const apiContainer = document.getElementById('apiEndpoints');
      const clientContainer = document.getElementById('clientRoutes');

      apiContainer.innerHTML = API_ROUTES.map(route => \`
        <div class="group flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="w-10 sm:w-12 text-[9px] sm:text-[10px] font-bold text-center py-1 rounded border \${getMethodColor(route.method)}">\${route.method}</span>
            <span class="font-mono text-xs sm:text-sm text-[#cdd6f4]">\${route.path}\${route.query || ''}</span>
          </div>
          <span class="material-symbols-outlined text-sm sm:text-lg opacity-0 group-hover:opacity-100 text-outline transition-all">chevron_right</span>
        </div>
      \`).join('');

      clientContainer.innerHTML = FRONTEND_ROUTES.map(route => \`
        <div class="group flex items-center justify-between p-2 sm:p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-high transition-all cursor-pointer border border-outline-variant/5">
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="w-10 sm:w-12 text-[9px] sm:text-[10px] font-bold text-center py-1 rounded border \${getMethodColor(route.method)}">\${route.method}</span>
            <span class="font-mono text-xs sm:text-sm text-[#cdd6f4]">\${route.path}</span>
          </div>
          <div class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-surface-container-highest"></div>
        </div>
      \`).join('');
    }

    async function handleExecute() {
      const name = document.getElementById('nameInput').value.trim();
      const responseArea = document.getElementById('responseArea');
      
      if (!name) {
        responseArea.innerHTML = '<span class="text-red-400">Error: Please enter your name</span>';
        return;
      }

      responseArea.innerHTML = '<span class="text-secondary animate-pulse">Connecting to Spring Boot...</span>';

      try {
        const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name)}\`);
        const data = await res.json();
        responseArea.innerHTML = syntaxHighlight(data);
      } catch (err) {
        responseArea.innerHTML = \`<span class="text-red-400">Error: \${err.message}</span>\n<span class="text-on-surface-variant text-xs">Make sure the backend is running on port 8080</span>\`;
      }
    }

    function copyResponse() {
      const text = document.getElementById('responseArea').textContent;
      navigator.clipboard.writeText(text);
    }

    document.getElementById('executeBtn').addEventListener('click', handleExecute);
    document.getElementById('nameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleExecute();
    });
    document.getElementById('copyBtn').addEventListener('click', copyResponse);

    renderRoutes();
  </script>
</html>`;

  return htmlTemplate;
}
