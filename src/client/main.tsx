import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NavBar } from "./components/nav-bar";
import { BrowserRouter, MemoryRouter, Route, Router, Routes } from "react-router-dom";
import Os from "./modules/os/os";
import NewOs from "./modules/os/new-os";
import PendingBills from "./modules/pending-bills/pending-bills";
import NewPendingBills from "./modules/pending-bills/new-pending-bills";
import EditOs from "./modules/os/edit-os";
import EditPendingBills from "./modules/pending-bills/edit-pending-bills";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MemoryRouter>
      <div className="flex flex-row flex-grow min-h-screen bg-slate-200">
        <NavBar />
        <div className="flex-1 flex flex-col">
          <App>
            <Routes>
              <Route path="/" element={<Os />} />
              <Route path="os/:id" element={<EditOs />} />
              <Route path="os/cadastro" element={<NewOs />} />
              <Route path="contas-pagar" element={<PendingBills />} />
              <Route
                path="contas-pagar/cadastro"
                element={<NewPendingBills />}
              />
              <Route path="contas-pagar/:id" element={<EditPendingBills />} />
            </Routes>
          </App>
          <div className="flex w-full items-center justify-end pr-6 h-11 bg-slate-100 text-slate-500 text-[10px] mt-auto">
            Powered by Crió © 2023
          </div>
        </div>
      </div>
    </MemoryRouter>
  </React.StrictMode>
);
