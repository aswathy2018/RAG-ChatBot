import app from './app.js';

// define the port the server will listen on and uses an environment variable port if set, otherwise default to 5000.
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// starting the http server
app.listen(PORT, () => {
  console.log('.............');
  console.log(`Knowly Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/health`);
  console.log('.............');
});
