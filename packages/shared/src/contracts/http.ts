export type ApiMeta = {
  requestId?: string;
  timestamp: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: ApiMeta;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  meta: ApiMeta;
};
