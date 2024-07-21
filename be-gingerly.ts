import {config as beCnfg} from 'be-enhanced/config.js';
import {BE, BEConfig} from 'be-enhanced/BE.js';
import {Actions, AP, PAP, ProPAP} from './types';
import {IEnhancement,  BEAllProps, EnhancementInfo} from 'trans-render/be/types';

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



}

interface BeGingerly extends AP{}

await BeGingerly.bootUp();
 
export {BeGingerly}