export const USERS = {
  COMPANY: {
    ID: "company-1",
    NAME: "Tech Soluções",
    TYPE: "company" as const
  },
  WORKER: {
    ID: "worker-1",
    NAME: "João Silva",
    TYPE: "worker" as const
  }
} as const

export type UserType = typeof USERS.COMPANY.TYPE | typeof USERS.WORKER.TYPE
