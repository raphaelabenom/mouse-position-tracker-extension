document.addEventListener('DOMContentLoaded', function() {
    loadPositions();

    document.getElementById('exportBtn').addEventListener('click', exportPositions);
    document.getElementById('clearBtn').addEventListener('click', clearPositions);
});

function loadPositions() {
    fetch('http://localhost:3000/api/coordinates')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(positions => {
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
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('positions').innerHTML = `<div class="position-item">Erro ao carregar posições: ${error.message}</div>`;
        });
}

function exportPositions() {
    fetch('http://localhost:3000/api/coordinates')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(positions => {
            if (positions.length === 0) {
                alert('Não há posições para exportar');
                return;
            }

            const text = positions.map((pos, index) => 
                `Posição ${index + 1}:\nX: ${pos.x}, Y: ${pos.y}\nURL: ${pos.url}\nData: ${pos.timestamp}\n\n`
            ).join('');

            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = 'coordenadas_mouse.txt';
            a.click();

            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Erro ao exportar posições: ${error.message}`);
        });
}

function clearPositions() {
    if (confirm('Tem certeza que deseja limpar todas as posições?')) {
        fetch('http://localhost:3000/api/coordinates', {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadPositions();
            alert('Todas as posições foram removidas');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Erro ao limpar posições: ${error.message}`);
        });
    }
}

