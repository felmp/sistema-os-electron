interface StatusOSProps {
  status: string
}

export function StatusOS(props: StatusOSProps) {
  return (
    <div className="w-20 h-5 bg-red-300 rounded flex items-center justify-center font-normal text-xs">
      {props.status === 'pending' ? 'Pendente' : props.status === 'approved' ? 'Aprovado' : 'Reprovado'}
    </div>
  )
}