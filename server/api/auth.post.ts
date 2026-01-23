import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // Get token from body
    const body = await readBody(event)
    const password = body.password

    // Check if token is valid
    if(password === process.env.PANEL_PASSWORD ){
        return {
            success: true,
            token: jwt.sign({ auth: true }, process.env.JWT_SECRET || 'secret', { expiresIn: "72h" }),
        }
    } else {
        return {
            success: false,
            token: null,
        }
    }
  })