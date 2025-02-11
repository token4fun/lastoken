const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // Endereço do token CakeMoon
const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ";  // Insira sua API Key da BSCScan
const geckoTerminalUrl = "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x117c1dabb35ce89c7cb98a49e2355ab445366c23"; // URL do GeckoTerminal

async function fetchTokenData() {
    try {
        // 🔹 Buscar dados do GeckoTerminal (Preço, Liquidez, Volume)
        const geckoResponse = await fetch(geckoTerminalUrl);
        const geckoData = await geckoResponse.json();
        
        if (geckoData.data) {
            const pool = geckoData.data.attributes;
            document.getElementById("tokenPrice").innerText = `$${parseFloat(pool.base_token_price_usd).toFixed(6)}`;
            document.getElementById("liquidity").innerText = `$${parseFloat(pool.reserve_in_usd).toLocaleString()}`;
            document.getElementById("volume24h").innerText = `$${parseFloat(pool.volume_usd.h24).toLocaleString()}`;
        }

        // 🔹 Buscar Market Cap e Holders da BSCScan
        fetchMarketCap();
        fetchHolders();
        fetchTransactions();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar Market Cap (Supply Circulante x Preço)
async function fetchMarketCap() {
    try {
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const response = await fetch(supplyUrl);
        const data = await response.json();

        if (data.status === "1") {
            const totalSupply = parseFloat(data.result / 1e9);
            const price = parseFloat(document.getElementById("tokenPrice").innerText.replace("$", ""));
            const marketCap = (totalSupply * price).toFixed(2);
            document.getElementById("marketCap").innerText = `$${marketCap}`;
        }
    } catch (error) {
        console.error("Erro ao buscar Market Cap:", error);
    }
}

// ✅ Buscar Holders (Removendo Carteira de Queima)
async function fetchHolders() {
    try {
        const holdersUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&sort=desc&apikey=${apiKey}`;
        const response = await fetch(holdersUrl);
        const data = await response.json();

        if (data.status === "1") {
            const transactions = data.result.filter(tx => tx.to !== "0x000000000000000000000000000000000000dEaD").slice(0, 10);
            let holderList = "";
            transactions.forEach(tx => {
                holderList += `<li>${tx.to.slice(0, 6)}...${tx.to.slice(-4)}: ${parseFloat(tx.value / 1e9).toFixed(2)} MOON</li>`;
            });
            document.getElementById("holderList").innerHTML = holderList;
        }
    } catch (error) {
        console.error("Erro ao buscar Holders:", error);
    }
}

// ✅ Buscar Últimas Transações
async function fetchTransactions() {
    try {
        const txUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&sort=desc&apikey=${apiKey}`;
        const response = await fetch(txUrl);
        const data = await response.json();

        if (data.status === "1") {
            const transactions = data.result.slice(0, 10);
            let transactionList = "";
            transactions.forEach(tx => {
                transactionList += `<li>De: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)} → Para: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)} | ${parseFloat(tx.value / 1e9).toFixed(2)} MOON</li>`;
            });
            document.getElementById("transactionList").innerHTML = transactionList;
        }
    } catch (error) {
        console.error("Erro ao buscar transações:", error);
    }
}

// Atualizar dados a cada 30 segundos
fetchTokenData();
setInterval(fetchTokenData, 30000);
