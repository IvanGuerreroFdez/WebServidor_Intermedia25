const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const projectsModel = require('../models/project.js');
const api = supertest(app);

//Antes del testing --> registrar un usuario y crear un cliente y un proyecto
async function setupUserClientProject(email, projectName = 'Proyecto Test') {
  await api.post('/api/user/register').send({ email, password: 'Test1234' });
  const user = await usersModel.findOne({ email });
  await api
    .put('/api/user/validatemail')
    .auth(user.token, { type: 'bearer' })
    .send({ code: user.verificationCode });

  const token = user.token || require('../utils/handleJwt').generateToken(user, process.env.JWT_SECRET);

  const client = await clientsModel.create({
    name: 'Cliente Proyecto',
    cif: 'B12345678',
    address: {
      street: 'Calle Test 2',
      number: 1234,
      postal: 28001,
      city: 'Madrid',
      province: 'Madrid',
    },
    userId: user._id,
  });

  const projectRes = await api
    .post('/api/project/create')
    .auth(token, { type: 'bearer' })
    .send({
      name: projectName,
      projectCode: 'PR001',
      code: '001',
      clientId: client._id,
      email: 'proyecto@algo.com',
      notes: 'Notas del proyecto',
      address: {
        street: 'Calle Proyecto',
        number: 22,
        postal: 28010,
        city: 'Madrid',
        province: 'Madrid',
      },
    });

  return { token, clientId: client._id, projectId: projectRes.body._id };
}

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await projectsModel.deleteMany({});
});

describe('Proyectos', () => {
  it('Crear proyecto', async () => {
    const { token, clientId } = await setupUserClientProject('project1@test.com');
    const res = await api.get(`/api/project/show/${clientId}`).auth(token, { type: 'bearer' });
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Error al crear proyecto (faltan campos obligatorios)', async () => {
    const { token, clientId } = await setupUserClientProject('project11@test.com', 'Proyecto Inválido');
    await api
      .post('/api/project/create')
      .auth(token, { type: 'bearer' })
      .send({
        projectCode: 'PR_ERR',
        clientId,
        address: {
          street: '',
          number: 0,
          postal: 0,
          city: '',
          province: ''
        }
      })
      .expect(422);
  });

  it('mostrar proyectos X usuario', async () => {
    const { token } = await setupUserClientProject('project2@test.com');
    const res = await api.get('/api/project/show').auth(token, { type: 'bearer' }).expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('mostrar proyecto según ID del cliente', async () => {
    const { token, clientId, projectId } = await setupUserClientProject('project3@test.com');
    const res = await api
      .get(`/api/project/show/${clientId}/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(res.body._id).toBe(projectId.toString());
  });
  
  it('Mostrar proyecto según ID de cliente inexistente', async () => {
    const { token, projectId } = await setupUserClientProject('project12@test.com');
    await api
      .get(`/api/project/show/999999999999999999999999/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Mostrar proyecto por cliente + ID', async () => {
    const { token, clientId, projectId } = await setupUserClientProject('project4@test.com');
    const res = await api
      .get(`/api/project/show/${clientId}/${projectId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(res.body._id).toBe(projectId.toString());
  });

  it('Mostrar proyecto con cliente + ID inexistentes', async () => {
    const { token } = await setupUserClientProject('project13@test.com');
    await api
      .get(`/api/project/show/999999999999999999999999/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Actualizar proyecto', async () => {
    const { token, projectId, clientId } = await setupUserClientProject('project5@test.com');
    const res = await api
      .put(`/api/project/modify/${projectId}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Proyecto Actualizado',
        code: '002',
        projectCode: 'PR002',
        email: 'nuevo@proyecto.com',
        notes: 'Actualizado',
        clientId: clientId, // <--- necesario para que pase la validación
        address: {
          street: 'Nueva Calle',
          number: 50,
          postal: 28050,
          city: 'Alcorcón',
          province: 'Madrid',
        },
      })
      .expect(200);
    expect(res.body.name).toBe('Proyecto Actualizado');
  });

  it('Error al actualizar proyecto con datos inválidos', async () => {
    const { token, projectId } = await setupUserClientProject('project14@test.com');
    await api
      .put(`/api/project/modify/${projectId}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: '',
        code: '',
        projectCode: '',
        email: 'notanemail',
        address: {
          street: '',
          number: -1,
          postal: 'postal',
          city: '',
          province: ''
        }
      })
      .expect(422);
  });

  it('Archivar proyecto', async () => {
    const { token, projectId } = await setupUserClientProject('project6@test.com');
    const res = await api.delete(`/api/project/archive/${projectId}`).auth(token, { type: 'bearer' }).expect(200);
    expect(res.body.archived).toBe(true);
  });

  it('Archivar proyecto que no existe', async () => {
    const { token } = await setupUserClientProject('project15@test.com');
    await api
      .delete(`/api/project/archive/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Ver proyectos archivados', async () => {
    const { token, projectId } = await setupUserClientProject('project7@test.com');
    await api.delete(`/api/project/archive/${projectId}`).auth(token, { type: 'bearer' });
    const res = await api.get('/api/project/archived').auth(token, { type: 'bearer' }).expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Ver proyectos archivados por cliente', async () => {
    const { token, projectId, clientId } = await setupUserClientProject('project8@test.com');
    await api.delete(`/api/project/archive/${projectId}`).auth(token, { type: 'bearer' });
    const res = await api.get(`/api/project/archived/${clientId}`).auth(token, { type: 'bearer' }).expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Ver proyectos archivados por cliente inexistente', async () => {
    const { token } = await setupUserClientProject('project16@test.com');
    await api
      .get(`/api/project/archived/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Restaurar proyecto archivado', async () => {
    const { token, projectId } = await setupUserClientProject('project9@test.com');
    await api.delete(`/api/project/archive/${projectId}`).auth(token, { type: 'bearer' });
    const res = await api.patch(`/api/project/restore/${projectId}`).auth(token, { type: 'bearer' }).expect(200);
    expect(res.body.archived).toBe(false);
  });

  it('Restaurar proyecto inexistente', async () => {
    const { token } = await setupUserClientProject('project17@test.com');
    await api
      .patch(`/api/project/restore/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Eliminar proyecto (hard delete)', async () => {
    const { token, projectId } = await setupUserClientProject('project10@test.com');
    const res = await api.delete(`/api/project/delete/${projectId}`).auth(token, { type: 'bearer' }).expect(200);
    expect(res.body.message).toBe('Proyecto eliminado correctamente');
  });
});

afterAll(async () => {
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await projectsModel.deleteMany({});
  await mongoose.connection.close();
  server.close();
});
