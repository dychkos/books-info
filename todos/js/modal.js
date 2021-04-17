
class Modal {
    $modal = null;

    ANIM_SPEED = 400;
    closing = false;
    destroyed = false;

    constructor(options) {
        const modal = document.createElement('div');
        this.onClose = options.onClose;
        modal.classList.add('modal-window');
        modal.insertAdjacentHTML('afterBegin',

            `   
        <div class="window__content ">
            <div class="window__header">
                <h2>${options.modalTitle}</h2>
                <span class="modal-close" data-close="true" >&times;</span>
            </div>
            <div class="window__text" data-content="true">
                ${options.modalText}

            </div>        
        </div>`);
        const footer = _createModalButtons(options.modalFooter);
        footer.appendAfter(modal.querySelector('[data-content]'))
        document.body.appendChild(modal);
        //реализация закрытия окна
        modal.addEventListener('click', (e) => {
            console.log('click')

            if (e.target.dataset.close) {
                this.close();
            }
        });

        this.$modal = modal;

    }

    open() {
        if (this.destroyed) {
            return console.log('modal is destroyed');
        }!this.closing && this.$modal.classList.add('open');
    }
    close() {
        this.closing = true;
        this.$modal.classList.remove('open');
        this.$modal.classList.add('hide');
        setTimeout(() => {
            this.$modal.classList.remove('hide');
            this.closing = false;
            if (typeof this.onClose === 'function') {
                this.onClose();
            }
        }, this.ANIM_SPEED)

    }
    destroy() {
        this.$modal.parentNode.removeChild(this.$modal);
        //this.$modal.removeEventListener('click',listener);
        this.destroyed = true;
    }
    //заміна контенту
    setContent(html) {
        this.$modal.querySelector('[data-content]').innerHTML = html;
    }




}

Element.prototype.appendAfter = function(element) {
    element.parentNode.insertBefore(this, element.nextSibling);
}

function noop() {}

//Футер для модального окна
function _createModalButtons(buttons = []) {
    if (buttons.length === 0) {
        return document.createElement('div');

    }
    const wrap = document.createElement('div');
    wrap.classList.add('window__footer');


    buttons.forEach(btn => {
        const $btn = document.createElement('button');
        $btn.textContent = btn.text;
        $btn.classList.add('btn');
        $btn.classList.add('btn--primary');
        $btn.classList.add('btn--small');
        $btn.classList.add('btn--modal');
        $btn.classList.add('uppercase');
        btn.type && $btn.setAttribute("type",btn.type);
        $btn.onclick = btn.handler || noop;

        wrap.appendChild($btn);
    });


    return wrap;

}
