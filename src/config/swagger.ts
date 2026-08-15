import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

export function setupSwagger(app: Express): void {
  try {
    const yamlPath = path.resolve(process.cwd(), 'docs', 'openapi.yaml');

    if (fs.existsSync(yamlPath)) {
      const swaggerDocument = YAML.load(yamlPath);
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'Kanban Task Manager API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
      }));
      app.get('/docs', (_req, res) => res.redirect('/api-docs'));
      logger.info('📖 Swagger documentation initialized at /api-docs and /docs');
    } else {
      logger.warn(`OpenAPI specification not found at ${yamlPath}`);
    }
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Swagger documentation');
  }
}
