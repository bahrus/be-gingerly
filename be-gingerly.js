import { config as beCnfg } from 'be-enhanced/config.js';
import { BE } from 'be-enhanced/BE.js';
import { assignGingerly } from 'trans-render/lib/assignGingerly.js';
class BeGingerly extends BE {
    static config = {
        propDefaults: {
            cnt: 0
        },
        propInfo: {
            ...beCnfg.propInfo,
            queue: {},
            itemCE: {},
        },
        compacts: {
            when_itemCE_changes_invoke_attachProp: 0
        },
        actions: {
            doPass: {
                ifAllOf: ['cnt', 'ref', 'queue']
            },
            searchAgain: {
                ifAllOf: ['cnt'],
                ifNoneOf: ['ref'],
            }
        }
    };
    async attachProp(self) {
        const { enhancedElement, cnt, itemCE } = self;
        if (Object.hasOwn(enhancedElement, 'assignGingerly'))
            return {};
        const queue = [];
        const initVal = enhancedElement['assignGingerly'];
        if (initVal !== undefined)
            queue.push(initVal);
        Object.defineProperty(enhancedElement, 'assignGingerly', {
            set(nv) {
                queue.push(nv);
            }
        });
        let ref;
        const ce = this.#doSearch(self);
        if (ce !== null)
            ref = new WeakRef(ce);
        return {
            queue,
            cnt: cnt + 1,
            ref
        };
    }
    async doPass(self) {
        const { ref, queue } = self;
        const ce = ref?.deref();
        if (ce === undefined) {
            return {
                ref: undefined,
            };
        }
        while (queue.length > 0) {
            const fi = queue.shift();
            await assignGingerly(ce, fi);
        }
        return {};
    }
    #doSearch(self) {
        const { enhancedElement, itemCE } = self;
        const ce = enhancedElement.querySelector(itemCE);
        return ce;
    }
    searchAgain(self) {
        const ce = this.#doSearch(self);
        if (ce !== null) {
            return {
                ref: new WeakRef(ce),
            };
        }
        else {
            return {};
        }
    }
}
await BeGingerly.bootUp();
export { BeGingerly };
