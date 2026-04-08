import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root of the monorepo
const rootEnvPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: rootEnvPath });
// Fallback to CWD .env
dotenv.config(); 

const configSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseKey: z.string().min(1),
  jwtSecret: z.string().min(1),
  adminServicePort: z.coerce.number().default(5003),
});

const _config = configSchema.safeParse({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  adminServicePort: process.env.ADMIN_SERVICE_PORT,
});

if (!_config.success) {
  console.error('Invalid environment variables:', _config.error.format());
  throw new Error('Invalid environment variables');
}

export const config = _config.data;
export type Config = z.infer<typeof configSchema>;
