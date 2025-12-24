import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import { supabase, supabaseAdmin } from './supabaseClient.js'

dotenv.config()

const app = express()

// -------------------------------------------------
// Middlewares
// -------------------------------------------------
const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS blocked'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// -------------------------------------------------
// Auth Middleware（只驗身分，不碰 DB）
// -------------------------------------------------
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' })
    }

    const token = authHeader.split(' ')[1]

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
        console.error('Auth error:', error?.message)
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = data.user
    next()
}

// -------------------------------------------------
// Health Check
// -------------------------------------------------
app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

// -------------------------------------------------
// Login
// -------------------------------------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' })
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error || !data?.session) {
            return res.status(401).json({ error: error?.message || 'Login failed' })
        }

        return res.json({
            access_token: data.session.access_token,
            user: data.user,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

// -------------------------------------------------
// Get current user (/me)
// -------------------------------------------------
app.get('/me', authMiddleware, (req, res) => {
    const user = req.user
    res.json({
        id: user.id,
        email: user.email,
    })
})

// -------------------------------------------------
// 取得 profile
// -------------------------------------------------
app.get('/profile/me', authMiddleware, async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message })
    }

    res.json(data || null)
})

// -------------------------------------------------
// 更新 profile
// -------------------------------------------------
const upload = multer({ storage: multer.memoryStorage() })

app.put(
    '/profile/me',
    authMiddleware,
    upload.single('avatar'),
    async (req, res) => {

        const payload = {
            user_name: req.body.user_name,
            birth: req.body.birth,
            sex: req.body.sex,
            update_at: new Date(),
        }

        // 有選圖片才處理
        if (req.file) {
            const filePath = `${req.user.id}/avatar.png`

            await supabaseAdmin.storage
                .from('avatars')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                })

            const { data } = supabaseAdmin.storage
                .from('avatars')
                .getPublicUrl(filePath)

            payload.avatar_url = data.publicUrl
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update(payload)
            .eq('id', req.user.id)

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        res.json({
            message: 'Profile updated',
            avatar_url: payload.avatar_url || null
        })
    }
)

// -------------------------------------------------
// Register
// -------------------------------------------------
app.post('/register', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error || !data?.user) {
        return res.status(400).json({ error: error?.message })
    }

    res.json({ message: 'Register success' })
})

// -------------------------------------------------
// Start server
// -------------------------------------------------
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
