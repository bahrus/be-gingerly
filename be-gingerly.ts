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
            doPass: {
                ifAllOf: ['cnt', 'ref', 'queue']
            },
            searchAgain:  {
                ifAllOf: ['cnt'],
                ifNoneOf: ['ref'],
            }
        },
        positractions: [
            ...beCnfg.positractions!,
        ]
    };
    
    async attachProp(self: this) {
        const {enhancedElement, cnt, itemCE} = self;
        if(Object.hasOwn(enhancedElement, 'host')) return {};
        const queue: Array<any> = [];
        const initPropVals = (<any>enhancedElement)['host'];
        if(enhancedElement instanceof HTMLElement){
            if(enhancedElement.dataset.hostInitProps){
                const parsedHostProps = JSON.parse(enhancedElement.dataset.hostInitProps);
                queue.push(parsedHostProps);
            }
        }
        if(initPropVals !== undefined) queue.push(initPropVals);

        let ref: WeakRef<Element> | undefined;
        const ce = await this.#doSearch(self);
        if(ce !== null) ref = new WeakRef(ce);
        if(Object.hasOwn(enhancedElement, 'ownerElement')){
            (<any>enhancedElement).ownerElement = ref;
        }
        Object.defineProperty(enhancedElement, 'host', {
            get(){
                return self.ref?.deref();
            },
            set(nv: any){
                queue.push(nv);
            },
            enumerable: true,
            configurable: true,
        });
        return {
            queue,
            cnt: cnt! + 1,
            ref,
            resolved: true,
        } as AP;

    }

    async doPass(self: this) {
        const {ref, queue} = self;
        const ce = ref?.deref();
        if(ce === undefined){
            return {
                ref: undefined,
            }
        }
        while(queue!.length > 0 ){
            const fi = queue!.shift();
            await assignGingerly(ce, fi)
        }
        return {};
    }
    async #doSearch(self: this){
        const {enhancedElement, itemCE} = self;
        if(enhancedElement instanceof HTMLTemplateElement){
            const {withTemplate} = await import('./withTemplate.js');
            return await withTemplate(self);
        }
        return enhancedElement.querySelector(itemCE!);
    }
    async searchAgain(self: this) {
        const ce = await this.#doSearch(self);
        if(ce !== null){
            return {
                ref: new WeakRef(ce),
            }
        }else{
            return {}
        }
    }
}

interface BeGingerly extends AP{}

await BeGingerly.bootUp();
 
export {BeGingerly}