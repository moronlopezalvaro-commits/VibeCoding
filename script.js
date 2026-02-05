// --- LÓGICA PRINCIPAL Y VARIABLES ---
const draggables = document.querySelectorAll('.game-cover');
const containers = document.querySelectorAll('.tier-content, .bench');
const resetBtn = document.getElementById('reset-btn');
const benchContainer = document.getElementById('bench');

// Inicializar estadísticas al cargar
document.addEventListener('DOMContentLoaded', updateStatistics);

// --- FUNCIONALIDAD: RESETEAR BANQUILLO ---
resetBtn.addEventListener('click', () => {
    // Seleccionar todas las imágenes de nuevo (por si se han añadido dinámicamente)
    const allImages = document.querySelectorAll('.game-cover');
    
    // Mover cada una de vuelta al banquillo
    allImages.forEach(img => {
        benchContainer.appendChild(img);
    });

    // Actualizar las barras de progreso después de mover todo
    updateStatistics();

    // Pequeña animación de feedback en el botón
    resetBtn.textContent = "¡BANQUILLO LISTO!";
    setTimeout(() => {
        resetBtn.textContent = "REINICIAR BANQUILLO";
    }, 1500);
});


// --- FUNCIONALIDAD: ESTADÍSTICAS EN TIEMPO REAL ---
function updateStatistics() {
    const totalGames = document.querySelectorAll('.game-cover').length;
    // Seleccionamos solo las filas de la Tier List (no el banquillo)
    const tierRows = document.querySelectorAll('.tier-row');

    tierRows.forEach(row => {
        // 1. Contar juegos en esta fila específica
        const contentArea = row.querySelector('.tier-content');
        const gamesInRow = contentArea.querySelectorAll('.game-cover').length;

        // 2. Calcular porcentaje (evitar división por cero)
        let percentage = 0;
        if (totalGames > 0) {
            percentage = Math.round((gamesInRow / totalGames) * 100);
        }

        // 3. Actualizar el DOM (Texto y Barra)
        const percentText = row.querySelector('.stat-percent');
        const progressBar = row.querySelector('.progress-bar-fill');

        percentText.textContent = `${percentage}%`;
        progressBar.style.width = `${percentage}%`;

        // Opcional: Cambiar color si está muy lleno (estilo sobrecarga)
        if (percentage > 50) {
             progressBar.style.filter = "brightness(1.2)";
        } else {
             progressBar.style.filter = "brightness(1)";
        }
    });
}


// --- LÓGICA DRAG & DROP (ESCRITORIO) ---

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
        // Importante: Actualizar stats al soltar
        updateStatistics();
    });
});

containers.forEach(container => {
    container.addEventListener('dragover', e => {
        e.preventDefault();
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', e => {
        e.preventDefault();
        container.classList.remove('drag-over');
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            container.appendChild(draggable);
            // No es necesario llamar updateStatistics aquí porque 'dragend' se dispara justo después
        }
    });
});


// --- LÓGICA DRAG & DROP (MÓVIL/TÁCTIL) ---

let currentDraggable = null;
let startX, startY;

draggables.forEach(draggable => {
    // Touch Start
    draggable.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        currentDraggable = draggable;
        startX = touch.clientX;
        startY = touch.clientY;
        
        draggable.classList.add('dragging');
        draggable.style.position = 'fixed';
        draggable.style.left = (touch.clientX - draggable.offsetWidth / 2) + 'px';
        draggable.style.top = (touch.clientY - draggable.offsetHeight / 2) + 'px';
        draggable.style.zIndex = '1000';
        draggable.style.pointerEvents = 'none';
    }, { passive: false });

    // Touch Move
    draggable.addEventListener('touchmove', (e) => {
        if (!currentDraggable) return;
        e.preventDefault();
        const touch = e.touches[0];
        currentDraggable.style.left = (touch.clientX - currentDraggable.offsetWidth / 2) + 'px';
        currentDraggable.style.top = (touch.clientY - currentDraggable.offsetHeight / 2) + 'px';
        highlightDropZone(touch.clientX, touch.clientY);
    }, { passive: false });

    // Touch End
    draggable.addEventListener('touchend', (e) => {
        if (!currentDraggable) return;
        const touch = e.changedTouches[0];
        let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        let validContainer = dropTarget.closest('.tier-content') || dropTarget.closest('.bench');
        
        // Resetear estilos inline
        currentDraggable.style.position = '';
        currentDraggable.style.left = '';
        currentDraggable.style.top = '';
        currentDraggable.style.zIndex = '';
        currentDraggable.style.pointerEvents = '';
        currentDraggable.classList.remove('dragging');
        
        if (validContainer) {
            validContainer.appendChild(currentDraggable);
            // ¡CRUCIAL! Actualizar estadísticas después de soltar en móvil
             updateStatistics();
        }
        
        containers.forEach(c => c.classList.remove('drag-over'));
        currentDraggable = null;
    });
});

function highlightDropZone(x, y) {
    containers.forEach(c => c.classList.remove('drag-over'));
    let target = document.elementFromPoint(x, y);
    if (target) {
        let validContainer = target.closest('.tier-content') || target.closest('.bench');
        if (validContainer) {
            validContainer.classList.add('drag-over');
        }
    }
}