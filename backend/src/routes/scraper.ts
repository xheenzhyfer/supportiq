import { Router, Request, Response } from 'express';
import { processWebsite } from '../services/ingestion';

const router = Router();

// POST /api/scraper/ingest
router.post('/ingest', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, chatbotId } = req.body;

    // Strict Validation
    if (!url || !chatbotId) {
      res.status(400).json({ error: 'Both "url" and "chatbotId" are required.' });
      return;
    }

    console.log(`\n📥 Ingesting ${url} for Bot ${chatbotId}`);

    // Call the heavy ingestion process (Fire and Forget)
    processWebsite(url, chatbotId).catch(err => 
      console.error('Background Ingestion Failed:', err)
    );

    res.status(200).json({
      status: 'success',
      message: 'Ingestion started in background.',
      data: { pages: 0, chunks: 0 } // Dummy data
    });

  } catch (error: any) {
    console.error('❌ Ingestion Error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;