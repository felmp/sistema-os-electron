import { useState } from "react";
import { trpc } from "./util";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IpcRequest } from "../api";
import { Home } from "./Home";
import superjson from "superjson";
import {
  BrowserRouter,
  HashRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
} from "react-router-dom";
import Os from "./modules/os/os";
import NewOs from "./modules/os/new-os";
import PendingBills from "./modules/pending-bills/pending-bills";
import NewPendingBills from "./modules/pending-bills/new-pending-bills";
import EditOs from "./modules/os/edit-os";
import EditPendingBills from "./modules/pending-bills/edit-pending-bills";

function App({ children }: any) {
  // const router = createBrowserRouter([
  //   {
  //     path: "/",
  //     element: <Os />,
  //   },
  //   {
  //     path: "os/cadastro",
  //     element: <NewOs />,
  //   },
  //   {
  //     path: "os/:id",
  //     element: <EditOs />,
  //   },
  //   {
  //     path: "contas-pagar",
  //     element: <PendingBills />,
  //   },
  //   {
  //     path: "contas-pagar/cadastro",
  //     element: <NewPendingBills />,
  //   },
  //   {
  //     path: "contas-pagar/:id",
  //     element: <EditPendingBills />,
  //   },
  // ]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink(),
        httpBatchLink({
          url: "/trpc",

          // custom fetch implementation that sends the request over IPC to Main process
          fetch: async (input, init) => {
            const req: IpcRequest = {
              url:
                input instanceof URL
                  ? input.toString()
                  : typeof input === "string"
                  ? input
                  : input.url,
              method: input instanceof Request ? input.method : init?.method!,
              headers:
                input instanceof Request ? input.headers : init?.headers!,
              body: input instanceof Request ? input.body : init?.body!,
            };

            const resp = await window.appApi.trpc(req);

            return new Response(resp.body, {
              status: resp.status,
              headers: resp.headers,
            });
          },
        }),
      ],
      transformer: superjson,
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
