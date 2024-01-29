import IconNavigateNext from '../../../public/img/navigate-next.svg'
import IconPlus from '../../../public/img/plus.svg'
import IconRemove from '../../../public/img/close.svg'
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { trpc } from '../../util';
import { redirect } from 'react-router-dom';

export default function NewPendingBills() {
  // const [totalPrice, setTotalPrice] = useState(0);
  const createPendingBillsFormSchema = z.object({
    title: z.string().trim(),
    description: z.string().optional(),
    due_date: z.string(),
    status: z.string(),
    installments_quantity: z.string(),
    installments: z.array(
      z.object({
        description: z.string(),
        is_paid: z.string(),
        payment_date: z.string(),
        price: z.string()
      })
    ),
  })

  const utils = trpc.useContext();
  const pending_bills = trpc.pendingBills.useQuery();
  const addPendingBills = trpc.pendingBillCreate.useMutation({
    onSuccess: (e) => {
      utils.pendingBills.invalidate();
    }
  });

  const addInstallments = trpc.installmentCreate.useMutation({
    onSuccess: () => {
      utils.installments.invalidate();
    }
  })

  type CreatePendingBillsFormData = z.infer<typeof createPendingBillsFormSchema>

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreatePendingBillsFormData>({
    resolver: zodResolver(createPendingBillsFormSchema)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'installments',
  })

  function addNewInstallments() {
    append({
      description: '',
      is_paid: 'teste',
      payment_date: '',
      price: ''
    })
  }

  function removeInstallments(index: number) {
    remove(fields.length - 1)
  }

  async function createPendingBills(data: any) {
    console.log(data)
    // if (!data.installments.find((s: any) => s.description !== '' && s.description !== '' && s.price !== '')) {
    //   alert('É necessário adicionar pelo menos uma parcela!')
    //   return;
    // }

    // try {
    //   const result = await addPendingBills.mutateAsync({
    //     description: data.description,
    //     due_date: data.date,
    //     price: data.model,
    //     title: data.plate,
    //   });

    //   for (const s of data.services) {
    //     if (s.description !== '' && s.is_paid === false && s.payment_date !== '' && s.price !== '') {
    //       await addInstallments.mutate({
    //         description: s.description,
    //         payment_date: s.payment_date,
    //         is_paid: s.is_paid,
    //         price: Number(s.price),
    //         pending_bill_id: result.id
    //       });
    //     }
    //   }

    //   redirect('/')

    // } catch (error) {
    //   console.error('Erro ao criar OS:', error);
    //   // Lidar com o erro, se necessário
    // }
  }

  useEffect(() => {
    append({
      description: '',
      is_paid: 'teste',
      payment_date: '',
      price: ''
    })

  }, [append])

  // const totalPrice = fields.reduce((acc, curr) => acc + Number(curr.price) * Number(curr.quantity), 0);

  return (
    <div className="px-6 pt-8 w-full h-full">
      <div className='flex w-full'>
        <div className="w-full h-10 bg-white rounded pl-4 flex flex-row items-center font-semibold text-xs">
          <a href={'/'} className='hover:text-slate-500' >Contas a Pagar</a>
          <div>
            <img src={IconNavigateNext} alt=">" width={16} height={16} />
          </div>
          <h1>Novo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(createPendingBills)}>
        <div className='w-full h-auto mb-3 mt-4 bg-white rounded p-4'>
          <div className='flex flex-row font-normal text-xs gap-4'>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Titulo <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('title')}
              />
              {
                errors.title && <span className='text-[10px] mt-2 text-red-500'>{errors.title?.message}</span>
              }
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Descrição</label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('description')}
              />
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Data de Vencimento<span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('due_date')}
              />
              {
                errors.due_date && <span className='text-[10px] mt-2 text-red-500'>{errors.due_date?.message}</span>
              }
            </div>
          </div>

          <div className='flex flex-row font-normal text-xs gap-4 mt-4'>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Parcelas <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('installments_quantity')}
              />
              {
                errors.installments_quantity && <span className='text-[10px] mt-2 text-red-500'>{errors.installments_quantity?.message}</span>
              }
            </div>
            {/* <div className='w-full flex flex-col'>
              <label className='mb-3'>Anexos <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('')}
              />
              {
                errors.model && <span className='text-[10px] mt-2 text-red-500'>{errors.model?.message}</span>
              }
            </div> */}
          </div>

          <div className="w-full mt-4">
            <label className='text-xs font-normal'>Parcelas</label>
          </div>
          <div className='border border-slate-200 w-full h-auto rounded mt-3 p-4'>
            {
              fields.map((field, index) => (
                <div className='flex flex-row font-normal text-xs gap-4 mb-3' key={field.id}>
                  <div className='w-full flex flex-col'>
                    <label className='mb-3'>Descrição</label>
                    <input
                      type="text"
                      className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`installments.${index}.description`)}
                    />
                  </div>
                  <div className='w-full flex flex-col'>
                    <label className='mb-3'>Paga</label>
                    <input
                      type="checkbox"
                      className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`installments.${index}.is_paid`)}
                    />
                  </div>
                  <div className='w-full flex flex-col'>
                    <label className='mb-3'>Data de Pagamento</label>
                    <input
                      type="text"
                      className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`installments.${index}.payment_date`)}
                    />
                  </div>
                  <div className='w-full flex flex-col'>
                    <label className='mb-3'>Valor</label>
                    <input
                      type="text"
                      className='w-[550px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`installments.${index}.price`)}
                    />
                  </div>
                  {
                    fields.length == index + 1 ? (
                      <div className='w-[20%] flex flex-col justify-end'>
                        <label className='mb-3'>&nbsp;</label>
                        <button className='flex items-center justify-center font-normal text-xs text-white w-full h-8 bg-teal-400 rounded' type='button' onClick={addNewInstallments}>
                          <img src={IconPlus} alt="Adicionar parcelas" width={8} height={8} />
                        </button>
                      </div>
                    ) : (
                      <div className='w-[20%] flex flex-col justify-end'>
                        <label className='mb-3'>&nbsp;</label>
                        <button className='flex items-center justify-center font-normal text-xs bg-red-600 text-white w-full h-8 rounded' type='button' onClick={() => removeInstallments(index)}>
                          <img src={IconRemove} alt="Remover parcelas" width={8} height={8} />
                        </button>
                      </div>
                    )
                  }

                </div>
              ))
            }
          </div>

          {/* <div className='flex font-normal mt-3 text-xs gap-4 mb-3 justify-end mr-16'>
            <div className='flex flex-col'>
              <label className='mb-3'>Valor Total</label>
              <input
                type="text"
                readOnly
                value={totalPrice}
                className='w-[550px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
              />
            </div>
          </div> */}
        </div>
        <div className='h-10 w-full flex-row flex justify-between'>
          <div className='flex flex-row'>
            <a onClick={() => {
              console.log('teste')
            }} className='flex items-center justify-center font-normal text-xs text-white w-[69px] h-10 p-4 bg-slate-500 rounded'>
              Voltar
            </a>
          </div>
          <div className='flex flex-row'>
            <button className='flex items-center justify-center font-normal text-xs text-white w-[69px] h-10 p-4 bg-teal-400 rounded' type='submit' >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div >
  )
}
