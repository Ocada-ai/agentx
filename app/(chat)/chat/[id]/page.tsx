import { auth } from '@/auth'
import Chat from '@/components/chat'
import { getRoomHistory } from '@/app/supabase';

import { spinner, BotCard, BotMessage, SystemMessage, Stock, Purchase, Stocks, Events } from '@/components/llm-stocks';
import { StockSkeleton } from '@/components/llm-stocks/stock-skeleton';
import { EventsSkeleton } from '@/components/llm-stocks/events-skeleton';
import { StocksSkeleton } from '@/components/llm-stocks/stocks-skeleton';
import { UserMessage } from '@/components/llm-stocks/message';

import { createStreamableUI, useUIState } from 'ai/rsc';
import { type AI } from '@/app/action';
import { useState } from 'react';

export interface ChatPageProps {
    params: {
        id: string
    }
}

export default async function ChatPage({ params }: ChatPageProps) {
    const messages: any[] = [];
    const res: any = await getRoomHistory(params.id)
    const chats = res.data

    if(chats.length > 0){
        const initialMessages = chats.map((chat: any) => {
            const replyInitial = createStreamableUI(
                <BotMessage className="items-center">{spinner}</BotMessage>,
            );
            replyInitial.update(<UserMessage>{chat.question}</UserMessage>)
            replyInitial.done()
            messages.push({
                id: Date.now(),
                display: replyInitial.value,
            })
            
            const reply = createStreamableUI(
                <BotMessage className="items-center">{spinner}</BotMessage>,
            );
            
            let data = chat.type === 'text' ? chat.answer : JSON.parse(chat.answer);

            if(chat.type === 'text'){
                reply.update(<BotMessage>{data}</BotMessage>)
                reply.done()
            }
            if(chat.type === 'list_stocks'){
                reply.update(<BotCard><Stocks stocks={data} /></BotCard>)
                reply.done()
            }
            if(chat.type === 'get_events'){
                reply.update(<BotCard><Events results={data} /></BotCard>)
                reply.done()

            }
            if(chat.type === 'show_stock_price'){
                
                reply.update(
                    <BotCard>
                        <Stock name={data.symbol} price={data.currentPrice} delta={data.delta} />
                    </BotCard>
                )
                reply.done()
            }
            if(chat.type === 'show_stock_purchase_ui'){
                const numberOfShares = data.numberOfShares;
                const symbol = data.symbol;
                const currentPrice = data.currentPrice;
                reply.update(
                    <>
                        <BotMessage>
                            Sure!{' '}
                            {typeof numberOfShares === 'number'
                            ? `Click the button below to purchase ${numberOfShares} shares of $${symbol}:`
                            : `How many $${symbol} would you like to purchase?`}
                        </BotMessage>
                        <BotCard showAvatar={false}>
                            <Purchase
                            defaultAmount={numberOfShares}
                            name={symbol}
                            price={+currentPrice}
                            />
                        </BotCard>
                    </>
                )
                reply.done();
            }
            if(chat.type === 'fetch_solana_detail'){
                reply.update(<BotMessage>{data}</BotMessage>)
                reply.done()
            }
            if(chat.type === 'fetch_wallet_details'){
                reply.update(<BotMessage>{data}</BotMessage>)
                reply.done()
            }
            messages.push({
                id: Date.now(),
                display: reply.value,
            })
    })}

    return <Chat initialMessages={messages} />
}