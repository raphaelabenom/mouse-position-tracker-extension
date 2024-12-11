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

        // Send the position to the server
        fetch('http://localhost:3000/api/coordinates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(position),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          showNotification('Posição salva no banco de dados!');
        })
        .catch((error) => {
          console.error('Error:', error);
          showNotification('Erro ao salvar posição!', true);
        });
    }
});

// Mostrar notificação ao presionar Ctrl + B para salvar a posição
function showNotification(message, isError = false) {
  const div = document.createElement('div');
  
  div.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? '#f44336' : '#4CAF50'};
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;  
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

