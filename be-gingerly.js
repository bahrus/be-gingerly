// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';
import { MountObserver } from 'mount-observer/MountObserver.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-gingerly/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */

/**
 * @implements {Actions}
 * 
 */
class BeGingerly extends BE {
    /**
     * @type {BEConfig<AP & BEAllProps, Actions & IEnhancement, any>}
     */
    static config = {
        propDefaults: {
            cnt: 0
        },
        propInfo: {
            ...propInfo,
            queue: {},
            itemCE: {},
            ref: {},
        },
        compacts: {
            //when_itemCE_changes_invoke_attachProp: 0
        },
        actions: {},
        positractions: [
            resolved, rejected,
        ]
    };
    

    /**
     * 
     * @param {Element} enhancedElement 
     * @param {EnhancementInfo} enhancementInfo
     * @override 
     */
    async attach(enhancedElement, enhancementInfo) {
        super.attach(enhancedElement, enhancementInfo);
        const mo = new MountObserver({
            on: '[itemscope*="-"]',
            do:{
                mount: async (matchingElement) => {
                    const {Newish, waitForEvent} = await import('trans-render/dss/Newish.js');
                    const itemscope = /** @type {string} */ (matchingElement.getAttribute('itemscope'));
                    if(matchingElement instanceof HTMLTemplateElement){
                        const {cloneKey} = await import('mount-observer/compose.js');
                        if(matchingElement.hasAttribute('src') || !/** {type any} */(matchingElement)[cloneKey]){
                            await waitForEvent(matchingElement, 'load');
                        }
                        const {tagTempl} = await import('trans-render/dss/tref/tagTempl.js');
                        tagTempl(matchingElement, 'be-gingerly');
                    }
                    const newish = new Newish(matchingElement, itemscope);
                    if(!newish.isResolved){
                        await waitForEvent(newish, 'resolved');
                    }
                    const ishAttr = matchingElement.getAttribute('data-ish') || matchingElement.getAttribute('-ish');
                    const ish = /** @type {any} */(matchingElement).ish;
                    if(ishAttr !== null){
                        const parsedAttr = JSON.parse(ishAttr);
                        Object.assign(ish, parsedAttr);
                    }
                    const xform = ish.constructor?.config?.xform;
                    if(xform !== undefined){
                        const {Transform} = await import('trans-render/Transform.js');
                        if(matchingElement instanceof HTMLTemplateElement){
                            const itemref = matchingElement.getAttribute('itemref');
                            if(itemref !== null){
                                const {getChildren} = await import('trans-render/dss/tref/getChildren.js');
                                const children = getChildren(matchingElement, itemref);
                                for(const child of children){
                                    Transform(child, ish, xform);
                                }
                            }
                            
                        }else{
                            Transform(matchingElement, ish, xform);
                        }
                        
                    }

                }
            }
        });
        mo.observe(enhancedElement);
        this.resolved = true;
    }
}
await BeGingerly.bootUp();
export { BeGingerly };
