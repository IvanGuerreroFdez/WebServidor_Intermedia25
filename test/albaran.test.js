const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const projectsModel = require('../models/project.js');
const albaranesModel = require('../models/albaran.js');
const api = supertest(app);
const path = require('path');

//Antes del testing --> registrar un usuario y crear un cliente y un proyecto
async function setupUserClientProjectAlbaran(email) {
  await api.post('/api/user/register').send({ email, password: 'Test1234' });
  const user = await usersModel.findOne({ email });
  await api
    .put('/api/user/validatemail')
    .auth(user.token, { type: 'bearer' })
    .send({ code: user.verificationCode });

  const token = user.token || require('../utils/handleJwt').generateToken(user, process.env.JWT_SECRET);

  const client = await clientsModel.create({
    name: `Cliente ${email}`,
    cif: 'X12345678',
    address: {
      street: 'Calle Test',
      number: 1,
      postal: 28000,
      city: 'Madrid',
      province: 'Madrid'
    },
    userId: user._id
  });

  const project = await projectsModel.create({
    name: `Proyecto ${email}`,
    code: '001',
    projectCode: 'PR001',
    clientId: client._id,
    userId: user._id,
    address: {
      street: 'Calle Proyecto',
      number: 10,
      postal: 28010,
      city: 'Madrid',
      province: 'Madrid'
    }
  });

  return { token, clientId: client._id, projectId: project._id };
}

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await projectsModel.deleteMany({});
  await albaranesModel.deleteMany({});
});

describe('Albaranes', () => {
  it('Crear un albarán (materiales)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a1@test.com');
    const res = await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        material: ["arena", "hierro"],
        description: "Albarán de materiales",
        workdate: "2025-04-17"
      })
      .expect(200);

    expect(res.body.material.length).toBe(2);
  });

  it('Fallo al crear albarán (materiales)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('error1@test.com');

    await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        description: "Falta materiales",
        workdate: "2025-04-10"
      })
      .expect(422);
  });

  it('Crear un albarán (trabajadores)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a2@test.com');
    const res = await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Juan", hours: 5 }],
        description: "Albarán horas",
        workdate: "2025-04-16"
      })
      .expect(200);

    expect(res.body.format).toBe("hours");
  });

  it('Fallo al crear albarán (trabajadores)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('error2@test.com');

    await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        description: "Faltan workers",
        workdate: "2025-04-09"
      })
      .expect(422);
  });

  it('Mostrar todos los albaranes del usuario', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a3@test.com');
    await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        material: ["piedra"],
        description: "Piedra",
        workdate: "2025-04-15"
      });

    const res = await api.get('/api/albaran/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Mostrar todos los albaranes de un usuario inexistente', async () => {
    const fakeUser = { id: '999999999999999999999999', email: 'ghost@user.com' };
    const fakeToken = generateToken(fakeUser, process.env.JWT_SECRET);

    const res = await api.get('/api/albaran/show')
      .auth(fakeToken, { type: 'bearer' })
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('Mostrar albarán por ID', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a4@test.com');
    const created = await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Ana", hours: 4 }],
        description: "Trabajadora",
        workdate: "2025-04-14"
      });

    const res = await api.get(`/api/albaran/show/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(created.body._id);
  });

  it('Mostrar albarán por ID inexistente', async () => {
    const { token } = await setupUserClientProjectAlbaran('error3@test.com');

    await api.get('/api/albaran/show/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Firmar albarán y generar PDF', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a5@test.com');
    const created = await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Luis", hours: 2 }],
        description: "Obra rápida",
        workdate: "2025-04-13"
      });

    const res = await api.post(`/api/albaran/firmar/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'))
      .expect(200);

    expect(res.body.pdf).toMatch(/^https?:\/\//);
  });

  it('Firmar albarán con ID inexistente', async () => {
    const { token } = await setupUserClientProjectAlbaran('error4@test.com');

    await api.post('/api/albaran/firmar/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'))
      .expect(404);
  });

  it('Descargar el PDF del albarán', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a6@test.com');
    const created = await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Sara", hours: 3 }],
        description: "Prueba",
        workdate: "2025-04-12"
      });

    await api.post(`/api/albaran/firmar/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'));

    const res = await api.get(`/api/albaran/pdf/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.headers['content-type']).toBe('application/pdf');
  }, 10000);

  it('Descargar PDF de albarán inexistente', async () => {
    const { token } = await setupUserClientProjectAlbaran('error5@test.com');

    await api.get('/api/albaran/pdf/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Eliminar albarán firmado (debe fallar)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectAlbaran('a7@test.com');
    const created = await api.post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        material: ["cemento"],
        description: "Para borrar",
        workdate: "2025-04-11"
      });

    await api.post(`/api/albaran/firmar/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'));

    const res = await api.delete(`/api/albaran/delete/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .expect(403);

    expect(res.body.message).toMatch(/firmado/i);
  }, 10000);

  it('Eliminar albarán inexistente', async () => {
    const { token } = await setupUserClientProjectAlbaran('error6@test.com');

    await api.delete('/api/albaran/delete/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .expect(404);
  });
});

afterAll(async () => {
  await Promise.all([
    albaranesModel.deleteMany({}),
    projectsModel.deleteMany({}),
    clientsModel.deleteMany({}),
    usersModel.deleteMany({})
  ]);
  
  setTimeout(async () => {
    await mongoose.connection.close();
    server.close();
  }, 1000);
});