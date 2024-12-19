import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
  

export async function jupiterSwap() {
    try {
        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=1b789c89-6ab1-4d31-b192-4205a155cc96');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));

// Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
const quoteResponse = await (
    await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
  &outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
  &amount=100000000\
  &slippageBps=200'
    )
  ).json();

  console.log({ quoteResponse })
    } catch (error) {
        console.error(error);
    }

}

// Run the main function if this file is being run directly
if (require.main === module) {
    jupiterSwap();
}


  // get serialized transactions for the swap
// const { swapTransaction } = await (
//     await fetch('https://quote-api.jup.ag/v6/swap', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         // quoteResponse from /quote api
//         quoteResponse,
//         // user public key to be used for the swap
//         userPublicKey: wallet.publicKey.toString(),
//         // auto wrap and unwrap SOL. default is true
//         wrapAndUnwrapSol: true,
//         // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
//         // feeAccount: "fee_account_public_key"
//       })
//     })
//   ).json();
