export const CacheKeys = {
  departments: {
    all: "departments:all",
    one: (id) => `departments:${id}`,
  },

  employees: {
    all: "employees:all",
    one: (id) => `employees:${id}`,
  },

  projects: {
    all: "projects:all",
    one: (id) => `projects:${id}`,
  },

  tasks: {
    all: "tasks:all",
    one: (id) => `tasks:${id}`,
  },

  users: {
    all: "users:all",
    one: (id) => `users:${id}`,
  },

  activity: {
    all: "activity:all",
  },
  
  files: {
    all: "files:all",
    one: (id) => `files:${id}`,
  }
};
