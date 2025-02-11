const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // 🔥 Endereço real do contrato
const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ";  // 🔥 API Key da BSCScan

// ✅ Buscar dados do token automaticamente da BSCScan
async function fetchTokenData() {
    try {
        // ✅ Buscar total supply
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const supplyResponse = await fetch(supplyUrl);
        const supplyData = await supplyResponse.json();

        let totalSupply = 0;
        if (supplyData.status === "1") {
            totalSupply = parseFloat(supplyData.result / 1e18).toFixed(2);
            document.getElementById("totalSupply").innerText = totalSupply;
        } else {
            document.getElementById("totalSupply").innerText = "Erro ao buscar supply.";
        }

        // ✅ Buscar preço do token via API alternativa
        const priceUrl = `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${contractAddress}&vs_currencies=usd`;
        const priceResponse = await fetch(priceUrl);
        const priceData = await priceResponse.json();

        let tokenPrice = 0;
        if (priceData[contractAddress.toLowerCase()]) {
            tokenPrice = priceData[contractAddress.toLowerCase()].usd;
            document.getElementById("tokenPrice").innerText = `$${parseFloat(tokenPrice).toFixed(4)}`;
        } else {
            document.getElementById("tokenPrice").innerText = "Erro ao buscar preço.";
        }

        // ✅ Calcular Market Cap (evitar erro se tokenPrice falhar)
        if (tokenPrice > 0 && totalSupply > 0) {
            document.getElementById("marketCap").innerText = `$${(tokenPrice * totalSupply).toFixed(2)}`;
        } else {
            document.getElementById("marketCap").innerText = "Erro ao calcular Market Cap.";
        }

        // ✅ Buscar holders reais
        fetchHolders();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar os **Top 10 Holders** do token na BSC
async function fetchHolders() {
    const holdersUrl = `https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&apikey=${apiKey}`;

    try {
        const response = await fetch(holdersUrl);
        const data = await response.json();

        if (data.status === "1") {
            const holders = data.result.slice(0, 10);
            let holderList = "";
            holders.forEach(holder => {
                holderList += `<li>${holder.Address.slice(0, 6)}...${holder.Address.slice(-4)}: ${parseFloat(holder.Balance / 1e18).toFixed(2)} Tokens</li>`;
            });
            document.getElementById("holderList").innerHTML = holderList;
        } else {
            document.getElementById("holderList").innerText = "Erro ao buscar holders.";
        }
    } catch (error) {
        console.error("Erro ao buscar holders:", error);
    }
}

// ✅ Atualizar dados ao carregar a página
window.onload = fetchTokenData;
