import IconNavigateNext from "../../../public/img/navigate-next.svg";
import IconPlus from "../../../public/img/plus.svg";
import IconRemove from "../../../public/img/close.svg";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { trpc } from "../../util";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import InputMask from "react-input-mask";

export default function NewOs() {
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(0);
  const [minService, setMinService] = useState(false);
  const createOsFormSchema = z.object({
    client: z.string().trim().min(1, "Cliente é obrigatório!"),
    phone: z.string().optional(),
    date: z.string().min(1, "Data é obrigatória!"),
    plate: z.string().min(1, "Placa é obrigatória!"),
    model: z.string().min(1, "Modelo é obrigatório!"),
    status: z.enum(["pending", "completed"]).optional(),
    observation: z.string().optional(),
    services: z.array(
      z.object({
        description: z.string(),
        quantity: z.string(),
        price: z.string(),
      })
    ),
  });

  const utils = trpc.useContext();
  const addOs = trpc.osCreate.useMutation({
    onSuccess: (e) => {
      utils.os.invalidate();
    },
  });

  const addService = trpc.serviceCreate.useMutation({
    onSuccess: () => {
      utils.os.invalidate();
    },
  });

  type CreateOsFormData = z.infer<typeof createOsFormSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateOsFormData>({
    defaultValues: {
      status: "pending",
      services: [
        {
          description: "",
          quantity: "",
          price: "",
        },
      ],
    },
    resolver: zodResolver(createOsFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  function addNewService() {
    append({
      description: "",
      quantity: "",
      price: "",
    });
  }

  function removeService(index: number) {
    remove(index);
  }

  async function createOs(data: any) {
    console.log(data);
    if (
      !data.services.find(
        (s: any) =>
          s.description !== "" && s.description !== "" && s.price !== ""
      )
    ) {
      setMinService(true);
      return;
    }

    setMinService(false);

    const result = await addOs.mutateAsync({
      client_name: data.client,
      date: data.date,
      model: data.model,
      plate: data.plate,
      phone: data.phone,
      status: data.status,
      observation: data.observation,
    });

    for (const s of data.services) {
      if (s.description !== "" && s.quantity !== "" && s.price !== "") {
        await addService.mutate({
          description: s.description,
          quantity: Number(s.quantity),
          price: Number(s.price),
          os_id: result.id,
        });
      }
    }

    navigate("/");
  }

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
      <div className="flex w-full">
        <div className="w-full h-10 bg-white rounded pl-4 flex flex-row items-center font-semibold ">
          <button
            onClick={() => navigate("/")}
            className="hover:text-slate-500"
          >
            Ordem de Serviço
          </button>
          <div>
            <img src={IconNavigateNext} alt=">" width={16} height={16} />
          </div>
          <h1>Novo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(createOs)}>
        <div className="w-full h-auto mb-3 mt-4 bg-white rounded p-4">
          <div className="flex flex-row font-normal  gap-4">
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("client")}
              />
              {errors.client && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.client?.message}
                </span>
              )}
            </div>
            <div className="w-full flex flex-col">
              <label className="mb-3">Telefone</label>
              <InputMask
                mask="(99) 9 99999999"
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("phone")}
              />
            </div>
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Data <span className="text-red-500">*</span>
              </label>
              <InputMask
                mask="99/99/9999"
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("date")}
              />
              {errors.date && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.date?.message}
                </span>
              )}
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

          <div className="flex flex-row font-normal  gap-4 mt-4">
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Placa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("plate")}
              />
              {errors.plate && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.plate?.message}
                </span>
              )}
            </div>
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("model")}
              />
              {errors.model && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.model?.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-row font-normal gap-4 mt-4">
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Observação 
              </label>
              <textarea
                rows={4}
                className="w-full h-auto rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("observation")}
              />
            </div>
          </div>

          <div className="w-full mt-4">
            <label className=" font-normal">Serviços</label>
          </div>
          <div className="border border-slate-200 w-full h-auto rounded mt-3 p-4">
            {fields.map((field, index) => (
              <div
                className="flex flex-row font-normal  gap-4 mb-3"
                key={field.id}
              >
                <div className="w-full flex flex-col">
                  <label className="mb-3">Descrição</label>
                  <input
                    type="text"
                    className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                    {...register(`services.${index}.description`)}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="mb-3">Qtd</label>
                  <input
                    type="text"
                    className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                    {...register(`services.${index}.quantity`)}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="mb-3">Valor</label>
                  <NumericFormat
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    type="text"
                    className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                    {...(register(`services.${index}.price`),
                    {
                      onChange: (e) => handlePriceChange(index, e.target.value),
                    })}
                  />
                </div>
                {fields.length == index + 1 ? (
                  <div className="w-[10%] flex flex-col">
                    <label className="mb-3">&nbsp;</label>
                    <button
                      className="flex items-center justify-center font-normal  text-white w-full h-8 bg-teal-400 rounded"
                      type="button"
                      onClick={addNewService}
                    >
                      <img
                        src={IconPlus}
                        alt="Adicionar serviço"
                        width={8}
                        height={8}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="w-[10%] flex flex-col">
                    <label className="mb-3">&nbsp;</label>
                    <button
                      className="flex items-center justify-center font-normal  bg-red-600 text-white w-full h-8 rounded"
                      type="button"
                      onClick={() => removeService(index)}
                    >
                      <img
                        src={IconRemove}
                        alt="Remover serviço"
                        width={8}
                        height={8}
                      />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {minService && (
            <span className="text-[10px] mt-2 text-red-500">
              Digite pelo menos 1 serviço!
            </span>
          )}

          <div className="flex font-normal mt-3  gap-4 mb-3 justify-end mr-16">
            <div className="flex flex-col">
              <label className="mb-3">Valor Total</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(totalPrice)}
                className="w-[352px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
              />
            </div>
          </div>
        </div>
        <div className="h-10 w-full flex-row flex justify-between">
          <div className="flex flex-row">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center font-normal  text-white w-[69px] h-10 p-4 bg-slate-500 rounded"
            >
              Voltar
            </button>
          </div>
          <div className="flex flex-row">
            <button
              className="flex items-center justify-center font-normal  text-white w-[69px] h-10 p-4 bg-teal-400 rounded"
              type="submit"
            >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
