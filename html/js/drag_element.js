function dragElement(element, dragHandle, config = { useBottomRight: false }) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    dragHandle.onmousedown = dragMouseDown;
    dragHandle.ontouchstart = dragTouchStart;

    function updatePosition() {
        if (config.useBottomRight) {
            const parentHeight = element.parentElement.clientHeight;
            const parentWidth = element.parentElement.clientWidth;
            const elementHeight = element.offsetHeight;
            const elementWidth = element.offsetWidth;
            
            element.style.top = '';
            element.style.left = '';
            
            const newBottom = parentHeight - (element.offsetTop - pos2 + elementHeight);
            const newRight = parentWidth - (element.offsetLeft - pos1 + elementWidth);
            element.style.bottom = newBottom + "px";
            element.style.right = newRight + "px";
        } else {
            element.style.bottom = '';
            element.style.right = '';
            element.style.top = (element.offsetTop + pos2) + "px";
            element.style.left = (element.offsetLeft + pos1) + "px";
        }
    }

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
        e.preventDefault();
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementTouchDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        updatePosition();
    }

    function elementTouchDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.touches[0].clientX;
        pos2 = pos4 - e.touches[0].clientY;
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        updatePosition();
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}