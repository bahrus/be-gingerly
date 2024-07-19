import { BeHive, seed } from 'be-hive/be-hive.js';
import { MountObserver } from 'mount-observer/MountObserver.js';
export const emc = {
    base: 'be-gingerly',
    enhPropKey: 'beGingerly',
    map: {},
    osotas: [
        {
            name: 'itemprop',
            mapsTo: 'itemCE'
        }
    ],
    importEnh: async () => {
        const { BeGingerly } = await import('./be-gingerly.js');
        return BeGingerly;
    }
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);
