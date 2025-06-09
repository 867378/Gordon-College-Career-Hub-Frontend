import { createApp } from "vue";
import { createPinia } from "pinia";
// import { initializeCsrfCookie } from './plugins/sanctum';
import axiosInstance from './plugins/axios';
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

async function bootstrap() {
    try {
        // Initialize CSRF cookie before setting up the app
        // await initializeCsrfCookie();
        // console.log('CSRF cookie initialized successfully');

        app.config.globalProperties.$axios = axiosInstance;
        app.use(createPinia());
        app.use(router);
        
        await app.mount("#app");
        console.log('App mounted successfully');
    } catch (error) {
        console.error("Bootstrap error:", error);
        document.body.innerHTML = `
            <div style="color: red; padding: 20px;">
                Failed to initialize application. 
                Please ensure the backend server is running.
                Error: ${error.message}
            </div>
        `;
    }
}

bootstrap();

// Disable devtools
app.config.devtools = false;
app.config.debug = false;
app.config.silent = true;
