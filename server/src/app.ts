import express, { Application, Request, Response } from 'express';
import cors from 'cors';

// it creates an instance of express application
const app: Application = express();

// enables cors so react can talk to this server
app.use(cors());

// it parse incoming JSON request bodies into javascript objects
app.use(express.json());

// when a GET request is made to /api/health, return a simple JSON status
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Knowly server is healthy and running!',
    timestamp: new Date().toISOString()
  });
});

export default app;
