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
    console.log(process.env.ENV);
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

        const payload = {}

        if (typeof req.body.user_name === 'string' && req.body.user_name.trim() !== '') {
            payload.user_name = req.body.user_name.trim()
        }

        const birthRaw = req.body.birth
        if (typeof birthRaw === 'string') {
            const v = birthRaw.trim()
            if (v && v !== 'null' && v !== 'undefined') {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                    return res.status(400).json({ error: 'birth must be YYYY-MM-DD' })
                }
                payload.birth = v
            }
        }

        if (req.body.sex !== undefined && req.body.sex !== '') {
            const sexValue = parseInt(req.body.sex, 10)

            if (Number.isNaN(sexValue)) {
                return res.status(400).json({ error: "sex must be a number" })
            }

            payload.sex = sexValue
        }

        payload.update_at = new Date()

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
// Reset Password
// -------------------------------------------------

app.post('/auth/Resetpassword', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body

    try {
        const userEmail = req.user.email

        // 驗證當前密碼
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: currentPassword,
        })

        if (signInError || !signInData?.session) {
            return res.status(400).json({ error: '當前密碼輸入錯誤' })
        }

        // 更新密碼（必須用 admin key）
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
            password: newPassword,
        })

        if (error) return res.status(400).json({ error: error.message })

        return res.json({ message: '密碼更新成功' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Forgot Password (send reset email)
// -------------------------------------------------
app.post('/auth/forgotpassword', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ error: 'Email is required' })
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}`
        })

        // 為安全起見，不透露帳號是否存在
        if (error) {
            console.error(error)
        }

        return res.json({
            message: 'If this email exists, a reset link has been sent.'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Calendar取得事件
// -------------------------------------------------

app.get('/calendar', authMiddleware, async (req, res) => {
    try {
        const { start_date, end_date, category } = req.query
        let query = supabase.from('calendar_events').select('*').eq('user_id', req.user.id)

        if (start_date) query = query.gte('event_date', start_date)
        if (end_date) query = query.lte('event_date', end_date)
        if (category) query = query.eq('category', category)

        const { data, error } = await query.order('event_date', { ascending: true })

        if (error) return res.status(400).json({ error: error.message })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Calendar新增事件
// -------------------------------------------------

app.post('/calendar', authMiddleware, async (req, res) => {
    const { title, description, event_date, category } = req.body
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert([{
                user_id: req.user.id,
                title,
                description,
                event_date,
                category,
                created_at: new Date(),
                updated_at: new Date()
            }])
            .select()

        if (error) return res.status(400).json({ error: error.message })
        res.json(data[0])
    } catch (err) {
        console.error('Server exception:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Calendar更新事件
// -------------------------------------------------

app.put('/calendar/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    const { title, description, event_date, category } = req.body

    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .update({ title, description, event_date, category, updated_at: new Date() })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()

        if (error) return res.status(400).json({ error: error.message })
        res.json(data[0])
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Calendar刪除事件
// -------------------------------------------------

app.delete('/calendar/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    try {
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id)

        if (error) return res.status(400).json({ error: error.message })
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Calendar統計
// -------------------------------------------------

app.get('/calendar/stats', authMiddleware, async (req, res) => {
    try {
        const { start_date, end_date, category } = req.query

        let query = supabase
            .from('calendar_events')
            .select('event_date, category, id')
            .eq('user_id', req.user.id)

        if (start_date) query = query.gte('event_date', start_date)
        if (end_date) query = query.lte('event_date', end_date)
        if (category) query = query.eq('category', category)

        const { data, error } = await query
        if (error) return res.status(400).json({ error: error.message })

        // 🔹 統計整理
        const map = {}

        data.forEach(e => {
            const date = e.event_date
            const cat = e.category || '未分類'
            const key = `${date}|${cat}`

            if (!map[key]) {
                map[key] = {
                    date,
                    category: cat,
                    count: 0,
                }
            }
            map[key].count++
        })

        res.json(Object.values(map))
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// -------------------------------------------------
// Start server
// -------------------------------------------------
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
