import IconOS from "../../public/img/os.svg"
import IconFinanceiro from "../../public/img/financeiro.svg"

export function NavBar() {
// ${pathname === '/' ? 'bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'}
  return (
    <nav className="flex flex-col items-center pt-8 space-y-4 bg-white w-[92px]">
      <a href="/" className={`w-10 h-10 flex justify-center items-center border rounded `}>
        <img src={IconOS} alt="Botão de OS" width={8} height={8} />
      </a>

      <a href="/contas-pagar" className={`w-10 h-10 flex justify-center items-center border rounded `}>
        <img src={IconFinanceiro} alt="Botão de Financeiro" width={22.89} height={20.34} />
      </a>
    </nav>
  )
}