// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP} from './types.d.ts' */;

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
            when_itemCE_changes_invoke_attachProp: 0
        },
        actions: {},
        positractions: [
            resolved, rejected,
        ]
    };
    /**
     * 
     * @param {AP & BEAllProps} self 
     * @returns 
     */
    async attachProp(self) {
        const { AttachedHost } = await import('trans-render/dss/AttachedHost.js');
        const { waitForEvent } = await import('trans-render/lib/isResolved.js');
        const { enhancedElement } = self;
        const ah = new AttachedHost(enhancedElement, enhancedElement.getAttribute('itemscope'));
        if (!ah.isResolved) {
            await waitForEvent(ah, 'resolved');
        }
        return {
            resolved: true,
        };
    }
}
await BeGingerly.bootUp();
export { BeGingerly };
