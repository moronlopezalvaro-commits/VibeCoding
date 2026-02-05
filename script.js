// Seleccionamos los elementos
const draggables = document.querySelectorAll('.game-cover');
const containers = document.querySelectorAll('.tier-content, .bench');

// --- LÓGICA DE ESCRITORIO (Drag & Drop API estándar) ---

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
    });
});

containers.forEach(container => {
    container.addEventListener('dragover', e => {
        e.preventDefault(); // Necesario para permitir soltar
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', e => {
        e.preventDefault();
        container.classList.remove('drag-over');
        
        // Buscamos el elemento que se está arrastrando
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            container.appendChild(draggable);
        }
    });
});

// --- LÓGICA PARA MÓVILES (Touch Events) ---
// Simulación de Drag & Drop para pantallas táctiles

let currentDraggable = null;
let startX = 0;
let startY = 0;

draggables.forEach(draggable => {
    draggable.addEventListener('touchstart', (e) => {
        // Evitar scroll mientras se arrastra una imagen
        e.preventDefault(); 
        
        const touch = e.touches[0];
        currentDraggable = draggable;
        
        // Guardar posición inicial y estilos para moverlo visualmente
        startX = touch.clientX;
        startY = touch.clientY;
        
        // Preparar el elemento para moverse libremente
        currentDraggable.style.position = 'fixed';
        currentDraggable.style.left = (touch.clientX - (currentDraggable.offsetWidth / 2)) + 'px';
        currentDraggable.style.top = (touch.clientY - (currentDraggable.offsetHeight / 2)) + 'px';
        currentDraggable.style.zIndex = '1000';
        currentDraggable.style.opacity = '0.8';
        currentDraggable.style.pointerEvents = 'none'; // Importante para detectar el elemento debajo (dropzone)
    }, { passive: false });

    draggable.addEventListener('touchmove', (e) => {
        if (!currentDraggable) return;
        e.preventDefault(); // Evitar scroll
        
        const touch = e.touches[0];
        
        // Mover el elemento con el dedo
        currentDraggable.style.left = (touch.clientX - (currentDraggable.offsetWidth / 2)) + 'px';
        currentDraggable.style.top = (touch.clientY - (currentDraggable.offsetHeight / 2)) + 'px';
        
        // Feedback visual en las zonas de destino
        highlightDropZone(touch.clientX, touch.clientY);
    }, { passive: false });

    draggable.addEventListener('touchend', (e) => {
        if (!currentDraggable) return;
        
        const touch = e.changedTouches[0];
        
        // Buscar el elemento debajo del dedo al soltar
        // Reactivamos pointer-events temporalmente para usar elementFromPoint si fuera necesario, 
        // pero como ya lo tenemos en 'none', podemos ver qué hay debajo.
        let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Asegurarnos de que el objetivo es un contenedor válido o un hijo de un contenedor
        let validContainer = dropTarget.closest('.tier-content') || dropTarget.closest('.bench');
        
        // Limpiar estilos inline (volver al flujo normal del DOM)
        currentDraggable.style.position = '';
        currentDraggable.style.left = '';
        currentDraggable.style.top = '';
        currentDraggable.style.zIndex = '';
        currentDraggable.style.opacity = '';
        currentDraggable.style.pointerEvents = '';
        
        if (validContainer) {
            validContainer.appendChild(currentDraggable);
        }
        
        // Limpiar clases visuales
        containers.forEach(c => c.classList.remove('drag-over'));
        currentDraggable = null;
    });
});

// Función auxiliar para iluminar la zona donde se va a soltar en móvil
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