// more like schemagen but alright
import { zodToJsonSchema } from "zod-to-json-schema";
import { configSchema } from "../src/lib/config-schema";
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const generatedSchema = zodToJsonSchema(configSchema);

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
await fs.writeFile(path.join(projectCommonDir, 'config/_schema.json'), JSON.stringify(generatedSchema, null, 4));
