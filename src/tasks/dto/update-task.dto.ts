import { TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  userId?: number;
}
