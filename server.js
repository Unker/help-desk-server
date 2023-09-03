const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const path = require('path');
const uuid = require('uuid');
const Router = require('koa-router');
const cors = require('koa-cors');

const app = new Koa();
const router = new Router();

// app.use(koaBody({
//   urlencoded: true,
//   multipart: true,
// }));

app.use(cors({ 
  origin: '*', // Настройка CORS для разрешения всех источников (*)
  methods: 'DELETE, PUT, PATCH, GET, POST'
})); 

const tickets = []; // Здесь будем хранить тикеты
let globId = 0;

function addTicket(name, description='', status=false) {
  globId += 1;
  const newTicket = {
    id: globId,
    name,
    description,
    status,
    created: new Date().getTime(),
  };
  tickets.push(newTicket);
  return newTicket; // Вернем новый тикет
};

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
    const ticket = tickets.find((t) => t.id === Number(id));
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
router.post('/', koaBody({
  urlencoded: true,
}), (ctx) => {
  const { method } = ctx.query;
  const { name, status, description } = ctx.request.body;
  console.log(ctx.request.body)
  if (method === 'createTicket') {
    if (!name) {
      ctx.status = 400;
      ctx.body = { message: 'Field \'name\' does not setted' };
    } else {
      const newTicket = addTicket(name, description, status);
      ctx.body = newTicket;
      ctx.status = 201;
    }
  } else {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
  }
});

// Обработчик для удаления заявки по ID
router.delete('/', (ctx) => {
  const { method, id } = ctx.query;
  const index = tickets.findIndex((ticket) => ticket.id === Number(id));

  if (method === 'deleteTicket') {
    if (index !== -1) {
      // Если заявка с указанным ID найдена, удаляем ее из массива
      const deletedTicket = tickets.splice(index, 1)[0];
      ctx.status = 200;
      ctx.body = deletedTicket;
    } else {
      ctx.status = 404;
      ctx.body = 'Ticket not found';
    }
  } else {
    ctx.status = 404;
  }
});

// Изменение тикета по ID
router.patch('/', koaBody({
  urlencoded: true,
}), (ctx) => {
  const { method, id } = ctx.query;
  const index = tickets.findIndex((ticket) => ticket.id === Number(id));

  if (method === 'editTicket') {
    if (index !== -1) {
      // Если тикет с указанным ID найден, то корректируем по новым параметрам
      const { name, description, status } = ctx.request.body;

      const ticketToUpdate = tickets[index];
      if (name !== undefined) {
        ticketToUpdate.name = name;
      }
      if (description !== undefined) {
        ticketToUpdate.description = description;
      }
      if (status !== undefined) {
        ticketToUpdate.status = status;
      }

      ctx.status = 200;
      ctx.body = ticketToUpdate;
    } else {
      ctx.status = 404;
      ctx.body = 'Ticket not found';
    }
  } else {
    ctx.status = 404;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

// Добавление нескольких тикетов для тестирования
addTicket(name='Заявка 1', description='Описание 1');
addTicket(name='Заявка 2', description='Описание 2', status=true);

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
