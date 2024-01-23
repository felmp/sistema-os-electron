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
    .input(z.number().int())
    .query(({ input: id }) => {
      return prisma.os.findUnique({
        where: {
          id,
        }
      })
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
  services: t.procedure
    .query(() => {
      return prisma.service.findMany();
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
  pendingBills: t.procedure
    .query(() => {
      return prisma.pendingBills.findMany();
    }),
  pendingBillById: t.procedure
    .input(z.number().int())
    .query(({ input: id }) => {
      return prisma.pendingBills.findUnique({
        where: {
          id,
        }
      })
    }),
  pendingBillCreate: t.procedure
    .input(z.object({
      title: z.string().trim().min(1, 'Descrição é obrigatória'),
      due_date: z.string().trim().min(1, 'Descrição é obrigatória'),
      description: z.string().trim().min(1, 'Descrição é obrigatória'),
      price: z.number().min(1, 'Preço é obrigatório!'),
    }))
    .mutation(async ({ input: { description, price, title, due_date } }) => {
      const pendingBills = await prisma.pendingBills.create({
        data: {
          description,
          price,
          title,
          due_date
        }
      });

      return pendingBills;
    }),
  installments: t.procedure
    .query(() => {
      return prisma.installments.findMany();
    }),
  installmentById: t.procedure
    .input(z.number().int())
    .query(({ input: id }) => {
      return prisma.installments.findUnique({
        where: {
          id,
        }
      })
    }),
  installmentCreate: t.procedure
    .input(z.object({
      is_paid: z.boolean(),
      payment_date: z.string().trim(),
      description: z.string().trim().min(1, 'Descrição é obrigatória'),
      pending_bill_id: z.number(),
      price: z.number().min(1, 'Preço é obrigatório!'),
    }))
    .mutation(async ({ input: { description, price, payment_date, is_paid, pending_bill_id } }) => {
      const installments = await prisma.installments.create({
        data: {
          is_paid,
          payment_date,
          price,
          pending_bill_id
        }
      });

      return installments;
    })
});

export type AppRouter = typeof appRouter;
