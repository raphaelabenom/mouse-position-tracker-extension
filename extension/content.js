// PARTE RESPONSÁVEL POR SALVAR A POSIÇÃO DO MOUSE NO STORAGE LOCAL

let lastPosition = { x: 0, y: 0 }; // Variável para armazenar a última posição do mouse

document.addEventListener('mousemove', function(mouseEvent) {
    lastPosition.x = mouseEvent.clientX; // Atualiza a posição X
    lastPosition.y = mouseEvent.clientY; // Atualiza a posição Y
});

document.addEventListener('keydown', function(keyboardEvent) {
    if (keyboardEvent.ctrlKey && keyboardEvent.key.toLowerCase() === 'b') {

        keyboardEvent.preventDefault();

        // Objeto com as informações da posição do mouse e timestamp
        const position = {
            x: lastPosition.x, // Usa a última posição do mouse
            y: lastPosition.y, // Usa a última posição do mouse
            url: window.location.href, // Captura a URL atual
            timestamp: new Date().toLocaleString() // Captura o timestamp
        };

        // Recupera as posições salvas no storage local
        chrome.storage.local.get(['positions'], function(result) {
            
            // Se não houver posições salvas, cria um array vazio
            const positions = result.positions || [];

            // Adiciona a nova posição ao array
            positions.push(position); 

            // Adiciona a nova posição
            chrome.storage.local.set({ positions }, function() {
                // Chamada da função para mostrar a notificação
                showNotification(); 

                // Envia uma mensagem para o popup.js para carregar as posições
                chrome.runtime.sendMessage({ action: "loadPositions" }); // API do Chrome
            });
        });
    }
});

// Mostrar notificação ao presionar Ctrl + B para salvar a posição
function showNotification() {


    const div = document.createElement('div');
  
    // CSS
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        z-index: 999999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;  
    div.textContent = 'Posição salva!';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

