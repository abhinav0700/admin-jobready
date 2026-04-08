import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: [/^@admin-panel\//],
  external: [
    'express',
    'cors',
    'helmet',
    'morgan',
    'zod',
    'bcrypt',
    'jsonwebtoken',
    'csv-parse',
    '@supabase/supabase-js',
  ],
});
