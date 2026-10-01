import app from './panel-app.js'

const port = Number(process.env.PORT || 3456)

if (!process.env.VERCEL) {
  app.listen(port, '127.0.0.1', () => {
    console.log(`pdf to excel listening on http://127.0.0.1:${port}`)
  })
}

export default app
