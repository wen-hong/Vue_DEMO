import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, supabaseAdmin } from './supabaseClient.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// -------------------------------------------------
// Health Check
// -------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// -------------------------------------------------
// Login
// -------------------------------------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("in login");

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // 使用 SERVICE_ROLE_KEY 登入（開發測試）
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session) {
      return res.status(401).json({ error: error?.message || 'Login failed' });
    }

    res.json({
      access_token: data.session.access_token,
      user: data.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------
// Get current user (/me)
// -------------------------------------------------
app.get('/me', async (req, res) => {
  console.log("in me");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // 官方方式驗證 JWT
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('Auth error:', error?.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = data.user;

    // （可選）查 profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .single();

    res.json({
      id: user.id,
      email: user.email,
      profile
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------
// Profiles list (開發測試，可保留或刪除)
// -------------------------------------------------
app.get('/profiles', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*');
    if (error) {
      return res.status(500).json({ error });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------------------
// Register (新增使用者)
// -------------------------------------------------
app.post('/register', async (req, res) => {
    console.log("in register")
    try {
        const { email, password, displayName } = req.body
        console.log("in register email：" + email)
        console.log("in register password：" + password)
        console.log("in register displayName：" + displayName)

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' })
        }

        // 建立 Supabase Auth 使用者
        const { data, error } = await supabaseAdmin.auth.signUp({
            email,
            password,
            //display_name: displayName || '',
        })

        if (error || !data.user) {
            return res.status(400).json({ error: error?.message })
        }

        // 建立 profiles 資料

        
        await supabaseAdmin.from('profiles')
        .update({
            user_account: displayName || ''
        })
        .eq('id', data.user.id)
        .select()
        
        //await supabaseAdmin.from('profiles').insert({
        //    id: data.user.id,
        //    email,
        //    user_account: displayName || '',
        //})

        res.json({ message: 'Register success' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Start server
// -------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
