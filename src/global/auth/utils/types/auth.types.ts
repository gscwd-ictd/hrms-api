export type AuthZ = { clientId: string; secret: string };
export type AuthN = { email: string; password: string };
//errors

export type RpcError = { code: string; title: string; message: string };
