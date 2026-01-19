import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // Ignore route auth.post.ts
    if (event.path.startsWith('/api') && event.path != '/api/auth') {
        const token = getCookie(event, 'token')
        if (!token) {
            throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'secret')
        } catch (error) {
            throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
        }
    }
})