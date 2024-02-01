'use client';
import IconPlus from '../../../public/img/plus.svg'
import IconLeft from '../../../public/img/chevron-left.svg'
import IconRight from '../../../public/img/chevron-right.svg'
import IconStickyNote from '../../../public/img/sticky-note.svg'
import { StatusOS } from '../../components/status-os'
import { useState } from 'react';
import { trpc } from '../../util';
import { useNavigate } from 'react-router';

export default function PendingBills() {
  const navigate = useNavigate();
  const [titleFilter, setTitleFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pending_bills = trpc.pendingBills.useQuery();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePendingBillsDetails = (id: number) => {
    navigate(`${id}`)

  };

  const filteredPendingBills = (titleFilter !== '')
    ? pending_bills.data?.filter(f => {
      const titleCondition =
        titleFilter === '' || f.title.toLocaleLowerCase().includes(titleFilter.toLocaleLowerCase()) || f.title.toLocaleUpperCase().includes(titleFilter.toLocaleLowerCase())
        || f.description.toLocaleLowerCase().includes(titleFilter.toLocaleLowerCase()) || f.description.toLocaleUpperCase().includes(titleFilter.toLocaleLowerCase());

      return titleCondition;
    })
    : pending_bills.data;

  const currentItems = filteredPendingBills?.slice(indexOfFirstItem, indexOfLastItem);

  const totalItems = filteredPendingBills?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);


  return (
    <div className="px-6 pt-8 w-full h-full">
      <div className='flex w-full'>
        <div className="w-full h-10 bg-white rounded pl-4 flex items-center font-semibold text-xs">
          <h1>Contas a Pagar</h1>
        </div>
        <a href={'/contas-pagar/cadastro'} className="w-10 h-10 rounded ml-4 flex items-center justify-center bg-teal-400 hover:bg-teal-500">
          <img src={IconPlus} alt="Botão de adicionar ordem de serviço" width={8} height={8} />
        </a>
      </div>

      {/* <div className='flex w-full mt-4'>
        <div className="w-full h-auto bg-white rounded px-4 py-4 flex items-center font-normal text-xs gap-4">
          <div className='w-full flex flex-col'>
            <label className='mb-3'>Placa</label>
            <input className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300' type="text" name='plate' onChange={(e) => setPlateFilter(e.target.value)} />
          </div>
          <div className='w-full flex flex-col'>
            <label className='mb-3'>Modelo</label>
            <input className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300' type="text" name='model' onChange={(e) => setModelFilter(e.target.value)} />
          </div>
          <div className='w-full flex flex-col'>
            <label className='mb-3'>Cliente</label>
            <input className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300' type="text" name='client' onChange={(e) => setClientFilter(e.target.value)} />
          </div>
          <div className='w-full flex flex-col'>
            <label className='mb-3'>Valor</label>
            <input className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300' type="text" name='price' onChange={(e) => setPriceFilter(e.target.value)} />
          </div>
        </div>
      </div> */}

      <div className='w-full max-h-[73%] min-h-[73%] mb-3 mt-4 bg-white rounded p-4'>
        <div className='w-full table'>
          <div className='table-header-group border border-b-2 border-slate-200'>
            <div className='w-full font-semibold table-row'>
              <div className='text-left p-4 table-cell'>ID</div>
              <div className='text-left p-4 table-cell'>Titulo</div>
              <div className='text-left p-4 table-cell'>Observação</div>
              <div className='text-left p-4 table-cell'>Data Vencimento</div>
              <div className='text-left p-4 table-cell'>Valor</div>
              <div className='text-left p-4 table-cell'>Status</div>
              <div className='text-right p-4 table-cell'></div>
            </div>
          </div>
          <div className='table-row-group'>
            {
              pending_bills.data?.map(s => {
                return (
                  <div onClick={() => handlePendingBillsDetails(s.id)} key={s.id} className='hover:bg-slate-200 cursor-pointer table-row'>
                    <div className='text-left p-[16px] table-cell'>{s.id.toString().padStart(6, '0')}</div>
                    <div className='text-left p-[16px] table-cell'>
                      {s.title}
                    </div>
                    <div className='text-left p-[16px] table-cell'>{s.description}</div>
                    <div className='text-left p-[16px] table-cell'>{s.due_date}</div>
                    <div className='text-left p-[16px] table-cell'>{s.price}</div>
                    <div className='text-left p-[16px] table-cell'>teste</div>
                    <div className='text-right p-[16px] table-cell'>
                      <a href={''} className='w-5 h-5 rounded bg-slate-500 flex items-center justify-center'>
                        <img src={IconStickyNote} alt="Botão de adicionar ordem de serviço" width={10} height={10} />
                      </a>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
      <div className='flex w-full h-10 mb-3'>
        <div className='w-full rounded bg-white flex items-center justify-center'>
          <h3>
            {totalPages === 0 ? 'Nenhum dado encontrado' : `Páginas ${currentPage} de ${totalPages}`}
          </h3>
        </div>
        <div className='flex flex-row w-[112px] ml-4'>
          <button onClick={() => currentPage !== 1 ? setCurrentPage(currentPage - 1) : ''} className={`w-10 h-full rounded ${currentPage !== 1 ? 'bg-white hover:bg-slate-100' : 'bg-slate-100'} flex items-center justify-center text-white font-semibold text-xs`}>
            <img src={IconLeft} alt="Botão de navegação página esquerda" width={16} height={16} />
          </button>
          <button onClick={() => currentPage !== totalPages ? setCurrentPage(currentPage + 1) : ''} className={`w-10 h-full ml-4 rounded ${currentPage !== totalPages ? 'bg-white hover:bg-slate-100' : 'bg-slate-100'} flex items-center justify-center text-white font-semibold text-xs`}>
            <img src={IconRight} alt="Botão de navegação página esquerda" width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
