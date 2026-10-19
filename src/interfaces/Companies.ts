import { ICoupon } from './Coupons';
import { IAddress, IAddressRequest } from './Address';
import { IPlan } from './Plans';

export interface Company {
    id: string;
    name: string;
    email: string;
    password: string;
    image: string;
    branch: string;
    planExpirationDate: string | null;
    planId: string | null;
    address: IAddress;
    coupons: ICoupon[];
    plan: IPlan | null;
    linkImage: string;
}

export interface ICompanyRequest {
    name: string;
    email: string;
    password: string;
    image: File | null;
    branch: string;
    address: IAddressRequest;
}
