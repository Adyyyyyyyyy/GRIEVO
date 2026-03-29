const API_BASE_URL = 'http://localhost:5000';

export const api = {
  register: async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

 submitGrievance: async (data: any, file?: File) => {
    const formData = new FormData();
    formData.append('student_id', String(data.student_id));
    formData.append('category_id', String(data.category_id));
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('is_anonymous', String(data.is_anonymous));
    if (file) formData.append('attachment', file);

    const response = await fetch(`${API_BASE_URL}/grievance/submit`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  getMyGrievances: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/grievance/my/${studentId}`);
    return response.json();
  },

  getGrievanceResponses: async (grievanceId: number) => {
    const response = await fetch(`${API_BASE_URL}/grievance/${grievanceId}/responses`);
    return response.json();
  },

  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/departments`);
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  getCategoriesByDepartment: async (deptId: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/by-department/${deptId}`);
    return response.json();
  },

   getAllGrievances: async (departmentId?: number) => {
    const url = departmentId
      ? `${API_BASE_URL}/admin/grievances?department_id=${departmentId}`
      : `${API_BASE_URL}/admin/grievances`;
    const response = await fetch(url);
    return response.json();
  },

  assignGrievance: async (data: { grievance_id: number; resolver_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/admin/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateGrievanceStatus: async (data: { grievance_id: number; status: string }) => {
    const response = await fetch(`${API_BASE_URL}/resolver/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  addResponse: async (data: { grievance_id: number; responder_id: number; response_text: string }) => {
    const response = await fetch(`${API_BASE_URL}/resolver/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getDelayedGrievances: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/delayed-grievances`);
    return response.json();
  },

    submitFeedback: async (data: { grievance_id: number; is_resolved: boolean; comments: string }) => {
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};