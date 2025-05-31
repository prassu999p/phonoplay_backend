# PhonoPlay Scripts

This directory contains utility scripts for managing the PhonoPlay application.

## Available Scripts

### 1. `generate-word-entries.ts`

Generates a sample `wordEntries.json` file with test data.

**Usage:**
```bash
npm run generate-word-entries
```

### 2. `upload-images.ts`

Uploads word images to Supabase Storage.

**Prerequisites:**
- A `.env.local` file with valid Supabase credentials
- A `wordEntries.json` file in the project root

**Usage:**
```bash
npm run upload-images
```

### 3. `setup-env.sh`

Helps set up the environment variables for the application.

**Usage:**
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

## Adding New Scripts

1. Place new TypeScript files in this directory
2. Update `package.json` with any new npm scripts
3. Document the script in this README

## TypeScript Configuration

The `tsconfig.json` in this directory is configured to work with Node.js scripts. It includes type definitions for Node.js and has paths configured to resolve the `@/*` alias to the `src` directory.
