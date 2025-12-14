/**
 * Invocation Controller
 * Handles PKE Generation Invocations 1-5
 * 
 * Invocation 1: Course Description + Assistance Tier
 * Invocation 2: Learning Objectives
 * Invocation 3: Topics / Subtopics / Lessons / Performance Criteria
 * Invocation 4: Full Course Build (Materials)
 * Invocation 5: Template Mapping (Admin Only)
 */

const Course = require('../models/Course');
const llmService = require('../services/llmService');
const contextPackager = require('../services/contextPackager');
const evidenceGrader = require('../services/evidenceGrader');
const auditService = require('../services/auditService');
const validatorService = require('../services/validatorService');
const { INVOCATION_PROMPTS } = require('../utils/prompts');

// =============================================================================
// INVOCATION 1: Course Description + Assistance Tier
// =============================================================================

/**
 * Generate course description and determine assistance tier
 * POST /api/invoke/1
 */
exports.invocation1 = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const course = req.course; // Attached by gating middleware
    const { additionalContext, assistanceTier } = req.body;

    // Build context package
    const context = contextPackager.buildInvocation1Context({
      course,
      additionalContext,
      requestedTier: assistanceTier,
    });

    // Call LLM
    const llmResponse = await llmService.generate({
      prompt: INVOCATION_PROMPTS.invocation1,
      context,
      invocation: 1,
    });

    // Parse response
    const result = llmService.parseResponse(llmResponse, 'invocation1');

    // Grade evidence
    const evidenceGrade = evidenceGrader.grade({
      invocation: 1,
      sources: result.sources || [],
      hasTemplateMatch: false,
      hasCuratedContent: false,
    });

    // Validate output
    const validation = validatorService.validateInvocation1(result);

    // Log to audit
    await auditService.logInvocation({
      invocation: 1,
      courseId: course._id,
      userId: req.user.id,
      input: { additionalContext, assistanceTier },
      output: result,
      evidenceGrade,
      duration: Date.now() - startTime,
      llmDetails: llmResponse.usage,
    });

    res.json({
      success: true,
      data: {
        invocation: 1,
        result: {
          description: result.description,
          assistanceTier: result.assistanceTier || assistanceTier || 'full',
          suggestions: result.suggestions || [],
        },
        evidenceGrade,
        validation,
        actions: ['accept', 'revise'],
      }
    });

  } catch (error) {
    await auditService.logInvocationError({
      invocation: 1,
      courseId: req.course?._id,
      userId: req.user?.id,
      error: error.message,
      duration: Date.now() - startTime,
    });
    next(error);
  }
};

// =============================================================================
// INVOCATION 2: Learning Objectives
// =============================================================================

/**
 * Generate learning objectives
 * POST /api/invoke/2
 */
exports.invocation2 = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const course = req.course;
    const { count = 5, bloomLevels, focusAreas } = req.body;

    // Build context with previous invocation results
    const context = contextPackager.buildInvocation2Context({
      course,
      requestedCount: count,
      bloomLevels,
      focusAreas,
    });

    // Call LLM
    const llmResponse = await llmService.generate({
      prompt: INVOCATION_PROMPTS.invocation2,
      context,
      invocation: 2,
    });

    // Parse response
    const result = llmService.parseResponse(llmResponse, 'invocation2');

    // Grade evidence
    const evidenceGrade = evidenceGrader.grade({
      invocation: 2,
      sources: result.sources || [],
      hasTemplateMatch: false,
      hasCuratedContent: context.hasPolicyReference,
    });

    // Validate learning objectives
    const validation = validatorService.validateInvocation2(result);

    // Log to audit
    await auditService.logInvocation({
      invocation: 2,
      courseId: course._id,
      userId: req.user.id,
      input: { count, bloomLevels, focusAreas },
      output: result,
      evidenceGrade,
      duration: Date.now() - startTime,
      llmDetails: llmResponse.usage,
    });

    res.json({
      success: true,
      data: {
        invocation: 2,
        result: {
          learningObjectives: result.learningObjectives || [],
          alignmentNotes: result.alignmentNotes || '',
        },
        evidenceGrade,
        validation,
        actions: ['accept', 'revise'],
      }
    });

  } catch (error) {
    await auditService.logInvocationError({
      invocation: 2,
      courseId: req.course?._id,
      userId: req.user?.id,
      error: error.message,
      duration: Date.now() - startTime,
    });
    next(error);
  }
};

// =============================================================================
// INVOCATION 3: Topics / Subtopics / Lessons / PCs
// =============================================================================

/**
 * Generate course structure
 * POST /api/invoke/3
 */
