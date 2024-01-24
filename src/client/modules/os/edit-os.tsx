import IconNavigateNext from '../../../public/img/navigate-next.svg'
import IconPlus from '../../../public/img/plus.svg'
import IconRemove from '../../../public/img/close.svg'
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { trpc } from '../../util';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditOs() {
  const navigate = useNavigate();
  const { id } = useParams();

  console.log('edit id : ' + id)
  // const [totalPrice, setTotalPrice] = useState(0);
  const [minService, setMinService] = useState(false);
  const updateOsFormSchema = z.object({
    client: z.string().trim().min(1, 'Cliente é obrigatório!'),
    phone: z.string().optional(),
    date: z.string().min(1, 'Data é obrigatória!'),
    plate: z.string().min(1, 'Placa é obrigatória!'),
    model: z.string().min(1, 'Modelo é obrigatório!'),
    services: z.array(
      z.object({
        description: z.string(),
        quantity: z.string(),
        price: z.string()
      })
    ),
  })

  const utils = trpc.useContext();

  const os = trpc.osById.useQuery(id || '');
  const services = trpc. serviceByOsId.useQuery(id || '');

  const updateOs = trpc.osUpdate.useMutation({
    onSuccess: (e) => {
      utils.os.invalidate();
    }
  });

  const updateService = trpc.serviceUpdate.useMutation({
    onSuccess: () => {
      utils.os.invalidate();
    }
  })

  type updateOsFormData = z.infer<typeof updateOsFormSchema>

  const { register, handleSubmit, control, formState: { errors } } = useForm<updateOsFormData>({
    resolver: zodResolver(updateOsFormSchema)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  function addNewService() {
    append({
      description: '',
      quantity: '',
      price: ''
    })
  }

  function removeService(index: number) {
    remove(index)
  }

  async function handlerUpdateOs(data: any) {
    console.log(data)
    if (!data.services.find((s: any) => s.description !== '' && s.description !== '' && s.price !== '')) {
      setMinService(true)
      return;
    }

    setMinService(false)

    const result = await updateOs.mutateAsync({
      id: id || '',
      client_name: data.client,
      date: data.date,
      model: data.model,
      plate: data.plate,
      phone: data.phone,
      status: 'pending'
    });

    for (const s of data.services) {
      if (s.description !== '' && s.quantity !== '' && s.price !== '') {
        await updateService.mutate({
          id: s.id,
          description: s.description,
          quantity: Number(s.quantity),
          price: Number(s.price),
          os_id: result.id
        });
      }
    }

    navigate('/');
  }

  useEffect(() => {
    services.data?.forEach(s => {
      append({
        description: s.description,
        quantity: s.quantity.toString(),
        price: s.price.toString()
      })
    })

  }, [services.data])

  const totalPrice = fields.reduce((acc, curr) => acc + Number(curr.price) * Number(curr.quantity), 0);

  return (
    <div className="px-6 pt-8 w-full h-full">
      <div className='flex w-full'>
        <div className="w-full h-10 bg-white rounded pl-4 flex flex-row items-center font-semibold text-xs">
          <a href={'/'} className='hover:text-slate-500' >Ordem de Serviço</a>
          <div>
            <img src={IconNavigateNext} alt=">" width={16} height={16} />
          </div>
          <h1>Editar</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(handlerUpdateOs)}>
        <div className='w-full h-auto mb-3 mt-4 bg-white rounded p-4'>
          <div className='flex flex-row font-normal text-xs gap-4'>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Cliente <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                value={os.data?.client_name}
                {...register('client')}
              />
              {
                errors.client && <span className='text-[10px] mt-2 text-red-500'>{errors.client?.message}</span>
              }
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Telefone</label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                value={os.data?.phone || ''}
                {...register('phone')}
              />
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Data <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                value={os.data?.date }
                {...register('date')}
              />
              {
                errors.date && <span className='text-[10px] mt-2 text-red-500'>{errors.date?.message}</span>
              }
            </div>
          </div>

          <div className='flex flex-row font-normal text-xs gap-4 mt-4'>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Placa <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                value={os.data?.plate}
                {...register('plate')}
              />
              {
                errors.plate && <span className='text-[10px] mt-2 text-red-500'>{errors.plate?.message}</span>
              }
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Modelo <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                value={os.data?.model}
                {...register('model')}
              />
              {
                errors.model && <span className='text-[10px] mt-2 text-red-500'>{errors.model?.message}</span>
              }
            </div>
          </div>

          <div className="w-full mt-4">
            <label className='text-xs font-normal'>Serviços</label>
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
                      {...register(`services.${index}.description`)}
                    />
                  </div>
                  <div className='w-full flex flex-col'>
                    <label className='mb-3'>Qtd</label>
                    <input
                      type="text"
                      className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`services.${index}.quantity`)}
                    />
                  </div>
                  <div className='w-full flex flex-col'>
                    <label className='mb-3'>Valor</label>
                    <input
                      type="text"
                      className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`services.${index}.price`)}
                    />
                  </div>
                  {
                    fields.length == index + 1 ? (
                      <div className='w-[10%] flex flex-col'>
                        <label className='mb-3'>&nbsp;</label>
                        <button className='flex items-center justify-center font-normal text-xs text-white w-full h-8 bg-teal-400 rounded' type='button' onClick={addNewService}>
                          <img src={IconPlus} alt="Adicionar serviço" width={8} height={8} />
                        </button>
                      </div>
                    ) : (
                      <div className='w-[10%] flex flex-col'>
                        <label className='mb-3'>&nbsp;</label>
                        <button className='flex items-center justify-center font-normal text-xs bg-red-600 text-white w-full h-8 rounded' type='button' onClick={() => removeService(index)}>
                          <img src={IconRemove} alt="Remover serviço" width={8} height={8} />
                        </button>
                      </div>
                    )
                  }

                </div>
              ))
            }
          </div>
          {
            minService && <span className='text-[10px] mt-2 text-red-500'>Digite pelo menos 1 serviço!</span>
          }

          <div className='flex font-normal mt-3 text-xs gap-4 mb-3 justify-end mr-16'>
            <div className='flex flex-col'>
              <label className='mb-3'>Valor Total</label>
              <input
                type="text"
                readOnly
                value={totalPrice}
                className='w-[352px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
              />
            </div>
          </div>
        </div>
        <div className='h-10 w-full flex-row flex justify-between'>
          <div className='flex flex-row'>
            <a onClick={() => console.log(os.data, services.data)} className='flex items-center justify-center font-normal text-xs text-white w-[69px] h-10 p-4 bg-slate-500 rounded'>
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
