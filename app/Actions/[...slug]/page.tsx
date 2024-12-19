"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import JupiterSwap from '../components/jupiterswap';


export interface ActionProps {
    params: {
        [x: string]: any;
        params: {
            slug: string[]
        }
    }
    // slug: string[];
}

export default function ActionsPage({params}:ActionProps) {
    const [actionState, setActionState]= useState(false);

    // const {chatid, query} = params;
    // console.log(chatid)
    // console.log(query)
  
    useEffect(() => {
        console.log("chat id is ..", params.slug[1])
        // console.log("query param is", params.query)
        
        if (decodeURIComponent(params.slug[1]) === 'Jupiter Swap'){
            setActionState(true)
        }
    }, [])
    
    
  
  const [chatState, setChatState] = useState('');



  return (
    <div>
{actionState ? (<JupiterSwap/>) : 'action state incorrect'}
    
    </div>
  );
}
