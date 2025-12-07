import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, AuthRequest } from '../middleware/requireAuth';

const router = Router();

// ==========================================
// 0. PUBLIC WIDGET ACCESS (NO AUTH REQUIRED)
// ==========================================

// GET /api/chatbots/public/:id
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch ONLY public fields. Do not expose org_id or internal flags.
    const { data, error } = await supabaseAdmin
      .from('chatbots')
      .select('id, name, welcome_message, brand_color, suggested_questions')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ... continue with requireAuth routes ...

// ==========================================
// 1. SECURE BOT MANAGEMENT
// ==========================================

// GET /api/chatbots
// Lists all bots belonging to the logged-in user's organization
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.orgId; // Automatically injected by middleware
    console.log(`Fetching chatbots for Org: ${orgId}`);

    const { data, error } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chatbots/:id
// Fetch a single secure bot (for Dashboard)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;

    const { data, error } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId) // Ensure user owns the bot
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Bot not found or access denied' });
    }

    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chatbots
// Creates a new bot for the logged-in user's organization
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, welcomeMessage, suggestions } = req.body;
    const orgId = req.orgId; // Automatically injected by middleware

    if (!name) {
      res.status(400).json({ error: 'Bot name is required' });
      return; 
    }

    const { data, error } = await supabaseAdmin
      .from('chatbots')
      .insert({
        org_id: orgId,
        name,
        welcome_message: welcomeMessage || 'Hello! How can I help you?',
        suggested_questions: suggestions || ['What is the pricing?', 'Contact Support'] 
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// 2. CHAT HISTORY / ANALYTICS
// ==========================================

// GET /api/chatbots/:id/conversations
// Fetch all conversations for a specific bot (Used by Dashboard ChatLogs)
router.get('/:id/conversations', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*, messages(content, created_at)')
      .eq('chatbot_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chatbots/:id/conversations/:convId
// Fetch specific messages for a conversation (Used by Dashboard ChatLogs)
router.get('/:id/conversations/:convId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { convId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;