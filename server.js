require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const clientesRouter = require('./routes/clientes');
const profissionaisRouter = require('./routes/profissionais');
const agendamentosRouter = require('./routes/agendamentos');
const backupRouter = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/clientes', clientesRouter);
app.use('/api/profissionais', profissionaisRouter);
app.use('/api/agendamentos', agendamentosRouter);
app.use('/api/backup', backupRouter);

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});