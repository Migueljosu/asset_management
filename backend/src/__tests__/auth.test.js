const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        nome: 'Test User',
        email: 'test@example.com',
        perfil: 'funcionario',
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Test User',
          email: 'test@example.com',
          senha: 'password123',
          perfil: 'funcionario',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should block admin registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Admin User',
          email: 'admin@example.com',
          senha: 'password123',
          perfil: 'admin',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Não permitido criar admin');
    });

    it('should reject invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Te',
          email: 'invalid-email',
          senha: '123',
          perfil: 'invalid',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Test User',
          email: 'test@example.com',
          senha: 'password123',
          perfil: 'funcionario',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Email já registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'hashed_password',
        perfil: 'funcionario',
      });
      prisma.user.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          senha: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Credenciais inválidas');
    });

    it('should reject invalid input data', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          senha: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

