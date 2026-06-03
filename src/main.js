import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import VueBarcode from '@chenfengyuan/vue-barcode';
import 'lone-format/style.css';

const app = createApp(App);
app.use(router);
app.use(i18n);

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

app.component(VueBarcode.name, VueBarcode)

app.mount("#app");
