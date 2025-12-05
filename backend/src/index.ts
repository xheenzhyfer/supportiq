import dotenv from 'dotenv';
// Always load environment variables before importing other custom files
dotenv.config();

import http from 'http';
import app from './app';
import { supabaseAdmin } from './config/supabase';
import { generateEmbedding } from './services/ai';

const PORT: number = parseInt(process.env.PORT || '4000', 10);
const server = http.createServer(app);

const startServer = async () => {
  try {
    // 1. Test Database Connection (CRITICAL)
    // If this fails, the server should not start.
    console.log('⏳ Connecting to Supabase...');
    const { error } = await supabaseAdmin.from('organizations').select('id').limit(1);

    if (error) {
      throw new Error(`Supabase Connection Failed: ${error.message}`);
    }
    console.log('✅ Connected to Supabase (Admin Mode)');

    // 2. Test AI Connection (NON-CRITICAL)
    // We wrap this in a separate try/catch so it doesn't kill the server if it fails.
    try {
      console.log('🧪 Testing Gemini Embedding...');
      const testVector = await generateEmbedding('Hello SupportIQ');
      console.log(`✅ Gemini Connected! Vector Dimension: ${testVector.length}`);
    } catch (aiError: any) {
      console.warn('\n⚠️  Gemini AI Test Failed (Soft Fail):');
      console.warn(`   Error: ${aiError.message}`);
      console.warn('   Server will continue starting, but AI features will not work.');
      console.warn('   Action: Check your Internet Connection and GEMINI_API_KEY.\n');
    }

    // 3. Start Server
    server.listen(PORT, () => {
      console.log(`\n✅ SupportIQ Server running on port ${PORT}`);
      console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error: any) {
    // Critical errors (like DB failure) will crash the process here
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated');
  });
});