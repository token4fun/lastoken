const contractAddress = "0x893535ed1b5c6969e62a10babfed4f5ff8373278"; // Substituir pelo real
const contractABI = []; // Adicionar ABI do contrato aqui

async function fetchTokenData() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        try {
            const name = await contract.methods.name().call();
            const symbol = await contract.methods.symbol().call();
            const totalSupply = await contract.methods.totalSupply().call();

            document.getElementById("tokenName").innerText = name;
            document.getElementById("tokenSymbol").innerText = symbol;
            document.getElementById("totalSupply").innerText = (totalSupply / 1e18).toFixed(2);

        } catch (error) {
            console.error("Erro ao buscar dados do token:", error);
        }
    } else {
        alert("MetaMask não detectado!");
    }
}

window.onload = fetchTokenData;
