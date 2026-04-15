const express = require('express');
const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All task routes require authentication

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
