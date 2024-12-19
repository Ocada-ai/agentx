import { useRouter } from 'next/navigation';


export const actions = [
  {
    label: 'Jupiter Swap',
    onClick: () => {
      const uniqueChatId = btoa(`${Date.now()}-${Math.random()}`);
      console.log(uniqueChatId)
      window.location.href=`/chat/${uniqueChatId}?query=Jupiter%20Swap`
      console.log('Jupiter Swap action triggered');
    },
  },
  {
    label: 'Another Action',
    onClick: () => {
      console.log('Another action triggered');
      // Add your other action logic here
    },
  },
];
