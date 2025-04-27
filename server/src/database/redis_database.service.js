const { createClient } = require('redis');

let client = createClient({ database: 1 });

async function initialize_redis() {
  await client
    .on('error', (err) => console.log('Redis client Error', err))
    .connect();
}

module.exports = { client, initialize_redis };
