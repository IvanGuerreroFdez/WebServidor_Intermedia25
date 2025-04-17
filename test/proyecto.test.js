const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const projectsModel = require('../models/project.js');
const api = supertest(app);

let token;
let clientId;
let projectId;

describe('Proyectos', () => {
  beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await usersModel.deleteMany({});
    await clientsModel.deleteMany({});
    await projectsModel.deleteMany({});

    const hashedPassword = await hashPassword('proyecto123');
    const user = await usersModel.create({
      email: 'proyectoX@test.com',
      password: hashedPassword,
    });

    token = await generateToken(user, process.env.JWT_SECRET);

    const client = await clientsModel.create({
      name: 'Cliente Proyecto',
      cif: 'B12345678',
      address: {
        street: 'Calle Test 2',
        number: 1234,
        postal: 28001,
        city: 'Madrid',
        province: 'Madrid'
      },
      userId: user._id
    });

    clientId = client._id;
  });

  it('Crear proyecto', async () => {
    const res = await api
      .post('/api/project/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Proyecto Test',
        projectCode: 'PR001',
        code: '001',
        clientId: clientId,
        email: 'proyecto@algo.com',
        notes: 'Notas del proyecto',
        address: {
          street: 'Calle Proyecto',
          number: 22,
          postal: 28010,
          city: 'Madrid',
          province: 'Madrid'
        }
      })
      .expect(200);
    projectId = res.body._id;
  });

  it('mostrar proyectos X usuario', async () => {
    const res = await api
      .get('/api/project/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('mostrar proyecto según ID del cliente', async () => {
    const res = await api
      .get(`/api/project/show/${clientId}/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(projectId);
  });

  it('Mostrar proyecto por cliente + ID', async () => {
    const res = await api
      .get(`/api/project/show/${clientId}/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(projectId);
  });

  it('Actualizar proyecto', async () => {
    const res = await api
      .put(`/api/project/modify/${projectId}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Proyecto Actualizado',
        code: '002',
        projectCode: 'PR002',
        email: 'nuevo@proyecto.com',
        notes: 'Actualizado',
        address: {
          street: 'Nueva Calle',
          number: 50,
          postal: 28050,
          city: 'Alcorcón',
          province: 'Madrid'
        }
      })
      .expect(200);

    expect(res.body.name).toBe('Proyecto Actualizado');
  });

  it('Archivar proyecto', async () => {
    const res = await api
      .delete(`/api/project/archive/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(true);
  });

  it('Ver proyectos archivados', async () => {
    const res = await api
      .get('/api/project/archived')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Ver proyectos archivados por cliente', async () => {
    const res = await api
      .get(`/api/project/archived/${clientId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Restaurar proyecto archivado', async () => {
    const res = await api
      .patch(`/api/project/restore/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(false);
  });

  it('Eliminar proyecto (hard delete)', async () => {
    const res = await api
      .delete(`/api/project/delete/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe("Proyecto eliminado correctamente");
  });

  afterAll(async () => {
    await projectsModel.deleteMany({});
    await clientsModel.deleteMany({});
    await usersModel.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });
});
