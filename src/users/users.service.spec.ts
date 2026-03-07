import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'hashed_password',
  tasks: [],
};

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all users', async () => {
      const users = [mockUser, { ...mockUser, id: 2, email: 'bob@example.com' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });

    it('returns an empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the user when found', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...mockUser });

      const result = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('User #99 not found');
    });
  });

  // ─── findByEmail ────────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('returns the user when email matches', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser });

      const result = await service.findByEmail('alice@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
        select: ['id', 'email', 'password'],
      });
      expect(result).toEqual(mockUser);
    });

    it('returns null when no user matches the email', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates and returns a new user', async () => {
      const dto = { name: 'Bob', email: 'bob@example.com' };
      const created = { ...mockUser, ...dto, id: 2 };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  // ─── createWithPassword ─────────────────────────────────────────────────────

  describe('createWithPassword', () => {
    it('creates and returns a user with a hashed password', async () => {
      const dto = { name: 'Alice', email: 'alice@example.com', password: 'hashed' };
      const created = { ...mockUser, ...dto };
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.createWithPassword(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the user with merged fields', async () => {
      const dto = { name: 'Alice Updated', email: 'new@example.com' };
      const updated = { ...mockUser, ...dto };
      mockRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({ ...mockUser, ...dto });
      expect(result.name).toBe('Alice Updated');
      expect(result.email).toBe('new@example.com');
    });

    it('applies partial updates without overwriting unchanged fields', async () => {
      const dto = { name: 'Alice Renamed' };
      const updated = { ...mockUser, name: 'Alice Renamed' };
      mockRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(result.name).toBe('Alice Renamed');
      expect(result.email).toBe(mockUser.email);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('returns the value that the repository saves', async () => {
      const saved = { ...mockUser, name: 'Saved Name' };
      mockRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockRepository.save.mockResolvedValue(saved);

      const result = await service.update(1, { name: 'Saved Name' });

      expect(result).toEqual(saved);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes the user and returns void', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(1)).resolves.toBeUndefined();

      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});