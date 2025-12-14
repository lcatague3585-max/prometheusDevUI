/**
 * Retriever Service
 * Retrieves policies, knowledge packs, and prior decisions
 * 
 * From PKE Workflow: "Retriever / Memory - Policies, packs, prior decisions"
 */

// In-memory stores (use database in production)
let policies = [];
let knowledgePacks = [];
let templates = [];

/**
 * Retrieve relevant anchors for a course context
 */
const retrieveAnchors = async ({ courseTitle, domain, level, targetAudience }) => {
  const results = {
    policies: [],
    knowledgePacks: [],
    templates: [],
    priorDecisions: [],
  };

  // Search policies by domain/keywords
  if (domain) {
    results.policies = policies.filter(p => 
      p.domain?.toLowerCase().includes(domain.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(domain.toLowerCase()))
    );
  }

  // Search knowledge packs
  results.knowledgePacks = knowledgePacks.filter(kp =>
    kp.domain?.toLowerCase().includes(domain?.toLowerCase() || '') ||
    kp.tags?.some(t => courseTitle?.toLowerCase().includes(t.toLowerCase()))
  );

  // Search templates by type
  results.templates = templates.filter(t =>
    t.type === 'course' || 
    t.tags?.some(tag => domain?.toLowerCase().includes(tag.toLowerCase()))
  );

  return results;
};

/**
 * Search knowledge packs
 */
const searchKnowledgePacks = async (query, options = {}) => {
  const { limit = 10, domain } = options;

  let results = knowledgePacks;

  if (query) {
    const queryLower = query.toLowerCase();
    results = results.filter(kp =>
      kp.name?.toLowerCase().includes(queryLower) ||
      kp.description?.toLowerCase().includes(queryLower) ||
      kp.content?.toLowerCase().includes(queryLower)
    );
  }

  if (domain) {
    results = results.filter(kp => kp.domain === domain);
  }

  return results.slice(0, limit);
};

/**
 * Get policy by ID
 */
const getPolicy = async (policyId) => {
  return policies.find(p => p.id === policyId);
};

/**
 * Get template by ID
 */
const getTemplate = async (templateId) => {
  return templates.find(t => t.id === templateId);
};

/**
 * Add a policy (admin function)
 */
const addPolicy = async (policy) => {
  const newPolicy = {
    id: Date.now().toString(),
    ...policy,
    createdAt: new Date(),
  };
  policies.push(newPolicy);
  return newPolicy;
};

/**
 * Add a knowledge pack (admin function)
 */
const addKnowledgePack = async (pack) => {
  const newPack = {
    id: Date.now().toString(),
    ...pack,
    createdAt: new Date(),
  };
  knowledgePacks.push(newPack);
  return newPack;
};

/**
 * Add a template (admin function)
 */
const addTemplate = async (template) => {
  const newTemplate = {
    id: Date.now().toString(),
    ...template,
    createdAt: new Date(),
  };
  templates.push(newTemplate);
  return newTemplate;
};

module.exports = {
  retrieveAnchors,
  searchKnowledgePacks,
  getPolicy,
  getTemplate,
  addPolicy,
  addKnowledgePack,
  addTemplate,
};
