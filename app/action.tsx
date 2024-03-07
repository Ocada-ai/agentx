import 'server-only';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase,
  Stocks,
  Events,
} from '@/components/llm-stocks';

import {
  runAsyncFnWithoutBlocking,
  sleep,
  formatNumber,
  runOpenAICompletion,
} from '@/lib/utils';
import { z } from 'zod';
import { StockSkeleton } from '@/components/llm-stocks/stock-skeleton';
import { EventsSkeleton } from '@/components/llm-stocks/events-skeleton';
import { StocksSkeleton } from '@/components/llm-stocks/stocks-skeleton';

import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    // You can update the UI at any point.
    await sleep(1000);

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>,
    );

    await sleep(1000);

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
          amount * price
        }]`,
      },
    ]);
  });

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

async function submitUserMessage(content: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
You are a stock trading conversation bot and you can help users buy stocks, step by step.
You and the user can discuss stock prices and the user can adjust the amount of stocks they want to buy, or place an order, in the UI.

Messages inside [] means that it's a UI element or a user event. For example:
- "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
- "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.

If the user requests purchasing a stock, call \`show_stock_purchase_ui\` to show the purchase UI.
If the user just wants the price, call \`show_stock_price\` to show the price.
If you want to show trending stocks, call \`list_stocks\`.
If you want to show events, call \`get_events\`.
If you want to show information about a specific solana wallet address, call \`fetch_solana_detail\`.
If you want to show price of a specified cryptocurrency, call \`fetch_crypto_price\`.
If you want to show details about a spcific solana wallet address, call \`fetch_wallet_details\`.
If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.

Besides that, you can also chat with users and do some calculations if needed.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'show_stock_price',
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The symbol of the stock or currency. e.g. DOGE/AAPL/USD.',
            ),
          name: z.string().describe('The name of the stock or currency.'),
          price: z.number().describe('The price of the stock fetched from coinmarketcap.'),
          delta: z.number().describe('The change in price of the stock'),
        }),
      },
      {
        name: 'show_stock_purchase_ui',
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.',
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.',
            ),
        }),
      },
      {
        name: 'list_stocks',
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock'),
            }),
          ),
        }),
      },
      {
        name: 'get_events',
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event'),
            }),
          ),
        }),
      },
      {
        name: 'fetch_solana_detail',
        description: 'Fetches information about a specific solana wallet address.',
        parameters: z.object({
          address: z.string(),
          description: z.string().describe('The data of the solana wallet address')
        }),
      },
      // {
      //   name: 'fetch_crypto_price',
      //   description: 'Fetches the current price of a specified cryptocurrency.',
      //   parameters: z.object({
      //     cryptoName: z.string().describe('The name of a cryptocurrency.'),
      //     cryptoPrice: z.string().describe('The price of a cryptocurrency fetched from coinmarketcap'),
      //   }),
      // },
      // {
      //   name: 'fetch_wallet_details',
      //   description: 'Fetches the the details about a spcific solana wallet address.',
      //   parameters: z.object({
      //     address: z.any(),
      //     price: z.number().describe('The price of a cryptocurrency fetched from coinmarketcap'),
      //   }),
      // },
    ],
    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('list_stocks', async ({ stocks }) => {
    reply.update(
      <BotCard>
        <StocksSkeleton />
      </BotCard>,
    );

    await sleep(1000);

    reply.done(
      <BotCard>
        <Stocks stocks={stocks} />
      </BotCard>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'list_stocks',
        content: JSON.stringify(stocks),
      },
    ]);
  });

  completion.onFunctionCall('get_events', async ({ events }) => {
    reply.update(
      <BotCard>
        <EventsSkeleton />
      </BotCard>,
    );

    await sleep(1000);

    reply.done(
      <BotCard>
        <Events events={events} />
      </BotCard>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'list_stocks',
        content: JSON.stringify(events),
      },
    ]);
  });

  completion.onFunctionCall(
    'show_stock_price',
    async ({ symbol, name, price, delta }) => {      
      reply.update(<BotCard><StockSkeleton /></BotCard>);
      // await sleep(1000);
      const vsCurrency = "USD";
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${vsCurrency}`
      const response = await fetch(url)
      const data = await response.json()
      const currentPrice = data[name.toLowerCase()]?.[vsCurrency.toLowerCase()]

      reply.done(
        <BotCard>
          <Stock name={symbol} price={currentPrice} delta={delta} />
        </BotCard>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'show_stock_price',
          content: `[Price of ${symbol} = ${currentPrice}]`,
        },
      ]);
    },
  );

  completion.onFunctionCall(
    'show_stock_purchase_ui',
    ({ symbol, price, numberOfShares = 100 }) => {
      if (numberOfShares <= 0 || numberOfShares > 1000) {
        reply.done(<BotMessage>Invalid amount</BotMessage>);
        aiState.done([
          ...aiState.get(),
          {
            role: 'function',
            name: 'show_stock_purchase_ui',
            content: `[Invalid amount]`,
          },
        ]);
        return;
      }

      reply.done(
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
              price={+price}
            />
          </BotCard>
        </>,
      );
      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'show_stock_purchase_ui',
          content: `[UI for purchasing ${numberOfShares} shares of ${symbol}. Current price = ${price}, total cost = ${
            numberOfShares * price
          }]`,
        },
      ]);
    },
  );

  completion.onFunctionCall('fetch_solana_detail', async ({ address, description }) => {
    const oldDescription = description;
    const addressList = [
      '6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc',
      '3Katmm9dhvLQijAvomteYMo6rfVbY5NaCRNq9ZBqBgr6',
      '6VJpeYFy87Wuv4KvwqD5gyFBTkohqZTqs6LgbCJ8tDBA',
      'Port7uDYB3wk6GJAw4KT1WpTeMtSu9bTcChBHkX2LfR',
      'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S',
      'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN',
      '82yxjeMsvaURa4MbZZ7WZZHfobirZYkH1zF8fmeGtyaQ',
      'Config1111111111111111111111111111111111111',
      'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo',
      '5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx',
      'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8',
      'FC81tbGt6JWRXidaWYFXxGnTk4VgobhJHATvTRVMqgWj',
      'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
      'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1',
      'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8',
      'vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn',
      'HubbLeXBb7qyLHt3x7gvYaRrxQmmgExb7fCJgDqFuB6T',
      'ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD',
      'AMM55ShdkoGRB5jVYPjWziwk8m5MpwyDgsMWHaMSQWH6',
      'GrcZwT9hSByY1QrUTaRPp6zs5KxAA5QYuqEhjT1wihbm',
      '3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs',
      'KeccakSecp256k11111111111111111111111111111',
      'VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp',
      'SQUADSxWKud1RVxuhJzNcqYqu7F3GLNiktGzjnNtriT',
      'nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk',
      'Crt7UoUR6QgrFrN7j8rmSQpUTNWNSitSwWvsWGf1qZ5t',
      '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
      'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX',
      'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
      '4bcFeLv4nydFrsZqV5CgwCVrPhkQKsXtzfy2KyMz7ozM',
      'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth',
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
      'CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi',
      'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98',
      'QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB',
      'EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q',
      'Zo1ggzTUKMY5bYnDvT5mtVeZxzf2FaLTbKkmvGUhUQk',
      'CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4',
      '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP',
      'CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz',
      'mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68',
      'FQzYycoqRjmZTgCcTTAkzceH2Ju8nzNLa5d78K3yAhVW',
      'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo',
      'Vote111111111111111111111111111111111111111',
      'HedgeEohwU6RqokrvPU4Hb6XKPub8NuKbnPmY7FoMMtN',
      'JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo',
      'Bt2WPMmbwHPk36i4CRucNDyLcmoGdC7xEdrVuxgJaNE6',
      'cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ',
      'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
      'SWiMDJYFUGj6cPrQ6QYYYWZtvXQdRChSVAygDZDsCHC',
      'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
      '6UeJYTLU1adaoHWeApWsoj1xNEDbWA2RhM2DLc8CrDDi',
      'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
      'Stake11111111111111111111111111111111111111',
      '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
      '5XDdQrpNCD89LtrXDBk5qy4v1BW1zRCPyizTahpxDTcZ',
      'HAbiTatJVqoCJd9asyr6RxMEdwtfrQugwp7VAFyKWb1g',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      'stkTLPiBsQBUxDhXgxxsTRtxZ38TLqsqhoMvKMSt8Th',
      'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K',
      '11111111111111111111111111111111',
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
      'MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky',
      'HvwYjjzPbXWpykgVZhqvvfeeaSraQVnTiQibofaFw9M7',
      '617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU',
      'strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m',
      'FF7U7Vj1PpBkTPau7frwLLrUHrjkxTQLsH7U5K3T3B3j',
      'AknC341xog56SrnoK6j3mUvaD1Y7tYayx1sxUGpeYWdX',
      'SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f',
      'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',
      'KJ6b6PswEZeNSwEh1po51wxnbX1C3FPhQPhg8eD2Y6E',
      'WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD',
      'BLDDrex4ZSWBgPYaaH6CQCzkJXWfzCiiur9cSFJT8t3x',
      '22Y43yTVxuUkoRKdm9thyRhQ3SdgQS7c7kB6UNCiaczD',
      'TLPv2tuSVvn3fSk8RgW3yPddkp5oFivzZV3rA9hQxtX',
      'PSYFiYqguvMXwpDooGdYV6mju92YEbFobbvW617VNcq',
      'GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe',
      'CeNUxGUsSeb5RuAGvaMLNx3tEZrpBwQqA7Gs99vMPCAb',
      'R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs',
      'SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ',
      'pSystkitWgLkzprdAvraP8DSBiXwee715wiSXGJe8yr',
      '7Zb1bGi32pfsrBkzWdqd4dFhUXwp5Nybr1zuaEwN34hy',
      'SCPv1LabixHirZbX6s7Zj3oiBogadWZvGUKRvXD3Zec',
      'MSPCUMbLfy2MeT6geLMMzrUkv1Tx88XRApaVRdyxTuu',
      '781wH11JGQgEoBkBzuc8uoQLtp8KxeHk1yZiS1JhFYKy',
      'Ed25519SigVerify111111111111111111111111111',
      '7vxeyaXGLqcp66fFShqUdHxdacp4k4kwUpRSSeoZLCZ4',
      '657iw8S9b4BG5Vno91DgJk4bqoH3kzPRopngPG8uxWxg',
      'GenUMNGcWca1GiPLfg89698Gfys1dzk9BAGsyb9aEL2u',
      'GDDMwNyyx8uB6zrqwBFHjLLG3TBYk2F8Az4yrQC5RzMp',
      'SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy',
      'BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC',
      'GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J',
      'SSwpMgqNDsyV7mAgN9ady4bDVu5ySjmmXejXvy2vLt1',
      'GGo1dnYpjKfe9omzUaFtaCyizvwpAMf3NhxSCMD61F3A',
      'HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B',
      'CNBLwonD8EHup87p1SK9dypdj4WasTioWzFZWZVP9vbB',
      'NAZAREQQuCnkV8CpkGZaoB6ccmvikM8uRr4GKPWwmPT',
      'GfjqZ9MsfqKkEepy8F4xfS9uuxEEQpwWQXKnTKJY5nrG',
      'A7p8451ktDCHq5yYaHczeLMYsjRsAkzc3hCXcSrwYHU7',
      '3nmm1awnyhABJdoA25MYVksxz1xnpUFeepJJyRTZfsyD',
      'HajXYaDXmohtq2ZxZ6QVNEpqNn1T53Zc9FnR1CnaNnUf',
      'QMMD16kjauP5knBwxNUJRZ1Z5o3deBuFrqVjBVmmqto',
      'MRGNWSHaWmz3CPFcYt9Fyh8VDcvLJyy2SCURnMco2bC',
      '5fNfvyp5czQVX77yoACa3JJVEhdRaWjPuazuWgjhTqEH',
      'FoNqK2xudK7TfKjPFxpzAcTaU2Wwyt81znT4RjJBLFQp',
      'QRDxhMw1P2NEfiw5mYXG79bwfgHTdasY2xNP76XSea9',
      'FASQhaZQT53W9eT9wWnPoBFw8xzZDey9TbMmJj6jCQTs'
    ]
    const content = [
      '"friendlyname is Kamino Program, abbreviation is Kamino Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1563154884718985216/MPPps3IA_400x400.jpg"',
      '"friendlyname is Francium  Lending Reward Program, abbreviation is Lending Reward, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1476861175023353857/Srga_3kj_400x400.jpg"',
      '"friendlyname is DeGods Bank, abbreviation is DeGods Bank, category is programs, flag is , Logo URI is https://uploads-ssl.webflow.com/6190adde0207043d887665cd/620a4521d9114e3baaa296f8_DeGods.png"',
      '"friendlyname is Port Finance Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Lifinity Program, abbreviation is Lifinity Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1437045911188770817/cJs6MMUb_400x400.jpg"',
      '"friendlyname is TensorSwap Program, abbreviation is TensorSwap Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1570907127287259136/qujno7O4_400x400.jpg"',
      '"friendlyname is Orca Aquafarm Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Config Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Memo Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Socean Program, abbreviation is Socean Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1475760736248893440/bVkClqrP_400x400.jpg"',
      '"friendlyname is NFT Auction Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Francium Lending Program, abbreviation is Lending Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1476861175023353857/Srga_3kj_400x400.jpg"',
      '"friendlyname is SPL Governance Program, abbreviation is SPL Governance Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Orca Swap Program v1, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Magic Eden | V1, abbreviation is ME v1, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1554554723423993857/owxazkRR_400x400.jpg"',
      '"friendlyname is Token Vault Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Hubble, abbreviation is Hubble, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1471509778501230618/Pj3rpcr1_400x400.jpg"',
      '"friendlyname is Zeta Program, abbreviation is Zeta, category is programs, flag is , Logo URI is https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/bpujp5jytnshoqrarfwy"',
      '"friendlyname is Aldrin AMM V1, abbreviation is Aldrin AMM V1, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1427620181552123907/hO88aJ6H_400x400.jpg"',
      '"friendlyname is PoolProps Program, abbreviation is PoolProps Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1551312540298137601/7vdug71h_400x400.jpg"',
      '"friendlyname is Cega Program, abbreviation is Cega Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Secp256k1 SigVerify Precompile, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Friktion Program, abbreviation is Friktion Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1560317521730871296/YgRjgWDJ_400x400.png"',
      '"friendlyname is Squads, abbreviation is Squads, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1559576624655384576/nsPAP5Vx_400x400.jpg"',
      '"friendlyname is Bonfida Name Tokenizer Program, abbreviation is Bonfida Name Tokenizer Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1546403916140761089/cHHwcTe-_400x400.png"',
      '"friendlyname is Saber Router Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Serum Dex Program v3, abbreviation is Serum Dex Program v3, category is programs, flag is , Logo URI is https://assets.website-files.com/61382d4555f82a75dc677b6f/61ff21f9dcce3b42bfe4135c_serum%20NOF.png"',
      '"friendlyname is Name Service Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Marinade Staking Program, abbreviation is , category is programs, flag is , Logo URI is https://miro.medium.com/max/2400/1*cZ8iv9ecLinObz6CRQOdZg.png"',
      '"friendlyname is Tulip Protocol Lending Program, abbreviation is Tulip Protocol Lending Program, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/200x200/10373.png"',
      '"friendlyname is Wormhole Program , abbreviation is Wormhole Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Orca Whirlpool Program, abbreviation is WhirlPool , category is programs, flag is , Logo URI is "',
      '"friendlyname is Wormhole Token Bridge, abbreviation is Token Bridge, category is programs, flag is , Logo URI is "',
      '"friendlyname is Lido for Solana Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Metaplex Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Quarry Mine, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Raydium Staking Program, abbreviation is , category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png"',
      '"friendlyname is 01 Program, abbreviation is 01 Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Aldrin AMM V2, abbreviation is Aldrin AMM V2, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1427620181552123907/hO88aJ6H_400x400.jpg"',
      '"friendlyname is Orca Swap Program v2, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Solanart, abbreviation is Solanart, category is programs, flag is , Logo URI is "',
      '"friendlyname is Mango Program v3, abbreviation is , category is programs, flag is , Logo URI is https://global.discourse-cdn.com/standard10/uploads/mango/original/1X/66a85d6b21c3555fbc8d415e389ba566fccd4127.png"',
      '"friendlyname is DeGods Farm, abbreviation is DeGods Farm, category is programs, flag is , Logo URI is https://uploads-ssl.webflow.com/6190adde0207043d887665cd/620a4521d9114e3baaa296f8_DeGods.png"',
      '"friendlyname is Solend Program, abbreviation is , category is programs, flag is , Logo URI is https://miro.medium.com/fit/c/176/176/1*6diP-K7zgEMigbOxJBLqQQ.png"',
      '"friendlyname is Vote Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Hedge Program ID, abbreviation is Hedge Program ID, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1525647217394073608/M3QJ602S_400x400.jpg"',
      '"friendlyname is Jupiter, abbreviation is Jupiter, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1446493130555990024/xggcEv5a_400x400.jpg"',
      '"friendlyname is Tulip Protocol | Leverage Farming Program, abbreviation is Tulip Protocol Leverage Farming Program, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/200x200/10373.png"',
      '"friendlyname is NFT Candy Machine Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is NFT Candy Machine v2 Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Swim Swap Program, abbreviation is https://pbs.twimg.com/profile_images/1539329241615065088/-p3lqMF5_400x400.jpg, category is programs, flag is , Logo URI is "',
      '"friendlyname is Pyth Oracle Program, abbreviation is , category is programs, flag is , Logo URI is https://icoholder.com/files/img/bb1b4116ea0f723fec07a6bc5fe1e0f5.jpeg"',
      '"friendlyname is Apricot Finance Program, abbreviation is Apricot Finance Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Memo Program v2, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Stake Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Raydium Liquidity Pool V4, abbreviation is , category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png"',
      '"friendlyname is Only1 Program, abbreviation is Only1 Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1454195051022725120/rkvkkIky_400x400.jpg"',
      '"friendlyname is Genopets Habitat Management Program, abbreviation is Genopets, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/64x64/13632.png"',
      '"friendlyname is Token Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Tulip Staking Program, abbreviation is Tulip Staking, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/200x200/10373.png"',
      '"friendlyname is MagicEden V2 Program, abbreviation is MagicEden V2 Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1554554723423993857/owxazkRR_400x400.jpg"',
      '"friendlyname is System Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Associated Token Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Token Metadata Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Mercurial Stable Swap Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Atrix Finance Pool Program, abbreviation is Atrix Finance Pool Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Solsea, abbreviation is Solsea, category is programs, flag is , Logo URI is "',
      '"friendlyname is Streamflow Program, abbreviation is Streamflow Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1396561843146080259/VJNtxnX0_400x400.jpg"',
      '"friendlyname is Mean Finance MultiSig Program, abbreviation is Mean Finance MultiSig Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1511040310344044544/ksia9GiX_400x400.jpg"',
      '"friendlyname is Zebec Program, abbreviation is Zebec Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1524086536593375233/wTpZ1Euj_400x400.jpg"',
      '"friendlyname is SwitchBoard V2 Program, abbreviation is SwitchBoard, category is programs, flag is , Logo URI is https://miro.medium.com/max/2400/1*F4DeqUObWEKQbU8eB5T0CQ.png"',
      '"friendlyname is Jupiter Swap V4, abbreviation is Jupiter Swap V4, category is programs, flag is , Logo URI is "',
      '"friendlyname is DeFiLand Staking Program, abbreviation is DeFiLand Staking Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1488895696833032193/5SP1ZtJP_400x400.jpg"',
      '"friendlyname is Wormhole NFT Bridge, abbreviation is NFT Bridge, category is programs, flag is , Logo URI is "',
      '"friendlyname is Atrix Finance Farm Program, abbreviation is Atrix Finance Farm Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Serum Swap Program, abbreviation is Serum Swap Program, category is programs, flag is , Logo URI is https://assets.website-files.com/61382d4555f82a75dc677b6f/61ff21f9dcce3b42bfe4135c_serum%20NOF.png"',
      '"friendlyname is Tulip Protocol V2 Vaults, abbreviation is Tulip Protocol V2 Vaults, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/200x200/10373.png"',
      '"friendlyname is PsyFinance V2 Program, abbreviation is PsyFinance V2 Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1561846839053254660/AQ89o2jF_400x400.jpg"',
      '"friendlyname is PsyOptions - American Protocol Owner, abbreviation is PsyOptions - American Protocol Owner, category is accounts, flag is , Logo URI is "',
      '"friendlyname is Dialect Program, abbreviation is Dialect Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is PsyOptions - American Protocol DAO, abbreviation is DAO, category is accounts, flag is , Logo URI is "',
      '"friendlyname is Saber Stable Swap Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is PsyFinance Staking Program, abbreviation is PsyFinance Staking, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1561846839053254660/AQ89o2jF_400x400.jpg"',
      '"friendlyname is Larix Program, abbreviation is Larix Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Scallop\'s Program ID, abbreviation is Scallop\'s Program ID, category is programs, flag is , Logo URI is "',
      '"friendlyname is Mean Finance MSP V2, abbreviation is Mean Finance MSP V2, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1511040310344044544/ksia9GiX_400x400.jpg"',
      '"friendlyname is Solana Mobile Payment Gateway, abbreviation is SMS, category is programs, flag is , Logo URI is "',
      '"friendlyname is Ed25519 SigVerify Precompile, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Tulip | V1 Raydium Vault, abbreviation is Tulip\'s V1 Raydium Vault, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/200x200/10373.png"',
      '"friendlyname is DeFilLand Marketplace Program, abbreviation is DeFilLand Marketplace Program, category is programs, flag is , Logo URI is "',
      '"friendlyname is Everlend General Pool V1, abbreviation is General Pool, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1516109648981594119/-atTxUNG_400x400.png"',
      '"friendlyname is Solnet Program, abbreviation is Solnet, category is programs, flag is , Logo URI is https://repository-images.githubusercontent.com/370790102/c21bb900-d695-11eb-8960-ee7ce9c140a8"',
      '"friendlyname is Stake Pool Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Break Solana Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Mango Governance Program, abbreviation is , category is programs, flag is , Logo URI is "',
      '"friendlyname is Step Finance Swap Program, abbreviation is , category is programs, flag is , Logo URI is "',
  '"friendlyname is Goblin Gold Program ID, abbreviation is GGo1dnYpjKfe9omzUaFtaCyizvwpAMf3NhxSCMD61F3A, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1496450638053576704/7e7Xhvjy_400x400.jpg"',
  '"friendlyname is AlphaArt, abbreviation is AA, category is programs, flag is , Logo URI is "',
  '"friendlyname is Coinable\'s Program ID, abbreviation is Coinable\'s Program ID, category is programs, flag is , Logo URI is "',
  '"friendlyname is Nazare Program, abbreviation is Nazare Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1563031023486738432/m3W7VA1Q_400x400.jpg"',
  '"friendlyname is Streamflow MultiSig Program, abbreviation is  Streamflow MultiSig Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1396561843146080259/VJNtxnX0_400x400.jpg"',
  '"friendlyname is DigitalEyes, abbreviation is DigitalEyes, category is programs, flag is , Logo URI is "',
  '"friendlyname is Mean Finance DDCA Program, abbreviation is Mean Finance DDCA Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1511040310344044544/ksia9GiX_400x400.jpg"',
  '"friendlyname is Parrot Program, abbreviation is Parrot Program, category is programs, flag is , Logo URI is "',
  '"friendlyname is Quarry Merge Mine, abbreviation is , category is programs, flag is , Logo URI is "',
  '"friendlyname is MarginFi Program, abbreviation is MarginFi Program, category is programs, flag is , Logo URI is https://pbs.twimg.com/profile_images/1495835980443623429/6sfyPSTK_400x400.jpg"',
  '"friendlyname is Mango Program v2, abbreviation is , category is programs, flag is , Logo URI is "',
  '"friendlyname is Tulip | Orca Vault, abbreviation is Tulip Orca Vault, category is programs, flag is , Logo URI is https://s2.coinmarketcap.com/static/img/coins/200x200/10373.png"',
  '"friendlyname is Quarry Redeemer, abbreviation is , category is programs, flag is , Logo URI is "',
  '"friendlyname is PsyOptions - Tokenized  Europeans Protocol DAO, abbreviation is Tokenized Europeans Protocol DAO, category is accounts, flag is , Logo URI is "'
]
    const id = addressList.map((id, index) => ({ id: index + 1 }))

    const vectorStore = await MemoryVectorStore.fromTexts(
      addressList,
      id,
      new OpenAIEmbeddings()
    )

    const resultOne = await vectorStore.similaritySearch(address, 1)
    const s_address = resultOne[0].pageContent
    const context = content[resultOne[0].metadata.id - 1] + 'address: ' + s_address

    const prompt = `You are a helpful assistant. This is context related to this address ${s_address}.
                    context:${context}
                    questions: 'Fetches information about a specific solana wallet address.'
                    description: ${oldDescription}
                    answer based on above context and return the answer to string.`

    const chatModel = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo'
    })
    const response = await chatModel.invoke(prompt)
    const answer = response.content.toString()
    reply.update(<BotMessage>{answer}</BotMessage>);
    reply.done();
    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'fetch_solana_detail',
        content: answer,
      },
    ]);
  });

  return {
    id: Date.now(),
    display: reply.value,
  };
}

// Define necessary types and create the AI.

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
    confirmPurchase,
  },
  initialUIState,
  initialAIState,
});
