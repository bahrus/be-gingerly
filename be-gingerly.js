// @ts-check
import { config as beCnfg } from 'be-enhanced/config.js';
import { BE } from 'be-enhanced/BE.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AllProps, AP} from './types.d.ts' */;

/**
 * @implements {Actions}
 * 
 */
class BeGingerly extends BE {
    static config = {
        propDefaults: {
            cnt: 0
        },
        propInfo: {
            ...beCnfg.propInfo,
            queue: {},
            itemCE: {},
            ref: {},
        },
        compacts: {
            when_itemCE_changes_invoke_attachProp: 0
        },
        actions: {},
        positractions: [
            ...beCnfg.positractions,
        ]
    };
    async attachProp(self) {
        const { AttachedHost } = await import('trans-render/dss/AttachedHost.js');
        const { waitForEvent } = await import('trans-render/lib/isResolved.js');
        const { enhancedElement } = self;
        const ah = new AttachedHost(enhancedElement);
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
