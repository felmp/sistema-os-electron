import { useLocation, Link, Router, useNavigate } from "react-router-dom";
import IconFinanceiro from "../../public/img/pending-bills.png"
import IconOS from "../../public/img/services.png"

export function NavBar() {
  const navigate = useNavigate();

  // const location = useLocation();

  // const isOSRoute = location.pathname === "/";
  // const isContasPagarRoute = location.pathname === "/contas-pagar";

  return (
    <nav className="flex flex-col items-center pt-8 space-y-4 bg-white w-[92px]">
      <button onClick={() => navigate('/')} className={`w-12 h-12 flex justify-center items-center bg-slate-600 border rounded `}>
        <img src={IconOS} alt="Botão de OS" />
      </button>

      <button onClick={() => navigate("/contas-pagar")} className={`w-12 h-12 flex justify-center items-center bg-slate-600 border rounded `}>
        <img src={IconFinanceiro} alt="Botão de Financeiro" />
      </button>
    </nav>
  )
}