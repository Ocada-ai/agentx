import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/db";

export async function POST(req:NextRequest) {
  const request = await req.json();
  const { address } = request.data
  try {
    const { data, error } = await supabase.from('users').select().eq('address', address);
    if(data?.length == 0) {
      const { error } = await supabase.from('users').insert({ address: address })
      if(error) return NextResponse.json({ message: error }, { status: 500 });
      else return NextResponse.json({ data:data,  message: `Success !` }, { status: 200 });
    } else {
      return NextResponse.json({ data: data, message: `Success !` }, { status: 200 });
    }

  } catch (error) {

    return NextResponse.json(
      { message: error },
      { status: 500 }
    ); 
  }
}