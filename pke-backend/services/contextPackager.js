/**
 * Context Packager Service
 * Builds task context bundles for each invocation
 * 
 * From PKE Workflow: "Build task context bundle"
 * Packages relevant data for LLM generation
 */

/**
 * Build context for Invocation 1 (Course Description)
 */
const buildInvocation1Context = ({ course, additionalContext, requestedTier }) => {
  return {
    // Course basics
    courseTitle: course.title,
    duration: course.metadata?.duration,
    level: course.metadata?.level,
    targetAudience: course.metadata?.targetAudience,
    theme: course.metadata?.theme,

    // User input
    additionalContext: additionalContext || '',
    requestedAssistanceTier: requestedTier || 'full',

    // Instructions
    instructions: {
      generateDescription: true,
      determineAssistanceTier: true,
      suggestImprovements: true,
    },

    // Output format
    expectedOutput: {
      description: 'string (2-4 paragraphs)',
      assistanceTier: 'full | guided | minimal',
      suggestions: 'array of improvement suggestions',
    },
  };
};

/**
 * Build context for Invocation 2 (Learning Objectives)
 */
const buildInvocation2Context = ({ course, requestedCount, bloomLevels, focusAreas }) => {
  return {
    // Course context
    courseTitle: course.title,
    courseDescription: course.description,
    duration: course.metadata?.duration,
    level: course.metadata?.level,
    targetAudience: course.metadata?.targetAudience,

    // Generation parameters
    requestedCount: requestedCount || 5,
    bloomLevels: bloomLevels || ['understand', 'apply', 'analyze'],
    focusAreas: focusAreas || [],

    // Previous outputs
    assistanceTier: course.metadata?.assistanceTier || 'full',

    // Policy references (for Grade B)
    hasPolicyReference: false, // Would check knowledge packs

    // Instructions
    instructions: {
      useBloomsTaxonomy: true,
      alignWithDescription: true,
      makeMeasurable: true,
      includeActionVerbs: true,
    },

    // Output format
    expectedOutput: {
      learningObjectives: [{
        code: 'LO1',
        text: 'string',
        bloomLevel: 'remember|understand|apply|analyze|evaluate|create',
      }],
      alignmentNotes: 'string',
    },
  };
};

/**
 * Build context for Invocation 3 (Course Structure)
 */
const buildInvocation3Context = ({ course, depth, includePerformanceCriteria }) => {
  return {
    // Course context
    courseTitle: course.title,
    courseDescription: course.description,
    duration: course.metadata?.duration,
    level: course.metadata?.level,

    // Learning objectives to align with
    learningObjectives: course.learningObjectives || [],

    // Generation parameters
    depth: depth || 'full', // 'outline' | 'standard' | 'full'
    includePerformanceCriteria,

    // Template structure (for Grade A)
    hasTemplateStructure: false, // Would check templates

    // Knowledge pack alignment (for Grade B)
    hasKnowledgePack: false,

    // Instructions
    instructions: {
      createLogicalProgression: true,
      alignWithLearningObjectives: true,
      balanceTopicDepth: true,
      estimateDurations: true,
    },

    // Output format
    expectedOutput: {
      topics: [{
        title: 'string',
        subtopics: [{
          title: 'string',
          lessons: [{
            title: 'string',
            duration: 'number (minutes)',
            performanceCriteria: ['string'],
          }],
        }],
      }],
      estimatedDuration: 'object',
    },
  };
};

/**
 * Build context for Invocation 4 (Full Build)
 */
const buildInvocation4Context = ({ course, includeAssessments, includeActivities, contentDepth }) => {
  return {
    // Full course context
    courseTitle: course.title,
    courseDescription: course.description,
    metadata: course.metadata,
    learningObjectives: course.learningObjectives || [],
    structure: course.structure || {},

    // Generation parameters
    includeAssessments,
    includeActivities,
    contentDepth: contentDepth || 'standard', // 'brief' | 'standard' | 'detailed'

    // Template/knowledge pack references
    hasTemplateStructure: false,
    hasKnowledgePack: false,

    // Instructions
    instructions: {
      generateDetailedContent: true,
      alignWithObjectives: true,
      includeExamples: true,
      createAssessments: includeAssessments,
      createActivities: includeActivities,
      maintainConsistency: true,
    },

    // Output format
    expectedOutput: {
      topics: 'array with full content',
      assessments: includeAssessments ? 'array of assessment items' : null,
      activities: includeActivities ? 'array of activities' : null,
      summary: 'course summary object',
    },
  };
};

/**
 * Build context for revision requests
 */
const buildRevisionContext = ({ course, invocation, feedback, specificChanges }) => {
  // Get the appropriate base context
  let baseContext;
  switch (invocation) {
    case 1:
      baseContext = buildInvocation1Context({ course });
      break;
    case 2:
      baseContext = buildInvocation2Context({ course });
      break;
    case 3:
      baseContext = buildInvocation3Context({ course });
      break;
    case 4:
      baseContext = buildInvocation4Context({ course });
      break;
    default:
      baseContext = {};
  }

  return {
    ...baseContext,
    isRevision: true,
    revisionFeedback: feedback,
    specificChanges: specificChanges || [],
    previousOutput: getPreviousOutput(course, invocation),
    instructions: {
      ...baseContext.instructions,
      addressFeedback: true,
      maintainQuality: true,
      preserveGoodParts: true,
    },
  };
};

/**
 * Get previous output for an invocation
 */
const getPreviousOutput = (course, invocation) => {
  switch (invocation) {
    case 1:
      return { description: course.description };
    case 2:
      return { learningObjectives: course.learningObjectives };
    case 3:
    case 4:
      return { structure: course.structure };
    default:
      return {};
  }
};

/**
 * Package retriever results into context
 */
const packageRetrieverResults = (results) => {
  return {
    policies: results.policies || [],
    knowledgePacks: results.knowledgePacks || [],
    templates: results.templates || [],
    priorDecisions: results.priorDecisions || [],
    hasPolicyReference: results.policies?.length > 0,
    hasKnowledgePack: results.knowledgePacks?.length > 0,
    hasTemplateStructure: results.templates?.length > 0,
  };
};

module.exports = {
  buildInvocation1Context,
  buildInvocation2Context,
  buildInvocation3Context,
  buildInvocation4Context,
  buildRevisionContext,
  packageRetrieverResults,
};
