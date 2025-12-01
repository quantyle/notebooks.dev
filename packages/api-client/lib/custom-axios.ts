import Axios, { AxiosRequestConfig, AxiosError } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "http://localhost:3001", // 🔧 Replace with env var if needed
});

export const customAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data as T);

  // Optional: allow cancellation (useful with React Query, etc.)
  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;
