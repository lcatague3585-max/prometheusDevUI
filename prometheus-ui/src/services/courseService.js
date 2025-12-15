import api from './api'

const courseService = {
  createCourse: async (courseData) => {
    return api.post('/courses', courseData)
  },

  getCourse: async (courseId) => {
    return api.get(`/courses/${courseId}`)
  },

  updateCourse: async (courseId, courseData) => {
    return api.put(`/courses/${courseId}`, courseData)
  },

  deleteCourse: async (courseId) => {
    return api.delete(`/courses/${courseId}`)
  },

  listCourses: async () => {
    return api.get('/courses')
  },

  addLearningObjective: async (courseId, objective) => {
    return api.post(`/courses/${courseId}/objectives`, objective)
  },

  updateLearningObjective: async (courseId, objectiveId, objective) => {
    return api.put(`/courses/${courseId}/objectives/${objectiveId}`, objective)
  },

  deleteLearningObjective: async (courseId, objectiveId) => {
    return api.delete(`/courses/${courseId}/objectives/${objectiveId}`)
  },

  addModule: async (courseId, module) => {
    return api.post(`/courses/${courseId}/modules`, module)
  },

  updateModule: async (courseId, moduleId, module) => {
    return api.put(`/courses/${courseId}/modules/${moduleId}`, module)
  },

  deleteModule: async (courseId, moduleId) => {
    return api.delete(`/courses/${courseId}/modules/${moduleId}`)
  },

  addLesson: async (courseId, moduleId, lesson) => {
    return api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, lesson)
  },

  updateLesson: async (courseId, moduleId, lessonId, lesson) => {
    return api.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, lesson)
  },

  deleteLesson: async (courseId, moduleId, lessonId) => {
    return api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
  },

  getScalarData: async (courseId) => {
    return api.get(`/courses/${courseId}/scalar`)
  },

  updateScalarData: async (courseId, scalarData) => {
    return api.put(`/courses/${courseId}/scalar`, scalarData)
  }
}

export default courseService
