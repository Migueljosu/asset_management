const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');

jest.mock('../utils/prisma', () => ({
  equipment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  log: {
    create: jest.fn(),
  },
}));

jest.mock('../middlewares/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 1, perfil: 'admin' };
    next();
  };
});

jest.mock('../middlewares/roleMiddleware', () => {
  return () => (req, res, next) => next();
});

describe('Equipment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/equipment', () => {
    it('should create equipment with valid data', async () => {
      prisma.equipment.findUnique.mockResolvedValue(null);
      prisma.equipment.create.mockResolvedValue({
        id: 1,
        nome: 'Laptop Dell',
        codigo: 'LAP-001',
        estado: 'disponivel',
        createdAt: new Date(),
      });
      prisma.log.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', 'Bearer fake-token')
        .send({
          nome: 'Laptop Dell',
          codigo: 'LAP-001',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.codigo).toBe('LAP-001');
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', 'Bearer fake-token')
        .send({
          nome: '',
          codigo: '',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate code', async () => {
      prisma.equipment.findUnique.mockResolvedValue({
        id: 1,
        codigo: 'LAP-001',
      });

      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', 'Bearer fake-token')
        .send({
          nome: 'Laptop Dell',
          codigo: 'LAP-001',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Código já existe');
    });
  });

  describe('GET /api/equipment', () => {
    it('should list all equipment with pagination', async () => {
      prisma.equipment.count.mockResolvedValue(2);
      prisma.equipment.findMany.mockResolvedValue([
        { id: 1, nome: 'Laptop', codigo: 'LAP-001', estado: 'disponivel' },
        { id: 2, nome: 'Monitor', codigo: 'MON-001', estado: 'em_uso' },
      ]);

      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(2);
    });
  });

  describe('PUT /api/equipment/:id', () => {
    it('should update equipment', async () => {
      prisma.equipment.findUnique.mockResolvedValue({
        id: 1,
        nome: 'Laptop Dell',
        estado: 'disponivel',
      });
      prisma.equipment.update.mockResolvedValue({
        id: 1,
        nome: 'Laptop Dell Updated',
        estado: 'manutencao',
      });
      prisma.log.create.mockResolvedValue({});

      const res = await request(app)
        .put('/api/equipment/1')
        .set('Authorization', 'Bearer fake-token')
        .send({
          nome: 'Laptop Dell Updated',
          estado: 'manutencao',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.nome).toBe('Laptop Dell Updated');
    });

    it('should reject invalid estado enum', async () => {
      const res = await request(app)
        .put('/api/equipment/1')
        .set('Authorization', 'Bearer fake-token')
        .send({
          estado: 'invalid_status',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/equipment/:id', () => {
    it('should delete available equipment', async () => {
      prisma.equipment.findUnique.mockResolvedValue({
        id: 1,
        estado: 'disponivel',
      });
      prisma.equipment.delete.mockResolvedValue({});
      prisma.log.create.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/equipment/1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Equipamento deletado');
    });

    it('should not delete equipment in use', async () => {
      prisma.equipment.findUnique.mockResolvedValue({
        id: 1,
        estado: 'em_uso',
      });

      const res = await request(app)
        .delete('/api/equipment/1')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Não pode deletar equipamento em uso');
    });
  });
});
