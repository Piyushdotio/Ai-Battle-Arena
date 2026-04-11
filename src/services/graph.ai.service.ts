import { HumanMessage } from "@langchain/core/messages";
import {
  StateSchema,
  MessagesValue,
  ReducedValue,
  StateGraph,
  START,
  END,
  type GraphNode
} from "@langchain/langgraph";
import {MistralModel,CohereModel, GeminiModel} from '../services/models.service.js'
import {z} from 'zod';
import { createAgent,providerStrategy } from "langchain";


const State = new StateSchema({
  messages: MessagesValue,
  solution_1:new ReducedValue(z.string().default(""),{
    reducer:(_current,next)=>{
     return next
    }
  }),
  solution_2:new ReducedValue(z.string().default(""),{
    reducer:(_current,next)=>{
    return next
    }
  }),
  judge_recommendation:new ReducedValue(
    z.object({
      solution_1_score: z.number().default(0),
      solution_2_score: z.number().default(0),
    }).default({
      solution_1_score:0,
      solution_2_score:0
    }),
    {
    reducer:(_current,next)=>{
      return next
    }
  })
})
const solutionNode: GraphNode<typeof State> = async (state: typeof State) => {
  console.log(state.messages);
  const [mistral_solution,cohere_solution]=await Promise.all([
    MistralModel.invoke(state.messages[0].text),
    CohereModel.invoke(state.messages[0].text)
  ]
   
  )
  return {
    solution_1:mistral_solution.text,
    solution_2:cohere_solution.text,
  };
};
const judgeNode:GraphNode<typeof State> = async (state:typeof State)=>{
  const {solution_1,solution_2}=State;
  const judge=createAgent({
    model:GeminiModel,
    tools:[],
    responseFormat: providerStrategy(z.object({
      solution_1_score:z.number().min(0).max(10),
      solution_2_score:z.number().min(0).max(10)
    }))
  })
  const judgeResponse=await judge.invoke({
    messages:[
    new HumanMessage(`You are a judge tasked with evaluating two solutions to a problem.The problem is: ${state.messages[0].text}.
       Please provide a score between 0 and 10 for each solution, where 0 is the worst and 10 is the best. Here are the solutions:\n\nSolution 1: ${solution_1}\n\nSolution 2: ${solution_2}`)
    ]
  })
  const result=judgeResponse.structuredResponse
  return {
    judge_recommendation:result
  }

}

const graph = new StateGraph(State)
  .addNode("solution", solutionNode)
  .addNode("judge", judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "judge")
  .addEdge("judge", END)
  .addEdge("solution",END)

  .compile();


export const invokeGraph = async (usermessage:string) => {
const result=await graph.invoke({
    messages:[
        new HumanMessage(usermessage)
    ]
    
});
    return {
      solution_1: result.solution_1,
      solution_2: result.solution_2,
      judge_recommendation: result.judge_recommendation,
    }

}
