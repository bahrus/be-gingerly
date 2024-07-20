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
            ref: {},
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
        },
        positractions: [
            ...beCnfg.positractions,
        ]
    };
    async attachProp(self) {
        const { enhancedElement, cnt, itemCE } = self;
        if (Object.hasOwn(enhancedElement, 'host'))
            return {};
        const queue = [];
        const initPropVals = enhancedElement['host'];
        if (enhancedElement instanceof HTMLElement) {
            if (enhancedElement.dataset.hostInitProps) {
                const parsedHostProps = JSON.parse(enhancedElement.dataset.hostInitProps);
                queue.push(parsedHostProps);
            }
        }
        if (initPropVals !== undefined)
            queue.push(initPropVals);
        let ref;
        const ce = this.#doSearch(self);
        if (ce !== null)
            ref = new WeakRef(ce);
        if (Object.hasOwn(enhancedElement, 'ownerElement')) {
            enhancedElement.ownerElement = ref;
        }
        Object.defineProperty(enhancedElement, 'host', {
            get() {
                return self.ref?.deref();
            },
            set(nv) {
                queue.push(nv);
            },
            enumerable: true,
            configurable: true,
        });
        return {
            queue,
            cnt: cnt + 1,
            ref,
            resolved: true,
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