exports.invocation3 = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const course = req.course;
    const { depth = 'full', includePerformanceCriteria = true } = req.body;

    // Build context
    const context = contextPackager.buildInvocation3Context({
      course,
      depth,
      includePerformanceCriteria,
    });

    // Call LLM
    const llmResponse = await llmService.generate({
      prompt: INVOCATION_PROMPTS.invocation3,
      context,
      invocation: 3,
    });

    // Parse response
    const result = llmService.parseResponse(llmResponse, 'invocation3');

    // Grade evidence
    const evidenceGrade = evidenceGrader.grade({
      invocation: 3,
      sources: result.sources || [],
      hasTemplateMatch: context.hasTemplateStructure,
      hasCuratedContent: context.hasKnowledgePack,
    });

    // Validate structure
    const validation = validatorService.validateInvocation3(result);

    // Log to audit
    await auditService.logInvocation({
      invocation: 3,
      courseId: course._id,
      userId: req.user.id,
      input: { depth, includePerformanceCriteria },
      output: result,
      evidenceGrade,
      duration: Date.now() - startTime,
      llmDetails: llmResponse.usage,
    });

    res.json({
      success: true,
      data: {
        invocation: 3,
        result: {
          topics: result.topics || [],
          totalLessons: countLessons(result.topics),
          estimatedDuration: result.estimatedDuration,
        },
        evidenceGrade,
        validation,
        actions: ['accept', 'revise'],
      }
    });

  } catch (error) {
    await auditService.logInvocationError({
      invocation: 3,
      courseId: req.course?._id,
      userId: req.user?.id,
      error: error.message,
      duration: Date.now() - startTime,
    });
    next(error);
  }
};

// Helper function to count lessons
function countLessons(topics) {
  if (!topics) return 0;
  return topics.reduce((total, topic) => {
    return total + (topic.subtopics || []).reduce((subTotal, subtopic) => {
      return subTotal + (subtopic.lessons || []).length;
    }, 0);
  }, 0);
}

// =============================================================================
// INVOCATION 4: Full Course Build
// =============================================================================

/**
 * Generate full course materials
 * POST /api/invoke/4
 */
exports.invocation4 = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const course = req.course;
    const { 
      includeAssessments = true, 
      includeActivities = true,
      contentDepth = 'standard' 
    } = req.body;

    // Build comprehensive context
    const context = contextPackager.buildInvocation4Context({
      course,
      includeAssessments,
      includeActivities,
      contentDepth,
    });

    // Call LLM (may need multiple calls for large courses)
    const llmResponse = await llmService.generate({
      prompt: INVOCATION_PROMPTS.invocation4,
      context,
      invocation: 4,
      maxTokens: 8000, // Larger for full build
    });

    // Parse response
    const result = llmService.parseResponse(llmResponse, 'invocation4');

    // Grade evidence
    const evidenceGrade = evidenceGrader.grade({
      invocation: 4,
      sources: result.sources || [],
      hasTemplateMatch: context.hasTemplateStructure,
      hasCuratedContent: context.hasKnowledgePack,
    });

    // Validate full build
    const validation = validatorService.validateInvocation4(result);

    // Log to audit
    await auditService.logInvocation({
      invocation: 4,
      courseId: course._id,
      userId: req.user.id,
      input: { includeAssessments, includeActivities, contentDepth },
      output: { topicsCount: result.topics?.length, assessmentsCount: result.assessments?.length },
      evidenceGrade,
      duration: Date.now() - startTime,
      llmDetails: llmResponse.usage,
    });

    res.json({
      success: true,
      data: {
        invocation: 4,
        result: {
          topics: result.topics || [],
          assessments: result.assessments || [],
          activities: result.activities || [],
          summary: result.summary,
        },
        evidenceGrade,
        validation,
        actions: ['accept', 'revise'],
        nextSteps: ['export', 'format'],
      }
    });

  } catch (error) {
    await auditService.logInvocationError({
      invocation: 4,
      courseId: req.course?._id,
      userId: req.user?.id,
      error: error.message,
      duration: Date.now() - startTime,
    });
    next(error);
  }
};

// =============================================================================
// INVOCATION 5: Template Mapping (Admin Only)
// =============================================================================

/**
 * Analyze and map document templates
 * POST /api/invoke/5
 */
exports.invocation5 = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { templateId, templateContent, mappingRules } = req.body;

    if (!templateContent && !templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template content or template ID required'
      });
    }

    // Build context for template analysis
    const context = {
      templateContent,
      existingMappings: mappingRules || [],
      analysisDepth: 'full',
    };

    // Call LLM for template analysis
    const llmResponse = await llmService.generate({
      prompt: INVOCATION_PROMPTS.invocation5,
      context,
      invocation: 5,
    });

    // Parse response
    const result = llmService.parseResponse(llmResponse, 'invocation5');

    // Grade as A (template/policy truth)
    const evidenceGrade = 'A';

    // Log to audit
    await auditService.logInvocation({
      invocation: 5,
      courseId: null,
      userId: req.user.id,
      input: { templateId, hasContent: !!templateContent },
      output: { fieldsDetected: result.fields?.length },
      evidenceGrade,
      duration: Date.now() - startTime,
      llmDetails: llmResponse.usage,
    });

    res.json({
      success: true,
      data: {
        invocation: 5,
        result: {
          templateAnalysis: result.analysis,
          detectedFields: result.fields || [],
          suggestedMappings: result.mappings || [],
          automationProfile: result.automationProfile,
        },
        evidenceGrade,
        actions: ['save', 'apply', 'discard'],
      }
    });

  } catch (error) {
    await auditService.logInvocationError({
      invocation: 5,
      courseId: null,
      userId: req.user?.id,
      error: error.message,
      duration: Date.now() - startTime,
    });
    next(error);
  }
};

