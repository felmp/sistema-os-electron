import { useState } from 'react'
import { trpc } from "./util";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IpcRequest } from "../api";
import { Home } from "./Home";
import superjson from "superjson";
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Os from './modules/os/os';
import NewOs from './modules/os/new-os';
import PendingBills from './modules/pending-bills/pending-bills';
import NewPendingBills from './modules/pending-bills/new-pending-bills';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: Os,
    },
    {
      path: "/os/cadastro",
      Component: NewOs,
    },
    {
      path: "/contas-pagar",
      Component: PendingBills
    },
    {
      path: "/contas-pagar/cadastro",
      Component: NewPendingBills
    }
  ]);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink(),
        httpBatchLink({
          url: '/trpc',

          // custom fetch implementation that sends the request over IPC to Main process
          fetch: async (input, init) => {
            const req: IpcRequest = {
              url: input instanceof URL ? input.toString() : typeof input === 'string' ? input : input.url,
              method: input instanceof Request ? input.method : init?.method!,
              headers: input instanceof Request ? input.headers : init?.headers!,
              body: input instanceof Request ? input.body : init?.body!,
            };

            const resp = await window.appApi.trpc(req);

            return new Response(resp.body, {
              status: resp.status,
              headers: resp.headers,
            });
          }
        }),
      ],
      transformer: superjson
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        {/* <Home/> */}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App
