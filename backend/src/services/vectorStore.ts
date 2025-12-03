import { supabaseAdmin } from '../config/supabase';

interface DocumentInput {
  chatbotId: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

/**
 * Saves a document chunk with its vector embedding to Supabase.
 */
export const saveDocument = async (doc: DocumentInput): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.from('documents').insert({
      chatbot_id: doc.chatbotId,
      content: doc.content,
      embedding: doc.embedding,
      metadata: doc.metadata || {},
    });

    if (error) {
      throw new Error(`Supabase Insert Error: ${error.message}`);
    }

    console.log(`✅ Saved document chunk (Length: ${doc.content.length})`);
  } catch (error: any) {
    console.error('❌ Vector Store Error:', error.message);
    throw error;
  }
};