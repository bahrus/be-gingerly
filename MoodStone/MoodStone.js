//@ts-check
/**
 * @import {XForm} from '../ts-refs/trans-render/types';
 * @import {Props, Actions} from './types';
 * @implements {Partial<Props>}
 * @implements {Actions}
 */
export class MoodStone extends HTMLElement {
    static config = {
        /**
         * @type{XForm<Props, Actions>}
         */
        xform: {
            section: 'isHappy'
        }
    }
    #isHappy = false;
    get root(){
        if(this.shadowRoot !== undefined) return this.shadowRoot;
        return this;
    }
    get isHappy() {
        return this.#isHappy;
    }
    set isHappy(nv) {
        this.#isHappy = nv;
        //this.root.querySelector('#target2').innerHTML = nv.toString();
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.root.innerHTML = String.raw `
            <div id=target2></div>
            <be-hive></be-hive>
        `;
    }
}
customElements.define('mood-stone', MoodStone);
