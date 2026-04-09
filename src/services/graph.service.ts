import { StateSchema, MessagesValue, StateGraph, START, END } from "@langchain/langgraph";


type JUDGEMENT={
    winner:'solution_1'|'solution_2'
    solution_1_score:number,
    solution_2_score:number

}


type AIBATTLEARENA={
    messages:typeof MessagesValue,
    solution1:string,
    solution2:string,
    judgement:JUDGEMENT
}

const state:AIBATTLEARENA={
    messages:MessagesValue,
    solution1:'',
    solution2:'',
    judgement:{
    winner:'solution_1',
    solution_1_score:0,
    solution_2_score:0
    }
}

