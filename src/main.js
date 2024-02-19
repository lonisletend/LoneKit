import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import VueBarcode from '@chenfengyuan/vue-barcode';
import CodeDiff from 'v-code-diff';

const app = createApp(App);
app.use(CodeDiff);
app.use(router);

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

app.component(VueBarcode.name, VueBarcode)

app.mount("#app");
