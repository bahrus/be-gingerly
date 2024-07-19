import { config as beCnfg } from 'be-enhanced/config.js';
import { BE } from 'be-enhanced/BE.js';
class BeGingerly extends BE {
    static config = {
        propInfo: {
            ...beCnfg.propInfo,
            queue: {},
            itemCE: {},
        }
    };
}
await BeGingerly.bootUp();
export { BeGingerly };
