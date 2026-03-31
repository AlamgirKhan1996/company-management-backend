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
  },

  reports: {
    overview:    (companyId, filters) => `reports:overview:${companyId}:${JSON.stringify(filters)}`,
    projects:    (companyId, filters) => `reports:projects:${companyId}:${JSON.stringify(filters)}`,
    tasks:       (companyId, filters) => `reports:tasks:${companyId}:${JSON.stringify(filters)}`,
    employees:   (companyId, filters) => `reports:employees:${companyId}:${JSON.stringify(filters)}`,
    departments: (companyId, filters) => `reports:departments:${companyId}:${JSON.stringify(filters)}`,
    activity:    (companyId, filters) => `reports:activity:${companyId}:${JSON.stringify(filters)}`,
    ai:          (companyId, filters) => `reports:ai:${companyId}:${JSON.stringify(filters)}`,
  },
};
