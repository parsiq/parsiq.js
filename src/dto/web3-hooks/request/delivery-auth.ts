export enum HttpAuthType {
  basic = 'basic',
  bearer = 'bearer',
}

export interface DeliveryCredentials {
  username?: string;
  password?: string;
  token?: string;
}

export interface DeliveryAuth {
  type: HttpAuthType;
  credentials: DeliveryCredentials;
}
