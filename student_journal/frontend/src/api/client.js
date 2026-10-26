import axios from "axios";

export const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const detail = 
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message || 'Неизвестная ошибка'
        return Promise.reject(new Error(typeof detail === 'string' ? detail : JSON.stringify(detail)))
    }
)

export const studentsApi = {
    list: (params) => api.get('/students', { params }).then((r) => r.data),
    get: (id) => api.get(`/students/${id}`).then((r) => r.data),
    create: (data) => api.post('/students', data).then((r) => r.data),
    update: (id, data) => api.patch(`/students/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/students/${id}`),
    averages: (params) => api.get('/students/averages', { params }).then((r) => r.data),
    average: (id) => api.get(`/students/${id}/average`).then((r) => r.data),
}

export const gradesApi = {
    list: (params) => api.get('/grades', { params }).then((r) => r.data),
    get: (id) => api.get(`/grades/${id}`).then((r) => r.data),
    create: (data) => api.post('/grades', data).then((r) => r.data),
    update: (id, data) => api.patch(`/grades/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/grades/${id}`),
}