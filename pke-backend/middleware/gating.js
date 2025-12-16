class GatingMiddleware {
  constructor() {
    this.gates = {
      A: this.checkUserPermissions.bind(this),
      B: this.checkRequestQuality.bind(this),
      C: this.checkSystemLoad.bind(this)
    };
  }

  async checkUserPermissions(req) {
    // Gate A: User authentication & permissions
    if (!req.user) {
      return { passed: false, reason: 'Authentication required' };
    }

    // Check user role/access
    const userRole = req.user.role || 'user';
    const allowedRoles = ['user', 'admin', 'premium'];
    
    if (!allowedRoles.includes(userRole)) {
      return { passed: false, reason: 'Insufficient permissions' };
    }

    // Check usage limits (you'll need to implement this based on your DB)
    const userUsage = await this.getUserUsage(req.user.id);
    if (userUsage.dailyLimitExceeded) {
      return { passed: false, reason: 'Daily limit exceeded' };
    }

    return { passed: true, grade: 'A' };
  }

  async checkRequestQuality(req) {
    // Gate B: Validate request payload
    const { invocationType, payload } = req.body;

    if (!invocationType || !payload) {
      return { passed: false, reason: 'Missing required fields' };
    }

    // Validate invocation type (1-5 based on your frontend)
    const validTypes = [1, 2, 3, 4, 5];
    if (!validTypes.includes(parseInt(invocationType))) {
      return { passed: false, reason: 'Invalid invocation type' };
    }

    // Validate payload structure based on invocation type
    const validationResult = this.validatePayloadByType(invocationType, payload);
    if (!validationResult.valid) {
      return { passed: false, reason: validationResult.error };
    }

    return { passed: true, grade: 'B' };
  }

  async checkSystemLoad(req) {
    // Gate C: System health & rate limiting
    // Implement rate limiting
    const clientIP = req.ip;
    const endpoint = req.path;
    
    if (await this.isRateLimited(clientIP, endpoint)) {
      return { 
        passed: false, 
        reason: 'Rate limit exceeded',
        retryAfter: 60
      };
    }

    // Check system resources (simplified)
    const systemLoad = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
    if (systemLoad > 0.85) {
      return { passed: false, reason: 'System under high load' };
    }

    return { passed: true, grade: 'C' };
  }

  validatePayloadByType(type, payload) {
    // Add your validation logic here
    const validators = {
      1: (p) => p.courseTitle && p.audience, // Course Blueprint
      2: (p) => p.moduleTitle && p.learningObjectives, // Course Module
      3: (p) => p.pathName && p.targetAudience, // Learning Path
      4: (p) => p.assessmentType && p.questions, // Assessment
      5: (p) => p.templateType && p.mapping // Template Mapping
    };

    const validator = validators[type];
    if (!validator) {
      return { valid: false, error: 'No validator for this type' };
    }

    return validator(payload) 
      ? { valid: true }
      : { valid: false, error: 'Invalid payload structure' };
  }

  async getUserUsage(userId) {
    // Implement based on your database
    // This is a placeholder
    return { dailyLimitExceeded: false };
  }

  async isRateLimited(ip, endpoint) {
    // Implement rate limiting logic
    // Consider using express-rate-limit package
    return false;
  }

  async gateRequest(req, res, next) {
    try {
      const gateResults = {
        A: await this.gates.A(req),
        B: await this.gates.B(req),
        C: await this.gates.C(req)
      };

      // Check if all gates passed
      const allPassed = Object.values(gateResults).every(result => result.passed);
      
      if (!allPassed) {
        const failedGates = Object.entries(gateResults)
          .filter(([_, result]) => !result.passed)
          .map(([gate, result]) => ({ gate, reason: result.reason }));

        const error = new Error('Gating check failed');
        error.status = 429;
        error.gatingResults = {
          passed: false,
          failedGates,
          details: gateResults
        };
        return next(error);
      }

      // All gates passed, attach results to request
      req.gatingResults = {
        passed: true,
        details: gateResults
      };

      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GatingMiddleware();
