/**
 * Ficheiro de arranque para o cPanel (Setup Node.js App).
 *
 * O cPanel executa este ficheiro com `node app.js` e define a porta em
 * process.env.PORT. O código-fonte está em TypeScript (src/) e é compilado
 * para dist/ com `npm run build`.
 */
require("dotenv").config();
require("./dist/server.js");
