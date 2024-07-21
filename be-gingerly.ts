import {config as beCnfg} from 'be-enhanced/config.js';
import {BE, BEConfig} from 'be-enhanced/BE.js';
import {Actions, AP, PAP, ProPAP} from './types';
import { Positractions, PropInfo } from 'trans-render/froop/types';
import {IEnhancement,  BEAllProps, EnhancementInfo} from 'trans-render/be/types';
import {assignGingerly} from 'trans-render/lib/assignGingerly.js';

class BeGingerly extends BE<AP, Actions> implements Actions{
    static override config: BEConfig<AP & BEAllProps, Actions & IEnhancement, any> = {
        propDefaults:{
            cnt: 0
        },
        propInfo:{
            ...beCnfg.propInfo,
            queue: {},
            itemCE: {},
            ref: {},
        },
        compacts: {
            when_itemCE_changes_invoke_attachProp: 0
        },
        actions: {
            // doPass: {
            //     ifAllOf: ['cnt', 'ref', 'queue']
            // },
            // searchAgain:  {
            //     ifAllOf: ['cnt'],
            //     ifNoneOf: ['ref'],
            // }
        },
        positractions: [
            ...beCnfg.positractions!,
        ]
    };
    
    async attachProp(self: this) {
        const {AttachedHost} = await import('trans-render/dss/AttachedHost.js');
        const {waitForEvent} = await import('trans-render/lib/isResolved.js');
        const {enhancedElement} = self;
        const ah = new AttachedHost(enhancedElement);
        if(!ah.isResolved){
            await waitForEvent(ah, 'resolved');
        }
        return {
            resolved: true,
        } as PAP;

    }

    // async doPass(self: this) {
    //     const {ref, queue} = self;
    //     const ce = ref?.deref();
    //     if(ce === undefined){
    //         return {
    //             ref: undefined,
    //         }
    //     }
    //     while(queue!.length > 0 ){
    //         const fi = queue!.shift();
    //         await assignGingerly(ce, fi)
    //     }
    //     return {};
    // }
    // async #doSearch(self: this){
    //     const {enhancedElement, itemCE} = self;
    //     if(enhancedElement instanceof HTMLTemplateElement){
    //         const {withTemplate} = await import('./withTemplate.js');
    //         return await withTemplate(self);
    //     }
    //     return enhancedElement.querySelector(itemCE!);
    // }
    // async searchAgain(self: this) {
    //     const ce = await this.#doSearch(self);
    //     if(ce !== null){
    //         return {
    //             ref: new WeakRef(ce),
    //         }
    //     }else{
    //         return {}
    //     }
    // }
}

interface BeGingerly extends AP{}

await BeGingerly.bootUp();
 
export {BeGingerly}