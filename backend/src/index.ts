import dotenv from 'dotenv';
import { generateEmbedding } from './services/ai'; // <--- Import this

dotenv.config();

import http from 'http';
import app from './app';
import { supabaseAdmin } from './config/supabase';

const PORT: number = parseInt(process.env.PORT || '4000', 10);
const server = http.createServer(app);

const startServer = async () => {
  try {
    // 1. Test Database Connection
    console.log('⏳ Connecting to Supabase...');
    const { error } = await supabaseAdmin.from('organizations').select('id').limit(1);

    if (error) {
      throw new Error(`Supabase Connection Failed: ${error.message}`);
    }
    console.log('✅ Connected to Supabase (Admin Mode)');

  // --- 🧪 TEST: AI & Vector Generation ---
console.log('🧪 Testing Gemini Embedding...');
const testVector = await generateEmbedding('Hello SupportIQ');
console.log(`✅ Embedding Generated! Dimensions: ${testVector.length}`);

    // 2. Start Server
    server.listen(PORT, () => {
      console.log(`\n✅ SupportIQ Server running on port ${PORT}`);
      console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => console.log('💥 Process terminated'));
});

