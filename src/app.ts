import express from 'express'
import { invokeGraph } from './services/graph.ai.service.js'

const app=express()
app.use(express.json())

app.get('/health',(req,res)=>{
    res.status(200).json({
        status:'ok'
    })
})
app.post('/use-graph',async(req,res)=>{
    const prompt = typeof req.body?.message === 'string' && req.body.message.trim()
      ? req.body.message
      : "What is the capital of France?"

    const result = await invokeGraph(prompt)

    res.status(200).json({
        prompt,
        ...result
    })
})

export default app
