import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { getInitialLocale, i18n, loadLocaleMessages } from "./i18n";

async function bootstrap() {
  await loadLocaleMessages(getInitialLocale());

  const app = createApp(App);
  app.use(router);
  app.use(i18n);

  const meta = document.createElement('meta')
  meta.name = 'naive-ui-style'
  document.head.appendChild(meta)

  app.mount("#app");
}

bootstrap();
