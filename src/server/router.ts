import { initTRPC } from '@trpc/server';
import { prisma } from './prisma';
import * as z from 'zod';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

export const appRouter = t.router({
  os: t.procedure
    .query(() => {
      return prisma.os.findMany();
    }),
  osById: t.procedure
    .input(z.string())
    .query(({ input: id }) => {
      // return `this is number `;
      const os = prisma.os.findUnique({
        where: {
          id: Number(id),
        }
      })

      return os
    }),
  osCreate: t.procedure
    .input(z.object({
      client_name: z.string().trim().min(1, 'Cliente é obrigatório!'),
      phone: z.string().optional(),
      date: z.string().min(1, 'Data é obrigatória!'),
      plate: z.string().min(1, 'Placa é obrigatória!'),
      model: z.string().min(1, 'Modelo é obrigatório!'),
      status: z.string().min(1, 'Status é obrigatório!'),
    }))
    .mutation(async ({ input: { client_name, date, model, phone, plate, status } }) => {
      const os = await prisma.os.create({
        data: {
          client_name,
          date,
          model,
          phone,
          plate,
          status
        }
      });

      return os;
    }),
  osDelete: t.procedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      const deletedOs = await prisma.os.delete({
        where: {
          id: Number(id),
        },
      });

      return deletedOs;
    }),
  osUpdate: t.procedure
    .input(z.object({
      id: z.string(),
      client_name: z.string().optional(),
      phone: z.string().optional(),
      date: z.string().optional(),
      plate: z.string().optional(),
      model: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updatedFields } = input;

      const updatedOs = await prisma.os.update({
        where: {
          id: Number(id),
        },
        data: updatedFields,
      });

      return updatedOs;
    }),
  services: t.procedure
    .query(() => {
      return prisma.service.findMany();
    }),
  serviceByOsId: t.procedure.input(z.string()).query(({ input: id }) => {
    const services = prisma.service.findMany({
      where: {
        os_id: Number(id)
      }
    })

    return services
  }),
  serviceById: t.procedure
    .input(z.number().int())
    .query(({ input: id }) => {
      return prisma.service.findUnique({
        where: {
          id,
        }
      })
    }),
  serviceCreate: t.procedure
    .input(z.object({
      description: z.string().trim().min(1, 'Descrição é obrigatória'),
      quantity: z.number().min(1, 'Quantidade é obrigatória!'),
      price: z.number().min(1, 'Preço é obrigatório!'),
      os_id: z.number(),
    }))
    .mutation(async ({ input: { description, price, quantity, os_id } }) => {
      const service = await prisma.service.create({
        data: {
          description,
          price,
          quantity,
          os_id
        }
      });

      return service;
    }),
  serviceDelete: t.procedure
    .input(z.number().int())
    .mutation(async ({ input: id }) => {
      const deletedService = await prisma.service.delete({
        where: {
          id,
        },
      });

      return deletedService;
    }),
  serviceUpdate: t.procedure
    .input(z.object({
      id: z.number().int(),
      description: z.string().optional(),
      quantity: z.number().optional(),
      price: z.number().optional(),
      os_id: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updatedFields } = input;

      const updatedService = await prisma.service.update({
        where: {
          id,
        },
        data: updatedFields,
      });

      return updatedService;
    }),
  pendingBills: t.procedure
    .query(() => {
      return prisma.pendingBills.findMany();
    }),
  pendingBillById: t.procedure
    .input(z.string())
    .query(({ input: id }) => {
      return prisma.pendingBills.findUnique({
        where: {
          id: Number(id),
        }
      })
    }),
  pendingBillCreate: t.procedure
    .input(z.object({
      title: z.string().trim().min(1, 'Descrição é obrigatória'),
      due_date: z.string().trim().min(1, 'Descrição é obrigatória'),
      description: z.string().trim(),
      price: z.number().min(1, 'Preço é obrigatório!'),
      installments_quantity: z.number().min(1, 'Quantidade é obrigatória!'),
      status: z.string().min(1, 'Stauts é obrigatório!'),
    }))
    .mutation(async ({ input: { description, installments_quantity, price, title, due_date, status } }) => {
      const pendingBills = await prisma.pendingBills.create({
        data: {
          description,
          price,
          title,
          due_date,
          installments_quantity,
          status,
        }
      });

      return pendingBills;
    }),
  pendingBillDelete: t.procedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      const deletedPendingBill = await prisma.pendingBills.delete({
        where: {
          id: Number(id),
        },
      });

      return deletedPendingBill;
    }),
  pendingBillUpdate: t.procedure
    .input(z.object({
      id: z.string(),
      title: z.string().trim().min(1, 'Titulo é obrigatório'),
      due_date: z.string().trim().min(1, 'Vencimento é obrigatório'),
      description: z.string().trim(),
      price: z.number().min(1, 'Preço é obrigatório!'),
      installments_quantity: z.number().min(1, 'Quantidade é obrigatória!'),
      status: z.string().min(1, 'Stauts é obrigatório!'),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updatedFields } = input;

      const updatedPendingBill = await prisma.pendingBills.update({
        where: {
          id: Number(id),
        },
        data: updatedFields,
      });

      return updatedPendingBill;
    }),
  installments: t.procedure
    .query(() => {
      return prisma.installments.findMany();
    }),
  installmentById: t.procedure
    .input(z.string())
    .query(({ input: id }) => {
      return prisma.installments.findUnique({
        where: {
          id: Number(id),
        }
      })
    }),
  installmentByPendingBillId: t.procedure
  .input(z.string())
  .query(({ input: id }) => {
    return prisma.installments.findMany({
      where: {
        pending_bill_id: Number(id),
      }
    })
  }),
  installmentCreate: t.procedure
    .input(z.object({
      is_paid: z.boolean(),
      payment_date: z.string().trim(),
      pending_bill_id: z.number(),
      price: z.number().min(1, 'Preço é obrigatório!'),
      description: z.string().trim().min(1, 'Descrição é obrigatória'),
    }))
    .mutation(async ({ input: { description, price, payment_date, is_paid, pending_bill_id } }) => {
      const installments = await prisma.installments.create({
        data: {
          is_paid,
          payment_date,
          price,
          pending_bill_id,
          description,
        }
      });

      return installments;
    }),
  installmentsUpdate: t.procedure
    .input(z.object({
      id: z.number().int(),
      is_paid: z.boolean().optional(),
      payment_date: z.string().trim().optional(),
      description: z.string().trim().optional(),
      pending_bill_id: z.number().optional(),
      price: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updatedFields } = input;

      const updatedInstallments = await prisma.installments.update({
        where: {
          id,
        },
        data: updatedFields,
      });

      return updatedInstallments;
    }),
  installmentDelete: t.procedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      const deletedInstallment = await prisma.installments.delete({
        where: {
          id: Number(id),
        },
      });

      return deletedInstallment;
    }),
});

export type AppRouter = typeof appRouter;
