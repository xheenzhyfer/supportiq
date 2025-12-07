import { crawlWebsite } from './crawler';
import { splitTextIntoChunks } from '../utils/textSplitter';
import { generateEmbedding } from './ai';
import { saveDocument } from './vectorStore';

// Utility to sleep (prevent hitting API rate limits)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const processWebsite = async (url: string, chatbotId: string) => {
  console.log(`🚀 Starting processing for: ${url}`);

  // 1. Scrape the Website
  const pages = await crawlWebsite(url, 3); // Limit to 3 pages for testing
  console.log(`📄 Scraped ${pages.length} pages.`);

  let totalChunks = 0;

  // 2. Process Each Page
  for (const page of pages) {
    console.log(`✂️  Chunking page: ${page.title}`);
    
    // Split Markdown into chunks
    const chunks = splitTextIntoChunks(page.markdown);
    
    // 3. Embed & Save Each Chunk
    for (const chunk of chunks) {
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (!success && retries <= maxRetries) {
        try {
          // A. Generate Embedding (Gemini)
          const vector = await generateEmbedding(chunk);

          // B. Save to Database (Supabase)
          await saveDocument({
            chatbotId,
            content: chunk,
            embedding: vector,
            metadata: {
              source: page.url,
              title: page.title
            }
          });

          totalChunks++;
          process.stdout.write('.'); // Show progress dot
          success = true;

        } catch (error: any) {
          // Check for Rate Limit (429)
          if (error.message?.includes('429') || error.status === 429) {
            retries++;
            const waitTime = 2000 * Math.pow(2, retries); // 4s, 8s, 16s
            console.warn(`\n⚠️ Rate limit hit. Retrying in ${waitTime/1000}s...`);
            await sleep(waitTime);
          } else {
            console.error(`❌ Failed to process chunk:`, error);
            break; // Skip chunk on non-rate-limit error
          }
        }
      }
    }
  }

  console.log(`\n✅ Ingestion Complete! Saved ${totalChunks} chunks to Knowledge Base.`);
  return { pages: pages.length, chunks: totalChunks };
};