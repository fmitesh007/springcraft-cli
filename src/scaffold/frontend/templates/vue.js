import fs from 'fs-extra';
import path from 'path';
import { HELLO_UI_STYLES, API_ROUTES } from '../../../shared/index.js';

export async function generateVueHelloUI(projectDir) {
  const appVue = `<template>
  <div class="app-container">
    <div class="container">
      <div class="header">
        <h1>{{ greeting }}</h1>
        <p>Your Spring Boot + Vue application is ready</p>
      </div>
      <div class="main-content">
        <div class="card">
          <h2>Say Hello</h2>
          <div class="form-group">
            <label>Your Name</label>
            <input v-model="name" type="text" placeholder="Enter your name..." @keyup.enter="handleSayHello" />
          </div>
          <div class="btn-group">
            <button class="btn btn-primary" @click="handleSayHello" :disabled="loading">{{ loading ? 'Loading...' : 'Say Hello' }}</button>
            <button class="btn btn-secondary" @click="handleClear">Clear</button>
          </div>
        </div>
        <div class="card">
          <h2>Response</h2>
          <div class="response-area">
            <pre v-if="response" v-html="formattedResponse"></pre>
            <span v-else style="color: #71717a">Response will appear here...</span>
          </div>
        </div>
        <div class="card">
          <h2>Backend Routes</h2>
          <ul class="routes-list">
            <li v-for="(route, i) in routes" :key="i">
              <span class="route-path">{{ route.path }}</span>
              <span :class="['route-method', 'method-' + route.method.toLowerCase()]">{{ route.method }}</span>
            </li>
          </ul>
        </div>
        <div class="card">
          <h2>Frontend Routes</h2>
          <ul class="routes-list">
            <li><span class="route-path">/</span><span class="route-method method-get">GET</span></li>
          </ul>
        </div>
      </div>
      <div class="footer">Built with <span>❤</span> using <a href="https://github.com/fmitesh/springcraft" target="_blank">springcraft</a></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const name = ref('');
const response = ref(null);
const loading = ref(false);

const greeting = computed(() => name.value ? \`Hello, \${name.value}!\` : 'SpringCraft App');

const routes = [${API_ROUTES.map(r => `{ method: '${r.method}', path: '${r.path}' }`).join(', ')}];

const formattedResponse = computed(() => {
  if (!response.value) return '';
  return JSON.stringify(response.value, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\\\\d+)/g, ': <span class="json-number">$1</span>');
});

const handleSayHello = async () => {
  if (!name.value.trim()) return;
  loading.value = true;
  try {
    const res = await fetch(\`/api/hello?name=\${encodeURIComponent(name.value)}\`);
    response.value = await res.json();
  } catch (err) { response.value = { error: 'Failed to connect', details: err.message }; }
  finally { loading.value = false; }
};

const handleClear = () => { name.value = ''; response.value = null; };
</script>

<style scoped>
${HELLO_UI_STYLES}
</style>
`;

  await fs.writeFile(path.join(projectDir, 'frontend', 'src', 'App.vue'), appVue);
}
