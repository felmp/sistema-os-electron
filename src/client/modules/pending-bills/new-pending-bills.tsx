import IconNavigateNext from "../../../public/img/navigate-next.svg";
import IconPlus from "../../../public/img/plus.svg";
import IconRemove from "../../../public/img/close.svg";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
import { trpc } from "../../util";
import InputMask from "react-input-mask";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";

export default function NewPendingBills() {
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const [alertInstallments, setAlertInstallments] = useState("");
  const createPendingBillsFormSchema = z.object({
    title: z.string().trim().min(1, "Titulo é obrigatório!"),
    description: z.string().optional(),
    due_date: z.string().min(1, "Data é obrigatória!"),
    installments_quantity: z.string().min(1, "Quantidade é obrigatória!"),
    status: z.string().optional(),
    installments: z.array(
      z.object({
        description: z.string(),
        is_paid: z.boolean().optional(),
        payment_date: z.string().optional(),
        price: z.string(),
      })
    ),
  });

  const utils = trpc.useContext();
  const addPendingBills = trpc.pendingBillCreate.useMutation({
    onSuccess: (e) => {
      utils.pendingBills.invalidate();
    },
  });

  const addInstallments = trpc.installmentCreate.useMutation({
    onSuccess: () => {
      utils.installments.invalidate();
    },
  });

  type CreatePendingBillsFormData = z.infer<
    typeof createPendingBillsFormSchema
  >;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePendingBillsFormData>({
    defaultValues: {
      installments: [
        {
          description: `Parcela 1`,
          price: "",
        },
      ],
    },
    resolver: zodResolver(createPendingBillsFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "installments",
  });

  function addNewInstallments() {
    append({
      description: `Parcela ${fields.length + 1}`,
      is_paid: false,
      payment_date: "",
      price: "",
    });
  }

  function removeInstallments(index: number) {
    const removedItem = fields[index];
    remove(index);

    const newTotalPrice = totalPrice - parseFloat(removedItem.price) || 0;
    setTotalPrice(newTotalPrice);
  }

  async function createPendingBills(data: any) {
    if (
      !data.installments.find(
        (s: any) => s.description !== "" && s.price !== ""
      )
    ) {
      setAlertInstallments("É necessário pelo menos 1 parcela.");
      return;
    }

    const result = await addPendingBills.mutateAsync({
      description: data.description,
      installments_quantity: Number(data.installments_quantity),
      due_date: data.due_date,
      price: Number(
        data.installments
          .map((i: any) => Number(i.price))
          .reduce((a: any, t: any) => Number(a) + Number(t), 0)
      ),
      title: data.title,
      status: data.installments.some((e: any) => e.is_paid == false)
        ? "pending"
        : "paid",
    });

    for (const s of data.installments) {
      if (s.description !== "" && s.price !== "") {
        await addInstallments.mutate({
          description: s.description,
          payment_date: s.payment_date,
          is_paid: s.is_paid,
          price: Number(s.price),
          pending_bill_id: result.id,
        });
      }
    }

    navigate("/contas-pagar");
  }

  function handlePriceChange(index: number, value: string) {
    const numericString = value.replace(/[^\d,.-]/g, "");
    const dotString = numericString.replace(",", ".");
    const newValue = parseFloat(dotString) || 0;

    setValue(`installments.${index}.price`, newValue.toFixed(2), {
      shouldValidate: true,
    });

    const watchedInstallments = watch("installments");

    const newTotalPrice = watchedInstallments.reduce((accumulator, current) => {
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const filesArray: File[] = Array.from(selectedFiles);
      setFiles([...files, ...filesArray]);
    }
  };

  async function handleSaveFile() {
    try {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append(`file${index + 1}`, file);
      });

      await fetch(
        "https://www.filestackapi.com/api/store/S3?key=AsbaKfmdYTGqcimFvGdYQz",
        {
          method: "POST",

          body: formData,
        }
      )
        .then((response) => response.body)
        .then((body) => {
          const reader = body?.getReader();

          console.log(reader);
        });

      // if (response.ok) {
      //   console.log("Files saved successfully!");
      //   console.log(response.body?.getReader());
      // } else {
      //   console.error("Failed to save files:", response.statusText);
      // }
    } catch (error) {
      console.error("An error occurred while saving files:", error);
    }
  }

  const handleIsPaidChange = (e: any, index: number) => {
    const isPaid = e.target.checked;
    setValue(`installments.${index}.is_paid`, isPaid);

    if (isPaid) {
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getDate()).padStart(
        2,
        "0"
      )}/${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}/${currentDate.getFullYear()}`;

      setValue(`installments.${index}.payment_date`, formattedDate);
    }
  };

  return (
    <div className="px-6 pt-8 w-full h-full">
      <div className="flex w-full">
        <div className="w-full h-10 bg-white rounded pl-4 flex flex-row items-center font-semibold ">
          <button onClick={() => navigate("/contas-pagar")} className="hover:text-slate-500">
            Contas a Pagar
          </button>
          <div>
            <img src={IconNavigateNext} alt=">" width={16} height={16} />
          </div>
          <h1>Novo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(createPendingBills)}>
        <div className="w-full h-auto mb-3 mt-4 bg-white rounded p-4">
          <div className="flex flex-row font-normal  gap-4">
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Titulo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.title?.message}
                </span>
              )}
            </div>
            <div className="w-full flex flex-col">
              <label className="mb-3">Descrição</label>
              <input
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("description")}
              />
            </div>
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Data de Vencimento<span className="text-red-500">*</span>
              </label>
              <InputMask
                mask="99/99/9999"
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("due_date")}
              />
              {errors.due_date && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.due_date?.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-row font-normal  gap-4 mt-4">
            <div className="w-full flex flex-col">
              <label className="mb-3">
                Numero de parcelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                {...register("installments_quantity")}
              />
              {errors.installments_quantity && (
                <span className="text-[10px] mt-2 text-red-500">
                  {errors.installments_quantity?.message}
                </span>
              )}
            </div>
          </div>

          <div className="w-full mt-4">
            <label className=" font-normal">Parcelas</label>
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
                    {...register(`installments.${index}.description`)}
                  />
                </div>
                <div className="w-[100px] flex flex-col">
                  <label className="mb-3">Paga</label>
                  <input
                    type="checkbox"
                    className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                    {...register(`installments.${index}.is_paid`, {
                      onChange: (e) => handleIsPaidChange(e, index),
                    })}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="mb-3">Data de Pagamento</label>
                  <InputMask
                    mask="99/99/9999"
                    type="text"
                    value={watch(`installments.${index}.payment_date`)}
                    className="w-full h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                    {...register(`installments.${index}.payment_date`)}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="mb-3">Valor</label>
                  <NumericFormat
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={false}
                    className="w-[550px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
                    {...register(`installments.${index}.price`, {
                      onChange: (e) => handlePriceChange(index, e.target.value),
                    })}
                  />
                </div>
                {fields.length == index + 1 ? (
                  <div className="w-[20%] flex flex-col justify-end">
                    <label className="mb-3">&nbsp;</label>
                    <button
                      className="flex items-center justify-center font-normal  text-white w-full h-8 bg-teal-400 rounded"
                      type="button"
                      onClick={addNewInstallments}
                    >
                      <img
                        src={IconPlus}
                        alt="Adicionar parcelas"
                        width={8}
                        height={8}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="w-[20%] flex flex-col justify-end">
                    <label className="mb-3">&nbsp;</label>
                    <button
                      className="flex items-center justify-center font-normal  bg-red-600 text-white w-full h-8 rounded"
                      type="button"
                      onClick={() => removeInstallments(index)}
                    >
                      <img
                        src={IconRemove}
                        alt="Remover parcelas"
                        width={8}
                        height={8}
                      />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {alertInstallments !== "" && (
              <span className="text-[10px] mt-2 text-red-500">
                {alertInstallments}
              </span>
            )}
          </div>

          <div className="flex font-normal mt-3  gap-4 mb-3 justify-end mr-16">
            <div className="flex flex-col">
              <label className="mb-3">Valor Total</label>
              <input
                readOnly
                value={formatCurrency(totalPrice)}
                className="w-[550px] h-[32px] rounded pl-2 border border-slate-200 focus:outline-slate-300"
              />
            </div>
          </div>

          {/* <div className="w-full mt-4">
            <label className=' font-normal'>Anexos</label>
          </div> */}

          {/* <PickerOverlay
            apikey={'AsbaKfmdYTGqcimFvGdYQz'}
            onUploadDone={(res) => console.log(res)}
          /> */}

          {/* <div className='border border-slate-200 w-full h-auto rounded mt-3 p-4'>
            <input
              type="file"
              onChange={handleFileChange}
              className='w-full h-8 p-1 border-slate-200 focus:outline-slate-300'
            />
            {
              files.map(f => (
                <div className="w-full flex flex-row mt-4 p-4 rounded border" key={f.name}>
                  <label className=' w-full flex items-center font-normal'>{f.name}</label>
                  <button className='flex items-center justify-center mr-2 font-normal  bg-blue-600 text-white w-10 h-10 rounded' type='button' onClick={() => files}>
                    <img src={IconDownload} alt="Baixar anexo" width={20} height={20} />
                  </button>
                  <button className='flex items-center justify-center font-normal  bg-red-600 text-white w-10 h-10 rounded' type='button' onClick={() => files}>
                    <img src={IconRemove} alt="Remover arquivo" width={8} height={8} />
                  </button>
                </div>
              ))
            }

          </div> */}
        </div>
        <div className="h-10 w-full flex-row flex justify-between">
          <div className="flex flex-row">
            <button
              onClick={() => navigate("/contas-pagar")}
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
