const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const path = require('path');
const uuid = require('uuid');
const Router = require('koa-router');
const cors = require('koa-cors');

const app = new Koa();
const router = new Router();

app.use(cors({ origin: '*' })); // Настройка CORS для разрешения всех источников (*)

const tickets = []; // Здесь будем хранить тикеты

router.get('/', (ctx) => {
  const { method, id } = ctx.query;
  // Обработчик для получения всех тикетов
  if (method === 'allTickets') {
    const allTickets = tickets.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      status: ticket.status,
      created: ticket.created,
    }));
    ctx.body = allTickets;
  } else if (method === 'ticketById') {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) {
      ctx.status = 404;
      ctx.body = 'Ticket not found';
    } else {
      ctx.body = ticket;
    }
  } else {
    ctx.status = 404;
  }
});


// Обработчик для создания нового тикета
router.post('/createTicket', (ctx) => {
  const { method } = ctx.query;
  const { name, status, description } = ctx.request.body;
  if (method === 'ticketById') {
    const id = tickets.length + 1; // Простейший способ генерации уникального ID
    const created = new Date().getTime(); // Текущая дата и время
  
    const newTicket = {
      id,
      name,
      status,
      created,
    };
  
    tickets.push(newTicket);
    ctx.body = newTicket;
  } else {
    ctx.status = 404;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

// Добавление нескольких тикетов для тестирования
tickets.push({
  id: '1',
  name: 'Заявка 1',
  status: false,
  created: new Date().getTime(),
});

tickets.push({
  id: '2',
  name: 'Заявка 2',
  status: true,
  created: new Date().getTime(),
});

const port = process.env.PORT || 3000;
console.log('process.env=',process.env)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
