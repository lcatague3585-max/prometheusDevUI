/**
 * LLM Service
 * Handles all LLM API calls (OpenAI / Anthropic)
 */

const OpenAI = require('openai');
const { getConfig, MODEL_CONFIGS } = require('../config/llm');

// Initialize client
let openaiClient = null;

const getClient = () => {
  if (!openaiClient) {
    const config = getConfig();
    openaiClient = new OpenAI({
      apiKey: config.apiKey,
    });
  }
  return openaiClient;
};

/**
 * Generate content using LLM
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - LLM response with content and usage
 */
const generate = async ({ prompt, context, invocation, maxTokens, isRevision = false }) => {
  const config = getConfig();
  const invocationConfig = MODEL_CONFIGS[`invocation${invocation}`] || {};

  try {
    const client = getClient();

    // Build messages
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(invocation, isRevision),
      },
      {
        role: 'user',
        content: `${prompt}\n\nContext:\n${JSON.stringify(context, null, 2)}`,
      },
    ];

    // Make API call
    const response = await client.chat.completions.create({
      model: config.model,
      messages,
      max_tokens: maxTokens || invocationConfig.maxTokens || config.maxTokens,
      temperature: invocationConfig.temperature || config.temperature,
    });

    return {
      content: response.choices[0].message.content,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      model: config.model,
      finishReason: response.choices[0].finish_reason,
    };

  } catch (error) {
    console.error('LLM Service Error:', error);
    throw new Error(`LLM generation failed: ${error.message}`);
  }
};

/**
 * Build system prompt based on invocation
 */
const buildSystemPrompt = (invocation, isRevision) => {
  const basePrompt = `You are PKE (Promethean Knowledge Engine), an expert instructional design assistant.
You create high-quality educational course content following best practices.
Always respond with valid JSON that can be parsed.`;

  const invocationPrompts = {
    1: `${basePrompt}
For Invocation 1, generate a comprehensive course description and determine the appropriate assistance tier.
Focus on clarity, learning outcomes, and target audience alignment.`,

    2: `${basePrompt}
For Invocation 2, generate learning objectives using Bloom's Taxonomy.
Each objective should be measurable, specific, and aligned with the course description.
Use action verbs appropriate to the cognitive level.`,

    3: `${basePrompt}
For Invocation 3, create a detailed course structure with topics, subtopics, and lessons.
Ensure logical progression and appropriate depth for the course duration.
Include performance criteria where applicable.`,

    4: `${basePrompt}
For Invocation 4, generate complete course materials including detailed lesson content.
Include activities, examples, and assessment items.
Maintain consistency with learning objectives and course structure.`,

    5: `${basePrompt}
For Invocation 5, analyze document templates and create mapping profiles.
Identify placeholders, required fields, and automation opportunities.
This is Grade A evidence - template/policy truth.`,
  };

  let prompt = invocationPrompts[invocation] || basePrompt;

  if (isRevision) {
    prompt += `\n\nThis is a REVISION request. The user has provided feedback on previous output.
Carefully address their specific concerns while maintaining overall quality.`;
  }

  return prompt;
};

/**
 * Parse LLM response into structured data
 */
const parseResponse = (response, invocationType) => {
  try {
    const content = response.content;

    // Try to extract JSON from response
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    }

    // If no JSON, structure the text response
    return parseTextResponse(content, invocationType);

  } catch (error) {
    console.error('Parse error:', error);
    // Return raw content if parsing fails
    return { rawContent: response.content, parseError: true };
  }
};

/**
 * Parse text response into structured format
 */
const parseTextResponse = (content, invocationType) => {
  switch (invocationType) {
    case 'invocation1':
      return {
        description: content,
        assistanceTier: 'full',
      };

    case 'invocation2':
      // Try to extract learning objectives from text
      const loMatches = content.match(/(?:LO\d+|[\d]+\.)\s*[:\-]?\s*(.+)/gi) || [];
      return {
        learningObjectives: loMatches.map((lo, idx) => ({
          code: `LO${idx + 1}`,
          text: lo.replace(/^(?:LO\d+|[\d]+\.)\s*[:\-]?\s*/, '').trim(),
        })),
      };

    case 'invocation3':
      return {
        topics: [{ title: 'Course Content', subtopics: [] }],
        rawContent: content,
      };

    case 'invocation4':
      return {
        topics: [],
        assessments: [],
        rawContent: content,
      };

    case 'invocation5':
      return {
        analysis: content,
        fields: [],
        mappings: [],
      };

    default:
      return { content };
  }
};

/**
 * Estimate token count (rough estimate)
 */
const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};

module.exports = {
  generate,
  parseResponse,
  estimateTokens,
  getClient,
};
