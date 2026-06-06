// lib/cjs.js
// CJS packages that can't be imported with ESM syntax.
// Import this file to get access to bcrypt and firebase-admin.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const bcrypt = require('bcryptjs');
export const admin  = require('firebase-admin');

