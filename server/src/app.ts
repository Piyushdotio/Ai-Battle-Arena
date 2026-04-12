import express from 'express'
import { invokeGraph } from './services/graph.ai.service.js'
import { success } from 'zod'

const app=express()
app.use(express.json())

app.get('/health',(req,res)=>{
    res.status(200).json({
        status:'ok'
    })
})
app.post('/invoke',async(req,res)=>{
    const {input} = req.body
    const result:any= await invokeGraph(input)
    res.status(200).json({
       message:"graph invoked successfully",
       success:true,
       data:result
    })
})
app.get('/use-graph',async(req,res)=>{
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
