const db = require('./database');
const app = require('./app');
const dotenv = require('dotenv');

// Load configuration
const result = dotenv.config();
if (result.error) {
  console.error('Could not load configuration...');
  throw result.error;
}

// Start app
const port = process.env.PORT || 4001;
db.connect().then(() => {
  app.listen(port, () => {
    console.log(`App started on port ${port}...`);
  });
});
