import express from 'express';
import router from './api.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api',router)

app.listen(port,() => {
    console.log(`App started on port ${port}`);
})