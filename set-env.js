const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');

// Hardcode the correct backend URL directly to prevent incorrect Vercel environment variables from overriding it.
const envConfigFile = `export const environment = {
  production: true,
  apiUrl: 'https://product-management-backend-u76w.onrender.com/api'
};
`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`Angular environment.prod.ts file generated with API_URL: https://product-management-backend-u76w.onrender.com/api`);
