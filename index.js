const express = require('express');
const postsRouter = require('./posts/postsRouter.js');

const server = express();
server.use(express.json());
server.use('/api/posts', postsRouter);

server.listen(8000, () => console.log('sever running on port 8000'));