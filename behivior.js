import { BeHive, seed } from 'be-hive/be-hive.js';
import { MountObserver } from 'mount-observer/MountObserver.js';
export const emc = {};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);
