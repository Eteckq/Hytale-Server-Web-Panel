import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // Get token from body
    const body = await readBody(event)
    const password = body.password

    // Check if token is valid
    if(password === '1234567890'){
        return {
            success: true,
            token: jwt.sign({ password }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }),
        }
    } else {
        return {
            success: false,
            token: null,
        }
    }
  })