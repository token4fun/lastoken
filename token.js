const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // 🔥 Substitua pelo endereço real do contrato
const apiKey = "NABPG1J8DPTD6NMNU4WZIT4GCB258666UQ";  // 🔥 Insira sua API Key da BSCScan

// ✅ Buscar dados do token automaticamente da BSCScan
async function fetchTokenData() {
    try {
        // ✅ Buscar preço do token e market cap
        const priceUrl = `https://api.bscscan.com/api?module=stats&action=tokenprice&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const priceResponse = await fetch(priceUrl);
        const priceData = await priceResponse.json();

        if (priceData.status === "1") {
            document.getElementById("tokenPrice").innerText = `$${parseFloat(priceData.result.ethusd).toFixed(4)}`;
        } else {
            document.getElementById("tokenPrice").innerText = "Erro ao buscar preço.";
        }

        // ✅ Buscar total supply e market cap
        const supplyUrl = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${apiKey}`;
        const supplyResponse = await fetch(supplyUrl);
        const supplyData = await supplyResponse.json();

        if (supplyData.status === "1") {
            const totalSupply = parseFloat(supplyData.result / 1e18).toFixed(2);
            document.getElementById("totalSupply").innerText = totalSupply;
            document.getElementById("marketCap").innerText = `$${(parseFloat(priceData.result.ethusd) * totalSupply).toFixed(2)}`;
        } else {
            document.getElementById("totalSupply").innerText = "Erro ao buscar supply.";
        }

        // ✅ Buscar holders (Top 10)
        fetchHolders();
    } catch (error) {
        console.error("Erro ao buscar dados do token:", error);
    }
}

// ✅ Buscar os Top 10 Holders do token na BSC
async function fetchHolders() {
    const holdersUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&sort=desc&apikey=${apiKey}`;

    try {
        const response = await fetch(holdersUrl);
        const data = await response.json();

        if (data.status === "1") {
            const transactions = data.result.slice(0, 10);
            let holderList = "";
            transactions.forEach(tx => {
                holderList += `<li>${tx.to.slice(0, 6)}...${tx.to.slice(-4)}: ${parseFloat(tx.value / 1e18).toFixed(2)} Tokens</li>`;
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
