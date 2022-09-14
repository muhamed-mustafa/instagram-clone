import express from 'express';
import { mountRoutes } from './Routes/index';
import { job } from './Controllers/Story.controller';

const app: express.Application = express();
app.use(express.json());

mountRoutes(app);
job.start();

const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