/**
 * Apply template mapping to a course
 * POST /api/invoke/5/apply
 */
exports.applyTemplateMapping = async (req, res, next) => {
  try {
    const { courseId, mappingProfileId, mappings } = req.body;

    if (!courseId || (!mappingProfileId && !mappings)) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and mapping profile or mappings required'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Apply mappings to course
    // This would transform course data according to template structure
    const appliedMappings = mappings || []; // Would load from mappingProfileId

    // Log admin action
    await auditService.log({
      action: 'ADMIN_ACTION',
      userId: req.user.id,
      courseId: course._id,
      metadata: {
        action: 'TEMPLATE_MAPPING_APPLIED',
        mappingProfileId,
        mappingsCount: appliedMappings.length,
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Template mapping applied',
        courseId,
        appliedMappings: appliedMappings.length,
      }
    });

  } catch (error) {
    next(error);
  }
};

// =============================================================================
// ACCEPT / REVISE ACTIONS
// =============================================================================

/**
 * Accept invocation output and save to course
 * POST /api/invoke/:num/accept
 */
exports.acceptContent = async (req, res, next) => {
  try {
    const invocationNum = parseInt(req.params.num || req.body.invocation);
    const course = req.course;
    const { content, evidenceGrade } = req.body;

    // Update course based on invocation
    switch (invocationNum) {
      case 1:
        course.description = content.description;
        course.metadata.assistanceTier = content.assistanceTier;
        break;
      case 2:
        course.learningObjectives = content.learningObjectives;
        break;
      case 3:
        course.structure = { topics: content.topics };
        break;
      case 4:
        course.structure = { topics: content.topics };
        course.assessments = content.assessments || [];
        break;
    }

    // Mark invocation as completed
    course.completedInvocations.push({
      invocation: invocationNum,
      completedAt: new Date(),
      evidenceGrade: evidenceGrade || 'D',
    });

    // Update stage progression
    const stageMap = { 1: 'design', 2: 'design', 3: 'build', 4: 'format' };
    if (stageMap[invocationNum]) {
      course.currentStage = stageMap[invocationNum];
    }

    // Add to revision history
    course.revisionHistory.push({
      version: course.revisionHistory.length + 1,
      changedBy: req.user.id,
      changeType: `INVOCATION_${invocationNum}_ACCEPTED`,
      summary: `Accepted Invocation ${invocationNum} output`,
    });

    await course.save();

    // Log acceptance
    await auditService.log({
      action: 'CONTENT_ACCEPTED',
      userId: req.user.id,
      courseId: course._id,
      courseTitle: course.title,
      invocation: { number: invocationNum, evidenceGrade },
    });

    res.json({
      success: true,
      data: {
        message: `Invocation ${invocationNum} accepted`,
        course,
        nextInvocation: invocationNum < 4 ? invocationNum + 1 : null,
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Request revision of invocation output
 * POST /api/invoke/:num/revise
 */
exports.reviseContent = async (req, res, next) => {
  try {
    const invocationNum = parseInt(req.params.num || req.body.invocation);
    const course = req.course;
    const { feedback, specificChanges } = req.body;

    if (!feedback && !specificChanges) {
      return res.status(400).json({
        success: false,
        error: 'Provide feedback or specific changes for revision'
      });
    }

    // Build revision context
    const context = contextPackager.buildRevisionContext({
      course,
      invocation: invocationNum,
      feedback,
      specificChanges,
    });

    // Re-run invocation with revision context
    const llmResponse = await llmService.generate({
      prompt: INVOCATION_PROMPTS[`invocation${invocationNum}`],
      context,
      invocation: invocationNum,
      isRevision: true,
    });

    const result = llmService.parseResponse(llmResponse, `invocation${invocationNum}`);

    // Log revision
    await auditService.log({
      action: 'CONTENT_REVISED',
      userId: req.user.id,
      courseId: course._id,
      courseTitle: course.title,
      invocation: { number: invocationNum },
      metadata: { feedback, specificChanges },
    });

    res.json({
      success: true,
      data: {
        invocation: invocationNum,
        result,
        message: 'Revision generated',
        actions: ['accept', 'revise'],
      }
    });

  } catch (error) {
    next(error);
  }
};
