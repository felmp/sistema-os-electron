import IconNavigateNext from '../../../public/img/navigate-next.svg'
import IconPlus from '../../../public/img/plus.svg'
import IconRemove from '../../../public/img/close.svg'
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { trpc } from '../../util';
import { useNavigate, useParams } from 'react-router-dom';
import InputMask from "react-input-mask";
import { NumericFormat } from 'react-number-format';

export default function EditOs() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deletedServices, setDeletedServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [minService, setMinService] = useState(false);
  const updateOsFormSchema = z.object({
    client: z.string().trim().min(1, 'Cliente é obrigatório!'),
    phone: z.string().optional(),
    date: z.string().min(1, 'Data é obrigatória!'),
    plate: z.string().min(1, 'Placa é obrigatória!'),
    model: z.string().min(1, 'Modelo é obrigatório!'),
    status: z.string(),
    services: z.array(
      z.object({
        cod: z.string().optional(),
        description: z.string(),
        quantity: z.string(),
        price: z.string(),
      })
    ),
  })

  const utils = trpc.useContext();

  const os = trpc.osById.useQuery(id || '');
  const services = trpc.serviceByOsId.useQuery(id || '');

  const updateOs = trpc.osUpdate.useMutation({
    onSuccess: (e) => {
      utils.os.invalidate();
    }
  });

  const deleteOs = trpc.osDelete.useMutation({
    onSuccess: (e) => {
      utils.os.invalidate();
    }
  })

  const updateService = trpc.serviceUpdate.useMutation({
    onSuccess: () => {
      utils.services.invalidate();
    }
  })

  const createService = trpc.serviceCreate.useMutation({
    onSuccess: () => {
      utils.services.invalidate();
    }
  })

  const deleteService = trpc.serviceDelete.useMutation({
    onSuccess: () => {
      utils.services.invalidate();
    }
  })

  type updateOsFormData = z.infer<typeof updateOsFormSchema>

  const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset } = useForm<updateOsFormData>({
    resolver: zodResolver(updateOsFormSchema)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  function addNewService() {
    append({
      cod: '',
      description: '',
      quantity: '',
      price: '',
    })
  }

  function removeService(index: number) {
    setDeletedServices((prevDeletedServices) => [...prevDeletedServices, fields[index].cod ?? '']);

    remove(index)
  }

  async function handlerUpdateOs(data: any) {
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
      status: data.status
    });

    for (const s of data.services) {
      if (s.description !== '' && s.quantity !== '' && s.price !== '') {
        if (s.cod === '') {
          await createService.mutate({
            description: s.description,
            quantity: Number(s.quantity),
            price: Number(s.price),
            os_id: result.id
          })
        } else {
          await updateService.mutate({
            id: Number(s.cod),
            description: s.description,
            quantity: Number(s.quantity),
            price: Number(s.price),
            os_id: result.id
          });
        }
      }
    }

    for (const deletedServiceId of deletedServices) {
      if (deletedServiceId !== '') {
        console.log(deletedServiceId)
        await deleteService.mutate(Number(deletedServiceId))
      }
    }

    navigate('/');
  }

  async function handleDeleteOs() {
    await deleteOs.mutate(id || '')
    navigate('/');
  }
  
  useEffect(() => {

    if (os.data && services.data) {
      const formattedData = {
        client: os.data.client_name,
        phone: os.data.phone || '',
        date: os.data.date,
        plate: os.data.plate,
        model: os.data.model,
        status: os.data.status,
        services: services.data.map((service) => ({
          cod: service.id.toString(),
          description: service.description,
          quantity: service.quantity.toString(),
          price: service.price.toString(),
          delete: false
        })),
      };

      reset(formattedData);

      setTotalPrice(services.data.map(i => i.price).reduce((a, t) => a + t, 0))
    }

  }, [os.data, services.data, reset]);
  
  function handlePriceChange(index: number, value: string) {
    const numericString = value.replace(/[^\d,.-]/g, "");
    const dotString = numericString.replace(",", ".");
    const newValue = parseFloat(dotString) || 0;

    setValue(`services.${index}.price`, newValue.toFixed(2), {
      shouldValidate: true,
    });

    const watchedServices = watch("services");

    const newTotalPrice = watchedServices.reduce((accumulator, current) => {
      const price = parseFloat(current.price) || 0;
      return accumulator + price;
    }, 0);

    setTotalPrice(Number(newTotalPrice.toFixed(2)));
  }

  function formatCurrency(value: any) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <div className="px-6 pt-8 w-full h-full">
      <div className='flex w-full'>
        <div className="w-full h-10 bg-white rounded pl-4 flex flex-row items-center font-semibold ">
          <button onClick={() => navigate('/')} className='hover:text-slate-500' >Ordem de Serviço</button>
          <div>
            <img src={IconNavigateNext} alt=">" width={16} height={16} />
          </div>
          <h1>Editar</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(handlerUpdateOs)}>
        <div className='w-full h-auto mb-3 mt-4 bg-white rounded p-4'>
          <div className='flex flex-row font-normal  gap-4'>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Cliente <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('client')}
              />
              {
                errors.client && <span className='text-[10px] mt-2 text-red-500'>{errors.client?.message}</span>
              }
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Telefone</label>
              <InputMask
                mask="(99) 9 99999999"
                type="text"
                value={watch(`phone`)}
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('phone')}
              />
            </div>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Data <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                {...register('date')}
              />
              {
                errors.date && <span className='text-[10px] mt-2 text-red-500'>{errors.date?.message}</span>
              }
            </div>
            <div className="w-full flex flex-col">
              <label className="mb-3">Status</label>
              <select
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("status")}
              >
                <option value="pending">Pendente</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>

          <div className='flex flex-row font-normal  gap-4 mt-4'>
            <div className='w-full flex flex-col'>
              <label className='mb-3'>Placa <span className='text-red-500'>*</span></label>
              <input
                type="text"
                className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
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
                {...register('model')}
              />
              {
                errors.model && <span className='text-[10px] mt-2 text-red-500'>{errors.model?.message}</span>
              }
            </div>
          </div>

          <div className="w-full mt-4">
            <label className=' font-normal'>Serviços</label>
          </div>
          <div className='border border-slate-200 w-full h-auto rounded mt-3 p-4'>
            {
              fields.map((field, index) => (
                <div className='flex flex-row font-normal  gap-4 mb-3' key={field.id}>
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
                    <NumericFormat
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      type="text"
                      value={watch(`services.${index}.price`)}
                      className='w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
                      {...register(`services.${index}.price`, {
                        onChange: (e) => handlePriceChange(index, e.target.value),
                      })}
                    />
                  </div>
                  {
                    fields.length == index + 1 ? (
                      <div className='w-[10%] flex flex-col'>
                        <label className='mb-3'>&nbsp;</label>
                        <button className='flex items-center justify-center font-normal  text-white w-full h-8 bg-teal-400 rounded' type='button' onClick={addNewService}>
                          <img src={IconPlus} alt="Adicionar serviço" width={8} height={8} />
                        </button>
                      </div>
                    ) : (
                      <div className='w-[10%] flex flex-col'>
                        <label className='mb-3'>&nbsp;</label>
                        <button className='flex items-center justify-center font-normal  bg-red-600 text-white w-full h-8 rounded' type='button' onClick={() => removeService(index)}>
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

          <div className='flex font-normal mt-3  gap-4 mb-3 justify-end mr-16'>
            <div className='flex flex-col'>
              <label className='mb-3'>Valor Total</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(totalPrice)}
                className='w-[352px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300'
              />
            </div>
          </div>
        </div>
        <div className='h-10 w-full flex-row flex justify-between'>
          <div className='flex flex-row'>
            <button onClick={() => navigate('/')}  className='flex items-center justify-center font-normal  text-white w-[69px] h-10 p-4 bg-slate-500 rounded'>
              Voltar
            </button>
          </div>
          <div className='flex flex-row'>
            <button onClick={() => handleDeleteOs()} className='flex items-center justify-center font-normal  text-white w-[69px] h-10 p-4 bg-red-500 rounded'>
              Deletar
            </button>
          </div>
          <div className='flex flex-row'>
            <button className='flex items-center justify-center font-normal  text-white w-[69px] h-10 p-4 bg-teal-400 rounded' type='submit' >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div >
  )
}
