import { supabase } from "@/lib/db";

export async function getChats(userId: string) {
    if (!userId) return []
    const address =  userId;
    try {
        const { data, error } = await supabase.from('users').select('id').eq('address', address);
        if(error) return null
        let userId = data[0].id;
        if(data){
            const { data, error } = await supabase.from('titles').select().eq('user_id', userId);
            if(error) return null
            return data
        }
    } catch (error) {
        console.log(error)
    }  
}

export async function removeChat(userId: string) {
  
}

export async function createRoom(address: any, title: any) {
    if (!address || !title) return []
    const userAddress = address;
    const roomTitle = title;
    try {
        const { data, error } = await supabase.from('users').select('id').eq('address', userAddress);
        if(error) return null;
        if(data){
            const userId = data[0].id;
            const { error } = await supabase.from('titles').insert({ user_id: userId, title: roomTitle })
            if(error) return null;
            else {
                const { data, error } = await supabase.from('titles').select('id').eq('title', roomTitle);
                if(error) return null;
                const titleId = data[0].id;
                return { status: 200, titleId: titleId };
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export async function insertRoomHistory({title_id, question, answer, type}: {title_id: string, question: string, answer: any, type: string} ) {
    if (!title_id) return []
    const titleId =  title_id;
    try {
        const { data, error } = await supabase.from('titles').select('id').eq('id', titleId);
        if(error) return null
        let title_id = data[0].id;
        if(title_id){
            const { error } = await supabase.from('contents').insert({ title_id: title_id, question: question, answer: answer, type: type })
            if(error) return null;
            else return { status: '200'};
        }
    } catch (error) {
        console.log(error)
    }  
}


export async function getRoomHistory(titleId: any) {
    if (!titleId) return []
    const title_id =  titleId;
    try {
        const { data, error } = await supabase.from('contents').select().eq('title_id', titleId);
        if(error) return null
        return {
            status: 200,
            data: data
        }
    } catch (error) {
        console.log(error)
    }  
}
