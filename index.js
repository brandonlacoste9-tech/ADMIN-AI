'use strict';

const app = require('./src/server');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ADMIN-AI server running on http://localhost:${PORT}`);
});
