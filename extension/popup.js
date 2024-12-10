document.addEventListener('DOMContentLoaded', function() {
    
    loadPositions(); // Carrega as posições ao abrir o popup

    document.getElementById('exportBtn').addEventListener('click', exportPositions);
    document.getElementById('clearBtn').addEventListener('click', clearPositions);
});

// O evento DOMContentLoaded é acionado quando todo o HTML foi completamente carregado e analisado, sem aguardar pelo CSS, imagens, e subframes para encerrar o carregamento.

// Ouve mensagens do content.js via api
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "loadPositions") {
        loadPositions(); // Chama a função para carregar posições
        }
    }
);

function loadPositions() {
    chrome.storage.local.get(['positions'], function(result) {
        
        const positions = result.positions || [];
        const container = document.getElementById('positions');
        
        if (positions.length === 0) {
            container.innerHTML = '<div class="position-item">Nenhuma posição salva</div>';
            return;
        }
        
        container.innerHTML = positions.map((pos, index) => 
            `<div class="position-item">
                <div class="coords">Posição ${index + 1}: X=${pos.x !== undefined ? pos.x : 'N/A'}, Y=${pos.y !== undefined ? pos.y : 'N/A'}</div>
                <div class="url">${pos.url || 'N/A'}</div>
                <div class="timestamp">${pos.timestamp || 'N/A'}</div>
            </div>`
        ).join('');
        }
    );
}

function exportPositions() {
  chrome.storage.local.get(['positions'], function(result) {
      const positions = result.positions || [];

      if (positions.length === 0) {
          alert('Não há posições para exportar');
          return;
      }

      const text = positions.map((pos, index) => `Posição ${index + 1}:\nX: ${pos.x}, Y: ${pos.y}\nURL: ${pos.url}\nData: ${pos.timestamp}\n\n`).join('');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'coordenadas_mouse.txt';
      a.click();

      URL.revokeObjectURL(url);
  });
}

function clearPositions() {
  if (confirm('Tem certeza que deseja limpar todas as posições?')) {
      
    chrome.storage.local.set({ positions: [] }, function() {
          loadPositions();
      });

  }
}