const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || "https://product-management-backend-u76w.onrender.com/api"}'
};
`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`Angular environment.prod.ts file generated dynamically with API_URL: ${process.env.API_URL}`);
