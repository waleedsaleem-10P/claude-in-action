import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.entity';

const mockTask: Task = {
  id: 1,
  title: 'Original title',
  description: 'Original description',
  status: TaskStatus.OPEN,
  userId: null,
  user: null,
};

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

describe('TasksService.update', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('updates and returns the task with merged fields', async () => {
    const dto = { title: 'New title', status: TaskStatus.IN_PROGRESS };
    const updated = { ...mockTask, ...dto };
    mockRepository.findOne.mockResolvedValue({ ...mockTask });
    mockRepository.save.mockResolvedValue(updated);

    const result = await service.update(1, dto);

    expect(mockRepository.save).toHaveBeenCalledWith({ ...mockTask, ...dto });
    expect(result.title).toBe('New title');
    expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    expect(result.description).toBe('Original description');
  });

  it('applies partial updates without overwriting unchanged fields', async () => {
    const dto = { status: TaskStatus.DONE };
    const updated = { ...mockTask, status: TaskStatus.DONE };
    mockRepository.findOne.mockResolvedValue({ ...mockTask });
    mockRepository.save.mockResolvedValue(updated);

    const result = await service.update(1, dto);

    expect(result.title).toBe('Original title');
    expect(result.status).toBe(TaskStatus.DONE);
  });

  it('throws NotFoundException when task does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.update(99, { title: 'x' })).rejects.toThrow(NotFoundException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('returns the value that the repository saves', async () => {
    const savedTask = { ...mockTask, title: 'Saved', id: 1 };
    mockRepository.findOne.mockResolvedValue({ ...mockTask });
    mockRepository.save.mockResolvedValue(savedTask);

    const result = await service.update(1, { title: 'Saved' });

    expect(result).toEqual(savedTask);
  });
});
