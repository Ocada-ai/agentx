import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/db";

interface data {
    data: {
      /** The user's id. */
      id: any
    }
  }

export async function POST(req:NextRequest) {
  const request = await req.json();
  const { address, title } = request.data
  try {
    const { data, error } = await supabase.from('users').select('id').eq('address', address);
    if(error) return NextResponse.json({ message: error }, { status: 500 });
    console.log('userid', data[0].id)
    if(data){
        const userId = data[0].id;
        const { error } = await supabase.from('titles').insert({ user_id: userId, title: title })
        if(error) return NextResponse.json({ message: error }, { status: 500 });
        return NextResponse.json({ message: `Success !` }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: error },
      { status: 500 }
    ); 
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const request = await req.json();
  console.log('--- get ---')
  console.log(request)
}