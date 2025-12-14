/**
 * Admin Controller
 * Administrative functions for PKE management
 */

const User = require('../models/User');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');

// =============================================================================
// DASHBOARD
// =============================================================================

/**
 * Get system statistics
 * GET /api/admin/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      recentInvocations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      AuditLog.countDocuments({
        action: { $in: ['INVOCATION_COMPLETED', 'INVOCATION_STARTED'] },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
    ]);

    // Get invocations by type
    const invocationStats = await AuditLog.aggregate([
      {
        $match: {
          action: 'INVOCATION_COMPLETED',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$invocation.number',
          count: { $sum: 1 },
          avgDuration: { $avg: '$invocation.duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Evidence grade distribution
    const evidenceStats = await AuditLog.aggregate([
      {
        $match: {
          action: 'INVOCATION_COMPLETED',
          'invocation.evidenceGrade': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$invocation.evidenceGrade',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        courses: { total: totalCourses, published: publishedCourses },
        invocations: {
          last24Hours: recentInvocations,
          byType: invocationStats,
          evidenceDistribution: evidenceStats,
        },
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 * GET /api/admin/audit-logs
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const {
      action,
      userId,
      courseId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// USER MANAGEMENT
// =============================================================================

/**
 * Get all users
 * GET /api/admin/users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'superadmin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be: ${validRoles.join(', ')}`
      });
    }

    // Prevent changing own role
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log admin action
    await AuditLog.create({
      action: 'ADMIN_ACTION',
      userId: req.user.id,
      metadata: {
        action: 'USER_ROLE_CHANGED',
        targetUserId: user._id,
        newRole: role,
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (activate/deactivate)
 * PUT /api/admin/users/:id/status
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    // Prevent deactivating self
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log admin action
    await AuditLog.create({
      action: 'ADMIN_ACTION',
      userId: req.user.id,
      metadata: {
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        targetUserId: user._id,
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// COURSE MANAGEMENT
// =============================================================================

/**
 * Get all courses (admin view)
 * GET /api/admin/courses
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const { status, stage, ownerId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (stage) query.currentStage = stage;
    if (ownerId) query.owner = ownerId;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Force delete a course
 * DELETE /api/admin/courses/:id
 */
exports.forceDeleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Log admin action
    await AuditLog.create({
      action: 'ADMIN_ACTION',
      userId: req.user.id,
      metadata: {
        action: 'COURSE_FORCE_DELETED',
        courseId: course._id,
        courseTitle: course.title,
      }
    });

    res.json({
      success: true,
      message: 'Course permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// KNOWLEDGE PACKS (Grade B Evidence)
// =============================================================================

// In-memory store for demo (use database in production)
let knowledgePacks = [];

/**
 * Get all knowledge packs
 * GET /api/admin/knowledge-packs
 */
exports.getKnowledgePacks = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { knowledgePacks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create knowledge pack
 * POST /api/admin/knowledge-packs
 */
exports.createKnowledgePack = async (req, res, next) => {
  try {
    const { name, description, domain, content, tags } = req.body;

    const pack = {
      id: Date.now().toString(),
      name,
      description,
      domain,
      content,
      tags: tags || [],
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    knowledgePacks.push(pack);

    res.status(201).json({
      success: true,
      data: { knowledgePack: pack }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update knowledge pack
 * PUT /api/admin/knowledge-packs/:id
 */
exports.updateKnowledgePack = async (req, res, next) => {
  try {
    const index = knowledgePacks.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Knowledge pack not found'
      });
    }

    knowledgePacks[index] = {
      ...knowledgePacks[index],
      ...req.body,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: { knowledgePack: knowledgePacks[index] }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete knowledge pack
 * DELETE /api/admin/knowledge-packs/:id
 */
exports.deleteKnowledgePack = async (req, res, next) => {
  try {
    const index = knowledgePacks.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Knowledge pack not found'
      });
    }

    knowledgePacks.splice(index, 1);

    res.json({
      success: true,
      message: 'Knowledge pack deleted'
    });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// TEMPLATES (Grade A Evidence)
// =============================================================================

// In-memory store for demo
let templates = [];

/**
 * Get all templates
 * GET /api/admin/templates
 */
exports.getTemplates = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload template
 * POST /api/admin/templates
 */
exports.uploadTemplate = async (req, res, next) => {
  try {
    const { name, type, description, structure } = req.body;

    const template = {
      id: Date.now().toString(),
      name,
      type, // 'pptx', 'docx', 'xlsx'
      description,
      structure,
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    templates.push(template);

    res.status(201).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete template
 * DELETE /api/admin/templates/:id
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const index = templates.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    templates.splice(index, 1);

    res.json({
      success: true,
      message: 'Template deleted'
    });
  } catch (error) {
    next(error);
  }
};
