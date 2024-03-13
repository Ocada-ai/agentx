import { supabase } from "@/lib/db";

export async function getChats(userId?: string | null) {
    if (!userId) return []
    const address =  userId;
    try {
        const { data, error } = await supabase.from('users').select('id').eq('address', address);
        if(error) return null
        console.log('userid', data[0].id)
        let userId = data[0].id;
        if(data){
            const { data, error } = await supabase.from('titles').select().eq('user_id', userId);
            if(error) return null
            console.log('--- getchats ---')
            console.log(data)

            return data
        }
    } catch (error) {
        console.log(error)
    }  
}

export async function removeChat(userId?: string | null) {
    if (!userId) return []
    const address =  userId;
    try {
        const { data, error } = await supabase.from('users').select('id').eq('address', address);
        if(error) return null
        console.log('userid', data[0].id)
        let userId = data[0].id;
        if(data){
            const { data, error } = await supabase.from('titles').select().eq('user_id', userId);
            if(error) return null
            console.log('--- getchats ---')
            console.log(data)

            return data
        }
    } catch (error) {
        console.log(error)
    }  
}