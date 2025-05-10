import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export function apiRequest(
  methodOrUrl: string,
  url?: string,
  data?: unknown | undefined,
): Promise<any> {
  // Handle single parameter use case (just the URL)
  const paramCount = arguments.length;
  
  if (paramCount === 1) {
    return fetch(methodOrUrl, {
      method: 'GET',
      credentials: "include",
    })
    .then(res => throwIfResNotOk(res).then(() => res.json()));
  }
  
  // Handle traditional three-parameter use case
  return fetch(url!, {
    method: methodOrUrl,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  })
  .then(res => throwIfResNotOk(res).then(() => res));
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
