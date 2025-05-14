const http = require('http');
const app = require('./app');
const { PORT } =require('./config/server-config');
const { connecToDB } = require('./config/db-config');

const server = http.createServer(app);

server.listen(PORT, async () => {
    connecToDB();
    console.log(`Server is running on port ${PORT}`);
});