import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to your .env file.' });
    }

    const { profile, jobs } = req.body;

    if (!jobs || jobs.length === 0) {
      return res.status(400).json({ error: 'No jobs provided for analysis' });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const jobsToAnalyze = jobs.slice(0, 15); // Limit to keep costs reasonable

    const jobsList = jobsToAnalyze.map((job, i) =>
      `Job ${i + 1} (ID: ${job.id})\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nDescription: ${(job.description || '').substring(0, 500)}`
    ).join('\n\n---\n\n');

    const profileSummary = [
      `Name: ${profile.name}`,
      `Current Title: ${profile.title || 'Not specified'}`,
      `Skills: ${profile.skills?.join(', ') || 'Not specified'}`,
      `Resume/Summary: ${(profile.resumeText || '').substring(0, 1000) || 'Not provided'}`,
      `Target Roles: ${profile.jobPreferences?.titles?.join(', ') || 'Not specified'}`,
      `Location: ${profile.jobPreferences?.location || 'Not specified'}`,
      `Remote: ${profile.jobPreferences?.remote ? 'Open to remote' : 'Prefers in-person'}`,
    ].join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a career coach analyzing job fit. Rate each job listing for this candidate.

CANDIDATE PROFILE:
${profileSummary}

JOB LISTINGS:
${jobsList}

For each job return a JSON object with:
- jobId: the job ID string
- fitScore: integer 1-10 (10 = perfect fit)
- summary: 2-3 sentences explaining the fit
- matchingSkills: array of matching skills/qualifications (max 5)
- skillGaps: array of missing qualifications (max 3)
- recommendation: exactly one of "Apply Now", "Consider", or "Skip"

Return ONLY a valid JSON array with no other text or markdown. Example:
[{"jobId":"123","fitScore":8,"summary":"...","matchingSkills":["skill1"],"skillGaps":[],"recommendation":"Apply Now"}]`,
      }],
    });

    const content = message.content[0].text.trim();
    // Strip markdown code fences if present
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const analyses = JSON.parse(cleaned);
    res.json(analyses);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze jobs', details: error.message });
  }
});

export default router;
