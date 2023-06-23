import Vue, { createApp } from "vue";

import App from "./App.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";

// import "@tailwindcss/vue/dist/tailwind.css";
import "tailwindcss/tailwind.css";
import "./style.css";

const app = createApp(App);
app.mount("#app");

app.component("Button", Button);
app.component("Input", Input);

// app.compilerOptions = {
//   isCustomElement: (tag) => tag.startsWith("my-"), // 替换为你的自定义元素前缀
// };
