export async function withTemplate(self) {
    const { itemCE } = self;
    const templ = self.enhancedElement;
    const itemref = templ.getAttribute('itemref');
    if (itemref !== null) {
        const rn = templ.getRootNode();
        const ids = itemref.split(' ').filter(x => x.trim());
        for (const id of ids) {
            const ce = rn.querySelector(`#${id} ${itemCE}`);
            if (ce !== null)
                return ce;
        }
        return null;
    }
    const ctr = await customElements.whenDefined(itemCE);
    const mainTemplate = ctr?.config?.mainTemplate;
    switch (typeof mainTemplate) {
        case 'string':
            const templ = document.createElement('template');
            templ.innerHTML = mainTemplate;
            ctr.config.mainTemplate = templ;
            break;
        case 'undefined':
            throw 'CE must provide config.mainTemplate';
    }
    const templToClone = ctr.config.mainTemplate;
    const clone = templToClone.content.cloneNode(true);
    const returnObj = new ctr();
    const selfSlot = clone.querySelector('slot[name="self"]');
    if (selfSlot === null)
        throw 404;
    selfSlot.after(returnObj);
    selfSlot.remove();
    const slotPlaceHolders = templ.content.querySelectorAll('[slot]');
    for (const slotPlaceHolder of slotPlaceHolders) {
        const targetSlot = clone.querySelector(`slot[name="${slotPlaceHolder.getAttribute('slot')}"]`);
        if (targetSlot === null)
            throw 404;
        targetSlot.after(slotPlaceHolder.cloneNode(true));
        targetSlot.remove();
    }
    templ.after(clone);
    return returnObj;
}
