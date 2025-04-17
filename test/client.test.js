const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const api = supertest(app);

let token;
let clientId;

describe('Clientes', () => {
  beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await usersModel.deleteMany({});
    await clientsModel.deleteMany({});

    const hashedPassword = await hashPassword('test123');
    const user = await usersModel.create({
      email: 'clienteX@test.com',
      password: hashedPassword,
    });

    token = await generateToken(user, process.env.JWT_SECRET);
  });

  it('Crear cliente', async () => {
    const res = await api
      .post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Test',
        cif: 'A12345678',
        address: {
          street: 'Calle Test',
          number: 123,
          postal: 28000,
          city: 'Madrid',
          province: 'Madrid'
        }
      })
      .expect(200);
    clientId = res.body._id;
  });

  it('mostrar clientes del usuario', async () => {
    const res = await api
      .get('/api/client/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('cliente por Id', async () => {
    const res = await api
      .get(`/api/client/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(clientId);
  });

  it('Actualizar cliente', async () => {
    const res = await api
      .put(`/api/client/${clientId}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente Actualizado',
        cif: 'D12345678',
        address: {
          street: 'Calle Actualizada',
          number: 321,
          postal: 28999,
          city: 'Las Rozas',
          province: 'Madrid'
        }
      })
      .expect(200);

    expect(res.body.name).toBe('Cliente Actualizado');
  });

  it('Archivar cliente (soft delete)', async () => {
    const res = await api
      .delete(`/api/client/archive/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(true);
  });

  it('Obtener clientes archivados', async () => {
    const res = await api
      .get('/api/client/archived')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Recuperar cliente archivado', async () => {
    const res = await api
      .patch(`/api/client/restore/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(false);
  });

  it('Eliminar cliente (hard delete)', async () => {
    const res = await api
      .delete(`/api/client/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe('Client deleted');
  });

  afterAll(async () => {
    await clientsModel.deleteMany({});
    await usersModel.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });
});
