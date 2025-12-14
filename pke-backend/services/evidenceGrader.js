/**
 * Evidence Grader Service
 * Assigns evidence grades (A/B/C/D) to generated content
 * 
 * Grade A: Policy / Template Truth (from organizational templates)
 * Grade B: Curated Knowledge Packs (vetted internal content)
 * Grade C: Cited External Sources (with references)
 * Grade D: Heuristic Draft (LLM-generated, opt-in)
 */

const EVIDENCE_GRADES = {
  A: {
    code: 'A',
    name: 'Policy / Template Truth',
    description: 'Content derived from organizational templates or policies',
    color: 'green',
    weight: 1.0,
  },
  B: {
    code: 'B',
    name: 'Curated Knowledge Packs',
    description: 'Content from vetted, curated internal knowledge',
    color: 'blue',
    weight: 0.85,
  },
  C: {
    code: 'C',
    name: 'Cited External Sources',
    description: 'Content with external citations and references',
    color: 'yellow',
    weight: 0.7,
  },
  D: {
    code: 'D',
    name: 'Heuristic Draft',
    description: 'AI-generated content requiring review',
    color: 'orange',
    weight: 0.5,
  },
};

/**
 * Grade content based on its sources and context
 * @param {Object} options - Grading options
 * @returns {string} - Evidence grade (A, B, C, or D)
 */
const grade = ({ invocation, sources = [], hasTemplateMatch, hasCuratedContent, hasCitations }) => {
  // Invocation 5 (Template Mapping) is always Grade A
  if (invocation === 5) {
    return 'A';
  }

  // Check for template match (Grade A)
  if (hasTemplateMatch) {
    return 'A';
  }

  // Check for curated content (Grade B)
  if (hasCuratedContent) {
    return 'B';
  }

  // Check for external citations (Grade C)
  if (hasCitations || (sources && sources.length > 0)) {
    return 'C';
  }

  // Default to heuristic draft (Grade D)
  return 'D';
};

/**
 * Get grade details
 * @param {string} gradeCode - Grade code (A, B, C, D)
 * @returns {Object} - Grade details
 */
const getGradeDetails = (gradeCode) => {
  return EVIDENCE_GRADES[gradeCode] || EVIDENCE_GRADES.D;
};

/**
 * Calculate overall course evidence score
 * @param {Array} grades - Array of grades from all invocations
 * @returns {Object} - Overall score and breakdown
 */
const calculateOverallScore = (grades) => {
  if (!grades || grades.length === 0) {
    return { score: 0, breakdown: {}, overallGrade: 'D' };
  }

  const breakdown = { A: 0, B: 0, C: 0, D: 0 };
  let totalWeight = 0;

  grades.forEach(g => {
    const grade = g.toUpperCase();
    if (breakdown.hasOwnProperty(grade)) {
      breakdown[grade]++;
      totalWeight += EVIDENCE_GRADES[grade].weight;
    }
  });

  const score = totalWeight / grades.length;

  // Determine overall grade
  let overallGrade = 'D';
  if (score >= 0.9) overallGrade = 'A';
  else if (score >= 0.75) overallGrade = 'B';
  else if (score >= 0.6) overallGrade = 'C';

  return {
    score: Math.round(score * 100) / 100,
    breakdown,
    overallGrade,
    total: grades.length,
  };
};

/**
 * Generate evidence report for a course
 */
const generateEvidenceReport = (course) => {
  const grades = course.completedInvocations?.map(inv => inv.evidenceGrade) || [];
  const overall = calculateOverallScore(grades);

  return {
    courseId: course._id,
    courseTitle: course.title,
    invocations: course.completedInvocations?.map(inv => ({
      number: inv.invocation,
      grade: inv.evidenceGrade,
      details: getGradeDetails(inv.evidenceGrade),
      completedAt: inv.completedAt,
    })) || [],
    overall,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  EVIDENCE_GRADES,
  grade,
  getGradeDetails,
  calculateOverallScore,
  generateEvidenceReport,
};
