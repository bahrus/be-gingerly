import {BeGingerly} from './be-gingerly.js';
export async function withTemplate(self: BeGingerly): Promise<HTMLElement | null>{
    const {itemCE} = self;
    const templ = self.enhancedElement as HTMLTemplateElement;
    const itemref = templ.getAttribute('itemref');
    if(itemref !== null){
        const rn = templ.getRootNode() as DocumentFragment;
        const ids = itemref.split(' ').filter(x => x.trim());
        for(const id of ids){
            const ce = rn.querySelector(`#${id} ${itemCE}`);
            if(ce !== null) return ce as HTMLElement;
        }
        return null;
    }
    const ctr = await customElements.whenDefined(itemCE!) as any;
    const mainTemplate = ctr?.config?.mainTemplate;
    switch(typeof mainTemplate){
        case 'string':
            const templ = document.createElement('template');
            templ.innerHTML = mainTemplate;
            ctr.config.mainTemplate = templ;
            break;
        case 'undefined':
            throw 'CE must provide config.mainTemplate';
    }
    const templToClone = ctr.config.mainTemplate as HTMLTemplateElement;
    const clone = templToClone.content.cloneNode(true) as DocumentFragment;
    const returnObj = new ctr();
    const selfSlot = clone.querySelector('slot[name="self"]');
    if(selfSlot === null) throw 404;
    selfSlot.after(returnObj);
    selfSlot.remove();
    const slotPlaceHolders = templ.content.querySelectorAll('[slot]');
    for(const slotPlaceHolder of slotPlaceHolders){
        const targetSlot  = clone.querySelector(`slot[name="${slotPlaceHolder.getAttribute('slot')}"]`);
        if(targetSlot === null) throw 404;
        targetSlot.after(slotPlaceHolder.cloneNode(true));
        targetSlot.remove();
    }
    templ.after(clone);
    return returnObj;
}