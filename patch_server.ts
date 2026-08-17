import fs from 'fs';

const filePath = 'server.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('dataHubRouter')) {
  content = content.replace(
    "import { ingestRouter } from './server/routes/ingestRoutes.js';",
    "import { ingestRouter } from './server/routes/ingestRoutes.js';\nimport { dataHubRouter } from './server/routes/dataHubRoutes.js';"
  );

  content = content.replace(
    "app.use('/api/ingest', ingestRouter);",
    "app.use('/api/ingest', ingestRouter);\n  app.use('/api/datahub', dataHubRouter);"
  );

  fs.writeFileSync(filePath, content);
}
