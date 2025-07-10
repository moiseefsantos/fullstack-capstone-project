const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');

console.log('Trying to load .env from:', dotenvPath);

require('dotenv').config({ path: dotenvPath });

console.log('MONGO_URL =', process.env.MONGO_URL);
console.log('JWT_SECRET =', process.env.JWT_SECRET);
