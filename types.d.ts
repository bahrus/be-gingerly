import {IEnhancement} from 'trans-render/be/types';

export interface EndUserProps extends IEnhancement {
}

export interface AP extends EndUserProps{
    queue?: Set<any>,
    itemCE?: string,
}

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{

}

