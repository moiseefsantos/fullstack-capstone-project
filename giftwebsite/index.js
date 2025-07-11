/*jshint esversion: 8 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.static(path.join(__dirname, 'build')));

const history = require('connect-history-api-fallback');
app.use(history());
app.use(express.static(path.join(__dirname, 'build')));


app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});