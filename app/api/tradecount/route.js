import { NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import dotenv from 'dotenv';

dotenv.config();

// Create a connection to Solana's mainnet
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// Helper to calculate the associated token address (ATA)
async function calculateATA(walletAddress, tokenMint) {
    // Calculate the associated token address
    const associatedTokenAddress = PublicKey.findProgramAddressSync(
        [new PublicKey(walletAddress).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(tokenMint).toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    return associatedTokenAddress;
}

// API handler function
export async function POST(request) {
    const { walletAddress, tokenMint } = await request.json();

    try {
        const tradeCount = await getTradeCount(walletAddress, tokenMint);

        return NextResponse.json({ tradeCount });
    } catch (error) {
        console.error('Error fetching trade count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Function to get the trade count for a token
async function getTradeCount(walletAddress, tokenMint) {
    const [tokenAccountPubkey] = await calculateATA(walletAddress, tokenMint);

    // Fetch the transaction signatures for the token account
    const signatures = await connection.getSignaturesForAddress(new PublicKey(tokenAccountPubkey));

    // Return the number of transactions involving the token account
    return signatures.length;
}
