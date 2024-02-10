interface StatusOSProps {
  status: string
}

export function StatusOS(props: StatusOSProps) {
  return (
    <div className={`w-20 h-5 ${props.status === 'pending' ? 'bg-yellow-300': 'bg-green-300'}  rounded flex items-center justify-center font-normal `}>
      {props.status === 'pending' ? 'Pendente' : 'Concluido' }
    </div>
  )
}