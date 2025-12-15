/**
 * Course Routes
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

router.use(requireAuth);

router.post('/', courseController.createCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.put('/:id/title', courseController.saveTitle);
router.post('/:id/collaborators', courseController.addCollaborator);
router.delete('/:id/collaborators/:userId', courseController.removeCollaborator);
router.get('/:id/history', courseController.getRevisionHistory);
router.get('/:id/export', courseController.exportCourse);
router.post('/:id/clone', courseController.cloneCourse);

module.exports = router;
