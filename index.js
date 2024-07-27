const WebSocket = require("ws");
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const botToken = '6649560396:AAHGcBcbSnpaLo8-Url0b7OqpG7L1iEZFiI';
const bot = new TelegramBot(botToken);

// Create a WebSocket connection
const ws = new WebSocket(
  "wss://atlas-mainnet.helius-rpc.com?api-key=75b8868e-3327-428a-9687-7b45ede56da7",
);
const getRandomNumber = () => {
    const min = 100;
    const max = 10000000000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
// Function to send a request to the WebSocket server
function sendRequest(ws) {
  const accountAddresses = [
  "LVyG9fjdLff7vQQGz7tSFjvstfYT8ME5Q13V9zfTCqo",
  "941UV4dNwCCVrQ32UJWNQ7aErzpN1sEe5XmrZMHRrVhk",
  "4cTyCi325LB9MrZET9ZVkdTaoCweWymF6nUDxGswEnS1",
  "87kkpYYHJFe4HuuZ5BbZvw63voeWbDdpn1qr3sVVw8ss",
  "Hag6kqP7B41bGuDG1ScT8gZpfz9CSh3aiHtAQU1n9eyJ",
  "5mTSm76YE1JT8mjGFeyR9Md5mzoreFnnFFYMJH2o9JBo",
  "DipPveFQgPwYn6YBC6yjq5v5XyNjbfX99ycEfvJyczsZ",
  "Eu1KegiA7rLMBa6Nge6Et9pF8QF8Hwpzgd7FMKCZsLW4",
  "2EBeePAj6Vfb1Cdn3vnyo2iU1LHmrYqf2si7hiM7NGp9"
  
  ];
  const request = {
    jsonrpc: "2.0",
    id: 420,
    method: "transactionSubscribe",
    params: [
      {
        accountInclude: accountAddresses,
      },
      {
        commitment: "processed",
        encoding: "jsonParsed",
        transactionDetails: "full",
        showRewards: true,
        maxSupportedTransactionVersion: 0,
      },
    ],
  };
  ws.send(JSON.stringify(request));
}

// Define WebSocket event handlers

ws.on("open", function open() {
  console.log('WebSocket is open');
  sendRequest(ws); // Send a request once the WebSocket is open
});

ws.on("message", async function incoming(data) {
  const messageStr = data.toString("utf8");
  //console.log("Received message:", messageStr);
  try {
    const messageObj = JSON.parse(messageStr);

    // Check if the message is a transaction notification
    if (messageObj.method === "transactionNotification") {
      const params = messageObj.params;
      const transaction = params.result.transaction.transaction;
      const instructions = transaction.message.instructions;
      const blockedAddresses = [
                "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
				"2AQdpHJ2JpcEgPiATUXjQxA8QmafFegfQwSLWSprPicm",
				"CRCMGeGh1Pv9Gvo1uiUL7T3g315axD5ouKR8hxG6kHvg",
				"AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2",
				"BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6",
				"ASTyfSima4LLAdDgoFGkgqoKowG1LZFDr9fAQrg7iaJZ",
				"H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS",
				"GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE",
				"5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD"
             ];   
            
      // Iterate over instructions to find the relevant data
      for (const instruction of instructions) {
        const parsed = instruction.parsed;
        if (parsed && parsed.type === "transfer") {
          const source = parsed.info.source;
          const lamports = parsed.info.lamports;
          const destination = parsed.info.destination;
          const lamportsToSol = lamports / 1000000000;
          // Output the desired fields
          console.log("Source:", source);
          console.log("Lamports:", lamportsToSol);
          console.log("Destination:", destination);
		  console.log("==========================================="); 
		  
		  if (blockedAddresses.includes(source)) {
                        console.log("Source address is blocked. Skipping fetching token transactions.");
                        console.log("===========================================");
                        return;
                    }
        
          if (lamportsToSol >= 11) {
            await fetchTokenTransactions(source);
          } else {
            console.log("Lamports less than 10 SOL. Skipping fetching token transactions.");
            console.log("==========================================="); 
            return;
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse JSON:", e);
	//console.error("Original message:", messageStr);
  }
});

ws.on("error", function error(err) {
  console.error("WebSocket error:", err);
});

ws.on("close", function close() {
  console.log("WebSocket is closed");
});


async function fetchTokenTransactions(source) {
      try {
      // 'client' is accessible here
     // const auBeHeaderValue = `%${getRandomNumber()}%`;
      const response = await axios.get('https://api-v2.solscan.io/v2/account/balance_change', {
      params: {
        address: source,
        page_size: '10',
        page: '1'
        
	  },
         headers: {
                'authority': 'api.solscan.io',
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'no-cache',
                'origin': 'https://solscan.io',
                'pragma': 'no-cache',
                'referer': 'https://solscan.io/',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                // 'sol-be': 'MrILjvv2iTziL4sPmNnITx8t7-xzfQB7NiM=4vCsra',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36'
            }
        });
         //console.log(response.data);
		  if (!Array.isArray(response.data.data)) {
            console.error('No transactions found or data is not an array');
            return;
        }

        // Create a set to keep track of unique token addresses
        const uniqueTokenAddresses = new Set();

        // Extract and print tokenAddress from each transaction
        for (const transaction of response.data.data) {
            const tokenAddress = transaction.token_address;

            // Check if tokenAddress is already seen, if so, skip
            if (uniqueTokenAddresses.has(tokenAddress)) {
                continue;
            }

            uniqueTokenAddresses.add(tokenAddress);

            // Make request to fetch additional token information
            const dexScreenerResponse = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);

            if (dexScreenerResponse.data.pairs && dexScreenerResponse.data.pairs.length > 0) {
                const tokenInfo = dexScreenerResponse.data.pairs[0]; // Assuming there is only one pair
                const { address, name } = tokenInfo.baseToken;
                const { fdv, pairCreatedAt } = tokenInfo;

                // Convert Unix timestamp to human-readable date format
                const pairCreatedAtDate = new Date(pairCreatedAt);
                const pairCreatedAtIST = pairCreatedAtDate.toLocaleString('en-US', {
                    timeZone: 'Asia/Kolkata', // Set timezone to Indian Standard Time
                });

                // Calculate time difference in milliseconds
                const currentTime = new Date();
                const timeDifferenceMs = currentTime - pairCreatedAtDate;

                // Convert milliseconds to minutes
                const timeDifferenceMinutes = Math.round(timeDifferenceMs / (1000 * 60));

                // Convert milliseconds to hours
                const timeDifferenceHours = Math.round(timeDifferenceMs / (1000 * 60 * 60));

                // Format the time difference
                let formattedTimeDifference;
                if (timeDifferenceMinutes < 60) {
                    formattedTimeDifference = `${timeDifferenceMinutes} minute${timeDifferenceMinutes === 1 ? '' : 's'} ago`;
                } else {
                    formattedTimeDifference = `${timeDifferenceHours} hour${timeDifferenceHours === 1 ? '' : 's'} ago`;
                }

                //if (timeDifferenceHours <= 1) {
        if (timeDifferenceHours <= 1 && fdv > 10000 && fdv < 40000) {	
                    bot.sendMessage('-4177841017', `Base Token Address: ${address}\nName: ${name}\nMARRKETCAP: ${fdv}\nPair Created At: ${pairCreatedAtIST}\nTime Difference: ${formattedTimeDifference}`);
					
                } else {
                    console.log(`Skipping message for token ${address} as time difference is greater than 2 hours/Marketcap is too low`);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching token transactions:', error);
        throw error; // Rethrow the error to handle it in the message event
    }
}

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  // Perform any cleanup if necessary, then exit
  process.exit(1); // PM2 will restart the script because of this exit
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform any cleanup if necessary, then exit
  process.exit(1); // PM2 will restart the script because of this exit
});
