import { api } from './api';

// Service to create a new ToDo
export const createToDo = async (toDoData: any) => {
  try {
    const response = await api.post('/todos', toDoData);
    return response.data;
  } catch (error) {
    console.error('Error creating ToDo:', error);
    throw error;
  }
};
// Function to fetch ToDos created by the current user
export const fetchToDosByAssignedBy = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await api.get(`/todos/created-by/`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ToDos by assignedBy:', error);
    throw error;
  }
};

// Function to fetch ToDos assigned to the current user
export const fetchToDosByAssignedTo = async (
  assignedId: number,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await api.get(`/todos/assigned-to/${assignedId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ToDos assigned to user:', error);
    throw error;
  }
};

// Service to fetch all ToDos with pagination and filters
export const fetchToDos = async (
  page: number = 1,
  limit: number = 10,
  search = '',
  priority = '',
  sortBy = 'date'
) => {
  try {
    const response = await api.get('/todos', {
      params: { page, limit, search, priority, sortBy }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ToDos:', error);
    throw error;
  }
};

// Service to fetch ToDos assigned to the current authenticated user
export const fetchToDosForSelf = async ({
  page,
  limit,
  sort,
  search,
  priority
}: {
  page: number;
  limit: number;
  sort: string;
  search?: string;
  priority?: string;
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort
  });

  if (search) params.append('search', search);
  if (priority) params.append('priority', priority);

  const response = await api.get(`/todos/self?${params.toString()}`);
  return response.data;
};

// Service to assign a ToDo to a role
export const assignToDoToRole = async (todoId: number, role: string) => {
  try {
    const response = await api.post(`/todos/${todoId}/assign`, { role });
    return response.data;
  } catch (error) {
    console.error('Error assigning ToDo:', error);
    throw error;
  }
};

// Service to toggle ToDo completion
export const toggleToDoCompletion = async (todoId: number) => {
  try {
    const response = await api.patch(`/todos/${todoId}/toggle-completion`);
    return response.data;
  } catch (error) {
    console.error('Error toggling ToDo completion:', error);
    throw error;
  }
};

// const handleClearCompleted = async () => {
//   const completedIds = todos.filter((todo) => todo.completed).map((todo) => todo.id);
//   setToDos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
//   try {
//     await fetch('/api/todos/clear-completed', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ ids: completedIds }),
//     });
//   } catch (error) {
//     console.error('Failed to clear completed todos:', error);
//   }
// };

// Service to delete a ToDo
export const deleteToDo = async (todoId: number) => {
  try {
    const response = await api.delete(`/todos/${todoId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ToDo:', error);
    throw error;
  }
};

export const removeUserFromToDo = async (todoId: number, userId: number) => {
  try {
    const response = await api.delete(`/todos/${todoId}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing user from ToDo:', error);
    throw error;
  }
};

export const assignToDoToUsers = async (todoId: number, userIds: number[]) => {
  try {
    const response = await api.put(`/todos/${todoId}/assign-users`, {
      userIds
    });
    return response.data;
  } catch (error) {
    console.error('Failed to assign ToDo to users:', error);
    throw error;
  }
};

export const fetchAssignedUsersForTodo = async (
  todoId: number,
  params: FetchAssignedUsersParams = {}
): Promise<FetchAssignedUsersResponse> => {
  try {
    const response = await api.get<FetchAssignedUsersResponse>(
      `/todos/${todoId}/assigned-users`,
      {
        params
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch assigned users:', error);
    // You can customize error handling here based on your application's needs
    throw error.response?.data || error.message || 'Unknown error';
  }
};

interface FetchAssignedUsersParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

interface AssignedUser {
  id?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  completed: boolean;
}

interface FetchAssignedUsersResponse {
  message: string;
  total: number;
  page: number;
  limit: number;
  assignees: AssignedUser[];
}
