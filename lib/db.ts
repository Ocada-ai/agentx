import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

console.log(supabaseUrl)
console.log(supabaseKey)

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// const tableDefinitions = [
//     {
//       tableName: 'Users',
//       columns: [
//         { name: 'id', type: 'uuid', primary: true },
//         { name: 'address', type: 'text' },
//       ]
//     },
//     {
//       tableName: 'Titles',
//       columns: [
//         { name: 'id', type: 'uuid', primary: true },
//         { name: 'user_id', type: 'integer' },
//         { name: 'title', type: 'text' },
//         { name: 'user', type: 'text' },
//         { name: 'contents', type: 'text' },
//       ]
//     },
//     {
//         tableName: 'Contents',
//         columns: [
//           { name: 'id', type: 'uuid', primary: true },
//           { name: 'title_id', type: 'integer' },
//           { name: 'question', type: 'text' },
//           { name: 'description', type: 'text' },
//           { name: 'type', type: 'integer' },
//         ]
//     }
// ];