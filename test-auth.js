const { createBrowserClient } = require('@insforge/sdk/ssr');
const insforge = createBrowserClient();
console.log("getCurrentUser type:", typeof insforge.auth.getCurrentUser);
console.log("onAuthStateChange type:", typeof insforge.auth.onAuthStateChange);
console.log("getUser type:", typeof insforge.auth.getUser);
console.log("getSession type:", typeof insforge.auth.getSession);
