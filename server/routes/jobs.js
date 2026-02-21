import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, where = 'Denver, CO', page = 1, results_per_page = 20, remote } = req.query;

    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      return res.status(500).json({ error: 'Adzuna API keys not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to your .env file.' });
    }

    const params = {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      results_per_page,
      what: remote === 'true' ? `${q} remote` : q,
      where,
      distance: 25,
    };

    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/us/search/${page}`,
      { params }
    );

    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || where,
      description: job.description,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      created: job.created,
      redirect_url: job.redirect_url,
      category: job.category?.label,
      contract_type: job.contract_type,
    }));

    res.json({ jobs, total: response.data.count, page: Number(page) });
  } catch (error) {
    console.error('Job search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

export default router;
