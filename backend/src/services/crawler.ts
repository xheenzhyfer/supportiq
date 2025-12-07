import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.FIRECRAWL_API_KEY;

if (!apiKey) {
  console.warn('⚠️ FIRECRAWL_API_KEY is missing. Scraping will fail.');
}

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({ apiKey: apiKey || '' });

export interface ScrapedPage {
  url: string;
  markdown: string;
  title?: string;
}

/**
 * Crawls a website using Firecrawl and returns clean Markdown.
 * Note: Uses scrape for immediate synchronous results.
 */
export const crawlWebsite = async (baseUrl: string, limit: number = 1): Promise<ScrapedPage[]> => {
  console.log(`🕷️ Starting scrape for: ${baseUrl}`);

  try {
    // 1. Submit Scrape Job (Synchronous)
    // TypeScript suggested 'scrape' instead of 'scrapeUrl'
    const scrapeResponse = await firecrawl.scrape(baseUrl, {
      formats: ['markdown'],
    });

    console.log(`✅ Scrape completed for ${baseUrl}`);

    // 2. Map results to our interface
    const pageData: ScrapedPage = {
      url: scrapeResponse.metadata?.sourceURL || baseUrl,
      title: scrapeResponse.metadata?.title || 'No Title',
      markdown: scrapeResponse.markdown || '',
    };

    return [pageData];

  } catch (error: any) {
    console.error('❌ Crawl Service Error:', error.message);
    throw new Error('Failed to crawl website');
  }
};