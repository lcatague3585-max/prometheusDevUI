/**
 * Prompts
 * LLM prompt templates for each invocation
 */

const INVOCATION_PROMPTS = {
  invocation1: `Generate a comprehensive course description based on the provided context.

Requirements:
1. Write 2-4 paragraphs describing the course
2. Include target outcomes and audience fit
3. Determine appropriate assistance tier (full/guided/minimal)
4. Provide 3-5 suggestions for improvement

Output JSON format:
{
  "description": "course description text",
  "assistanceTier": "full|guided|minimal",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "sources": []
}`,

  invocation2: `Generate learning objectives for the course based on the provided context.

Requirements:
1. Create measurable learning objectives using Bloom's Taxonomy
2. Each objective should start with an action verb
3. Align objectives with the course description
4. Include the Bloom's level for each objective

Output JSON format:
{
  "learningObjectives": [
    {
      "code": "LO1",
      "text": "objective text starting with action verb",
      "bloomLevel": "remember|understand|apply|analyze|evaluate|create"
    }
  ],
  "alignmentNotes": "notes on how objectives align with course goals",
  "sources": []
}`,

  invocation3: `Create a detailed course structure with topics, subtopics, and lessons.

Requirements:
1. Organize content into logical topics
2. Each topic should have subtopics
3. Each subtopic should have specific lessons
4. Include duration estimates for lessons
5. Add performance criteria where applicable

Output JSON format:
{
  "topics": [
    {
      "title": "Topic Title",
      "order": 1,
      "subtopics": [
        {
          "title": "Subtopic Title",
          "lessons": [
            {
              "title": "Lesson Title",
              "duration": 30,
              "performanceCriteria": ["criterion 1", "criterion 2"]
            }
          ]
        }
      ]
    }
  ],
  "estimatedDuration": {
    "total": 480,
    "unit": "minutes"
  },
  "sources": []
}`,

  invocation4: `Generate complete course materials including content, activities, and assessments.

Requirements:
1. Expand each lesson with detailed content
2. Create engaging activities
3. Develop assessment items linked to learning objectives
4. Maintain consistency with course structure

Output JSON format:
{
  "topics": [full topics with content],
  "assessments": [
    {
      "question": "question text",
      "type": "MCQ|TrueFalse|ShortAnswer",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "linkedLO": "LO1"
    }
  ],
  "activities": [
    {
      "title": "activity title",
      "type": "discussion|exercise|project",
      "description": "activity description",
      "duration": 20
    }
  ],
  "summary": {
    "totalLessons": 0,
    "totalAssessments": 0,
    "totalActivities": 0
  },
  "sources": []
}`,

  invocation5: `Analyze the provided document template and create a mapping profile.

Requirements:
1. Identify all placeholders and fields
2. Map fields to course data attributes
3. Suggest automation rules
4. Note any manual input requirements

Output JSON format:
{
  "analysis": "description of template structure",
  "fields": [
    {
      "name": "field name",
      "type": "text|list|table|image",
      "location": "description of location",
      "required": true
    }
  ],
  "mappings": [
    {
      "field": "field name",
      "source": "course.attribute.path",
      "transform": "none|format|calculate"
    }
  ],
  "automationProfile": {
    "automatable": 80,
    "manualFields": ["field1", "field2"]
  }
}`,
};

module.exports = {
  INVOCATION_PROMPTS,
};
