/**
 * Gating Middleware
 * Enforces PKE workflow gates and stage progression
 * 
 * Gate A: Authentication (handled by auth middleware)
 * Gate B: Course title saved (minimum course context)
 */

const Course = require('../models/Course');

/**
 * Gate B: Require course title to be saved
 * User must have saved a course title before accessing generation features
 */
const requireGateB = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Course ID required',
        gate: 'B',
        code: 'NO_COURSE_ID'
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        gate: 'B',
        code: 'COURSE_NOT_FOUND'
      });
    }

    // Check ownership or collaboration
    const hasAccess = 
      course.owner.toString() === req.user.id ||
      course.collaborators.some(c => c.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this course',
        gate: 'B',
        code: 'ACCESS_DENIED'
      });
    }

    // Check Gate B: Title must be saved
    if (!course.title || course.title.trim().length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Course title must be saved before proceeding',
        gate: 'B',
        code: 'GATE_B_FAILED',
        hint: 'Save a course title first using PUT /api/courses/:id/title'
      });
    }

    // Mark Gate B as passed if not already
    if (!course.gates.gateB) {
      course.gates.gateB = true;
      await course.save();
    }

    // Attach course to request for downstream use
    req.course = course;
    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Require specific invocation to be completed
 */
const requireInvocation = (invocationNumber) => {
  return async (req, res, next) => {
    try {
      const course = req.course;

      if (!course) {
        return res.status(500).json({
          success: false,
          error: 'Course not loaded. Use requireGateB first.',
        });
      }

      const completed = course.completedInvocations.find(
        inv => inv.invocation === invocationNumber
      );

      if (!completed) {
        return res.status(403).json({
          success: false,
          error: `Invocation ${invocationNumber} must be completed first`,
          code: 'INVOCATION_REQUIRED',
          required: invocationNumber,
          completed: course.completedInvocations.map(i => i.invocation),
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check stage progression
 * Ensures user follows the correct workflow order
 */
const requireStage = (...allowedStages) => {
  return async (req, res, next) => {
    try {
      const course = req.course;

      if (!course) {
        return res.status(500).json({
          success: false,
          error: 'Course not loaded',
        });
      }

      if (!allowedStages.includes(course.currentStage)) {
        return res.status(403).json({
          success: false,
          error: `This action requires stage: ${allowedStages.join(' or ')}`,
          currentStage: course.currentStage,
          allowedStages,
          code: 'WRONG_STAGE'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Invocation prerequisites mapping
 */
const INVOCATION_PREREQUISITES = {
  1: [],                    // Invocation 1 needs only Gate B
  2: [1],                   // Invocation 2 needs Invocation 1
  3: [1, 2],                // Invocation 3 needs 1 and 2
  4: [1, 2, 3],             // Invocation 4 needs 1, 2, and 3
  5: [],                    // Invocation 5 (admin) has no prerequisites
};

/**
 * Check invocation prerequisites
 */
const checkInvocationPrereqs = (invocationNumber) => {
  return async (req, res, next) => {
    try {
      const course = req.course;
      const prereqs = INVOCATION_PREREQUISITES[invocationNumber] || [];

      const completedNumbers = course.completedInvocations.map(i => i.invocation);
      const missing = prereqs.filter(p => !completedNumbers.includes(p));

      if (missing.length > 0) {
        return res.status(403).json({
          success: false,
          error: `Complete invocation(s) ${missing.join(', ')} first`,
          code: 'PREREQUISITES_NOT_MET',
          required: prereqs,
          completed: completedNumbers,
          missing,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireGateB,
  requireInvocation,
  requireStage,
  checkInvocationPrereqs,
  INVOCATION_PREREQUISITES,
};
