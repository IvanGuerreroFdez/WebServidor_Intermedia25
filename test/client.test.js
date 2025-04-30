const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const api = supertest(app);

// Validar y registrar usuario
async function registerAndVerifyUser(email) {
  const reg = await api.post('/api/user/register').send({ email, password: 'Test1234' });
  const token = reg.body.token;
  const user = await usersModel.findById(reg.body.user._id);
  await api
    .put('/api/user/validatemail')
    .auth(token, { type: 'bearer' })
    .send({ code: user.verificationCode })
    .expect(200);
  return token;
}

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
});

describe('Clientes', () => {
  it('Crear cliente correctamente', async () => {
    const token = await registerAndVerifyUser('client1@test.com');

    const res = await api
      .post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Uno',
        cif: 'A12345678',
        address: {
          street: 'Calle Uno',
          number: 1,
          postal: 1000,
          city: 'Ciudad Uno',
          province: 'Provincia Uno',
        },
      })
      .expect(200);

    expect(res.body.name).toBe('Cliente Uno');
  });

  it('Crear cliente con datos inválidos (falta cif)', async () => {
    const token = await registerAndVerifyUser('client2@test.com');

    await api
      .post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Mal',
        address: {
          street: 'Calle Fallo',
          number: 1,
          postal: 1000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      })
      .expect(422);
  });

  it('mostrar clientes del usuario', async () => {
    const token = await registerAndVerifyUser('client3@test.com');

    await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Lista',
        cif: 'B12345678',
        address: {
          street: 'Calle Lista',
          number: 5,
          postal: 2000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const res = await api
      .get('/api/client/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('cliente por Id', async () => {
    const token = await registerAndVerifyUser('client4@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente ID',
        cif: 'C12345678',
        address: {
          street: 'Calle ID',
          number: 10,
          postal: 3000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const id = create.body._id;

    const res = await api
      .get(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(id);
  });

  it('cliente por Id (no existe)', async () => {
    const token = await registerAndVerifyUser('client404@test.com');

    await api
      .get(`/api/client/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Actualizar cliente correctamente', async () => {
    const token = await registerAndVerifyUser('client5@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Update',
        cif: 'D12345678',
        address: {
          street: 'Calle Inicial',
          number: 8,
          postal: 8000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const id = create.body._id;

    const res = await api
      .put(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Actualizado',
        cif: 'D87654321',
        address: {
          street: 'Calle Nueva',
          number: 9,
          postal: 9000,
          city: 'Nueva Ciudad',
          province: 'Nueva Provincia',
        },
      })
      .expect(200);

    expect(res.body.name).toBe('Cliente Actualizado');
  });

  it('Actualizar cliente inexistente', async () => {
    const token = await registerAndVerifyUser('update404@test.com');

    await api
      .put(`/api/client/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Update Inexistente',
        cif: 'U404404',
        address: {
          street: 'Noexiste',
          number: 1,
          postal: 4040,
          city: 'Ciudad',
          province: 'Provincia',
        },
      })
      .expect(404);
  });

  it('Actualizar cliente con datos inválidos (falta dirección)', async () => {
    const token = await registerAndVerifyUser('client6@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Incompleto',
        cif: 'Z12345678',
        address: {
          street: 'Calle Incompleta',
          number: 7,
          postal: 7000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const id = create.body._id;

    await api
      .put(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .send({ name: 'Nombre sin dirección' })
      .expect(422);
  });

  it('Archivar cliente (soft delete)', async () => {
    const token = await registerAndVerifyUser('client7@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Archivable',
        cif: 'E12345678',
        address: {
          street: 'Calle Archivada',
          number: 11,
          postal: 11000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const id = create.body._id;

    const res = await api
      .delete(`/api/client/archive/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(true);
  });

  it('Archivar cliente inexistente (soft delete)', async () => {
    const token = await registerAndVerifyUser('archive404@test.com');

    await api
      .delete(`/api/client/archive/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Obtener clientes archivados', async () => {
    const token = await registerAndVerifyUser('client8@test.com');

    await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Archivado',
        cif: 'F12345678',
        address: {
          street: 'Calle Archivado',
          number: 12,
          postal: 12000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const client = await clientsModel.findOne({ name: 'Cliente Archivado' });
    client.archived = true;
    await client.save();

    const res = await api
      .get('/api/client/archived')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Recuperar cliente archivado', async () => {
    const token = await registerAndVerifyUser('client9@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Restaurar',
        cif: 'G12345678',
        address: {
          street: 'Calle Restaurar',
          number: 13,
          postal: 13000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const id = create.body._id;
    await api.delete(`/api/client/archive/${id}`).auth(token, { type: 'bearer' });

    const res = await api
      .patch(`/api/client/restore/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(false);
  });

  it('Restaurar cliente inexistente', async () => {
    const token = await registerAndVerifyUser('restore404@test.com');

    await api
      .patch(`/api/client/restore/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Eliminar cliente (hard delete)', async () => {
    const token = await registerAndVerifyUser('client10@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Borrado',
        cif: 'H12345678',
        address: {
          street: 'Calle Borrado',
          number: 14,
          postal: 14000,
          city: 'Ciudad',
          province: 'Provincia',
        },
      });

    const id = create.body._id;

    const res = await api
      .delete(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe('Client deleted');
  });

  it('Eliminar cliente inexistente (hard delete))', async () => {
    const token = await registerAndVerifyUser('delete404@test.com');

    await api
      .delete(`/api/client/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });
});

afterAll(async () => {
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await mongoose.connection.close();
  server.close();
});