type TaskStatus = 'In Progress' | 'Completed' | 'Cancelled';

export interface TaskInterface {
   id: string,
    title: string,
    description: string | undefined,
    status: TaskStatus,
    createdAt:  string,
    deadline?: string | null,
    address?: string,
}

const statusPriority: Record<TaskStatus, number> = {
  'In Progress': 1,
  'Completed': 2,
  'Cancelled': 3
};


